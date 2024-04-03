import { ObjectSchemaData, SchemaData } from "../schema";
import { assertIsNever, delay, NOOP } from "../utils";
import {
  AbstractBackend,
  ClientState,
  ExecutionCallbacks,
  GenerateTask,
  GenerationThread,
  ReportUsage,
  Task,
  TasksOutput,
  XmlTask,
} from "./abstract";

class VllmBackendExecutor {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  readonly #auth: string | undefined;
  readonly data: GenerationThread;
  readonly callbacks: ExecutionCallbacks;
  state: ClientState;
  constructor(options: {
    url: string;
    auth?: string;
    model: string;
    reportUsage?: ReportUsage;
    data: GenerationThread;
    callbacks: ExecutionCallbacks;
  }) {
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#auth = options.auth;

    this.data = options.data;
    this.state = JSON.parse(JSON.stringify(this.data.initial_state));
    this.callbacks = options.callbacks;
  }
  async #fetchJSONNoRet<T>(body: object): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.#auth != null) {
      headers["Authorization"] = `Bearer ${this.#auth}`;
    }
    const response = await fetch(`${this.#url}/v1/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = await response.json();
    return json;
  }
  async #fetchJSON<T>(body: object): Promise<T> {
    let lastError: unknown = null;
    for (let i = 1; i < 5; i++) {
      try {
        if (lastError != null) {
          await delay(1000 * i * i);
        }
        return await this.#fetchJSONNoRet<T>(body);
      } catch (e) {
        console.error(e);
        console.log("Retrying...");
        lastError = e;
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }

  async #handleXmlField(path: string[], key: string, data: SchemaData) {
    const newFullPath = [...path, key];
    switch (data.type) {
      case "array":
        throw new Error("Not implemented");
      case "enum":
        throw new Error("Not implemented");
      case "literal":
        throw new Error("Not implemented");
      case "null":
        this.state.text += `<${key} type="null">null</${key}>\n`;
        this.#writeToPath(newFullPath, null);
        break;
      case "object":
        await this.#handleXmlObject(newFullPath, data);
        break;
      case "boolean":
        throw new Error("Not implemented");
      case "number":
        this.state.text += `<${key} type="${data.type}">`;
        await this.#handleGeneratePath({ stop: ["</"] }, newFullPath);

        let current = this.state.captured;
        for (const key of path) {
          if (current[key] == null) {
            current[key] = {};
          }
          current = current[key] as any;
        }
        current[key] = parseFloat(current[key] as any);
        this.state.text += `</${key}>\n`;
        break;
      case "string":
        this.state.text += `<${key} type="${data.type}">`;
        await this.#handleGeneratePath({ stop: ["</"] }, newFullPath);
        this.state.text += `</${key}>\n`;
        break;
      case "discriminatedUnion":
        throw new Error("Not implemented");
      default:
        return assertIsNever(data);
    }
  }
  async #handleXmlObject(path: string[], schema: ObjectSchemaData) {
    this.state.text += `<${schema.title}>\n`;
    for (const key of Object.keys(schema.children)) {
      const field = schema.children[key];
      await this.#handleXmlField(path, key, field);
    }
    this.state.text += `</${schema.title}>\n`;
  }
  async #handleXmlTask(task: XmlTask) {
    switch (task.schema.type) {
      case "discriminatedUnion": {
        throw new Error("Not implemented");
      }
      case "object": {
        await this.#handleXmlObject([task.name], task.schema);
        this.callbacks.onCapture({
          name: task.name,
          value: this.state.captured[task.name],
        });
        break;
      }
      default: {
        return assertIsNever(task.schema);
      }
    }
  }
  async #writeToPath(path: string[], captured: unknown) {
    // create empty objects for each path element
    let current = this.state.captured;

    for (const key of path.slice(0, -1)) {
      if (current[key] == null) {
        current[key] = {};
      }
      current = current[key] as any;
    }

    const lastPath = path[path.length - 1];
    current[lastPath] = captured;
  }
  async #handleGeneratePath(task: { stop: string[] }, path: string[]) {
    const json = await this.#fetchJSON<any>({
      model: this.#model,
      prompt: this.state.text,
      max_tokens: 1024,
      stop: task.stop,
      guided_regex: undefined,
      temperature: this.data.sampling_params.temperature,
      top_p: this.data.sampling_params.top_p,
      top_k: this.data.sampling_params.top_k,
      frequency_penalty: this.data.sampling_params.frequency_penalty,
      presence_penalty: this.data.sampling_params.presence_penalty,
    });
    this.#reportUsage({
      promptTokens: json.usage.prompt_tokens,
      completionTokens: json.usage.completion_tokens,
    });
    const captured = json.choices[0].text;
    this.state.text += captured;
    this.#writeToPath(path, captured);
  }
  async #handleGenerateTask(task: GenerateTask) {
    const json = await this.#fetchJSON<any>({
      model: this.#model,
      prompt: this.state.text,
      max_tokens: task.max_tokens,
      stop: task.stop,
      guided_regex: task.regex,
      temperature: this.data.sampling_params.temperature,
      top_p: this.data.sampling_params.top_p,
      top_k: this.data.sampling_params.top_k,
      frequency_penalty: this.data.sampling_params.frequency_penalty,
      presence_penalty: this.data.sampling_params.presence_penalty,
    });
    this.#reportUsage({
      promptTokens: json.usage.prompt_tokens,
      completionTokens: json.usage.completion_tokens,
    });
    const captured = json.choices[0].text;
    this.state.text += captured;
    if (task.name != null) {
      this.state.captured[task.name] = captured;
      this.callbacks.onCapture({
        name: task.name,
        value: captured,
      });
    }
  }
  private async handleTask(task: Task) {
    switch (task.tag) {
      case "AddTextTask": {
        this.state.text += task.text;
        break;
      }
      case "GenerateTask": {
        await this.#handleGenerateTask(task);
        break;
      }
      case "SelectTask": {
        // deno-lint-ignore no-explicit-any
        const json = await this.#fetchJSON<any>({
          model: this.#model,
          prompt: this.state.text,
          guided_choice: task.choices,
          temperature: this.data.sampling_params.temperature,
          top_p: this.data.sampling_params.top_p,
          top_k: this.data.sampling_params.top_k,
          frequency_penalty: this.data.sampling_params.frequency_penalty,
          presence_penalty: this.data.sampling_params.presence_penalty,
        });
        this.#reportUsage({
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens,
        });
        const captured = json.choices[0].text;
        this.state.text += captured;
        if (task.name != null) {
          this.state.captured[task.name] = captured;
          this.callbacks.onCapture({
            name: task.name,
            value: captured,
          });
        }
        break;
      }
      case "RepeatTask": {
        const captured = this.state.captured[task.variable];
        if (captured == null) {
          throw new Error(`No captured value for ${task.variable}`);
        }
        this.state.text += captured;
        break;
      }
      case "MatchTask": {
        const value = this.state.captured[task.variable];
        if (value == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        const tasks = task.choices[value as any];
        if (tasks == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        for (const innerTask of tasks) {
          await this.handleTask(innerTask);
        }
        break;
      }
      case "JsonSchemaTask": {
        // deno-lint-ignore no-explicit-any
        const json = await this.#fetchJSON<any>({
          model: this.#model,
          prompt: this.state.text,
          guided_json: task.jsonSchema,
          temperature: this.data.sampling_params.temperature,
          top_p: this.data.sampling_params.top_p,
          top_k: this.data.sampling_params.top_k,
          frequency_penalty: this.data.sampling_params.frequency_penalty,
          presence_penalty: this.data.sampling_params.presence_penalty,
          max_tokens: task.max_tokens,
        });
        this.#reportUsage({
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens,
        });
        const captured = json.choices[0].text;
        this.state.text += captured;
        if (task.name != null) {
          this.state.captured[task.name] = JSON.parse(captured);
          this.callbacks.onCapture({
            name: task.name,
            value: JSON.parse(captured),
          });
        }
        break;
      }
      case "XmlTask": {
        await this.#handleXmlTask(task);
        break;
      }
      default: {
        return assertIsNever(task);
      }
    }
  }
  async executeJSON(): Promise<TasksOutput> {
    for (const task of this.data.tasks) {
      await this.handleTask(task);
    }
    return this.state;
  }
}

/**
 * Backend for the VLLM OpenAI API.
 */
export class VllmBackend implements AbstractBackend {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  readonly #auth: string | undefined;
  constructor(options: { url: string; auth?: string; model: string; reportUsage?: ReportUsage }) {
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#auth = options.auth;
  }
  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<TasksOutput> {
    const executor = new VllmBackendExecutor({
      url: this.#url,
      model: this.#model,
      reportUsage: this.#reportUsage,
      auth: this.#auth,
      data,
      callbacks,
    });
    return executor.executeJSON();
  }
}
