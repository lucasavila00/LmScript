import { assertIsNever, delay, NOOP } from "../utils";
import {
  AbstractBackend,
  ExecutionCallbacks,
  GenerateTask,
  GenerationThread,
  ReportUsage,
  SelectTask,
  Task,
  TasksOutput,
  XmlTask,
} from "./abstract";
import { BaseExecutor } from "./executor";

class VllmBackendExecutor extends BaseExecutor {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  readonly #auth: string | undefined;
  readonly callbacks: ExecutionCallbacks;

  constructor(options: {
    url: string;
    auth?: string;
    model: string;
    reportUsage?: ReportUsage;
    data: GenerationThread;
    callbacks: ExecutionCallbacks;
  }) {
    super(options.data);
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#auth = options.auth;
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

  override async doGeneration(task: GenerateTask): Promise<string> {
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
    return captured;
  }
  override async doSelect(task: SelectTask): Promise<string> {
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
    return captured;
  }
  async #handleXmlTask(task: XmlTask) {
    switch (task.schema.type) {
      case "discriminatedUnion": {
        await this.handleXmlDiscriminatedUnion([task.name], task.schema);
        this.callbacks.onCapture({
          name: task.name,
          value: this.state.captured[task.name],
        });
        break;
      }
      case "object": {
        await this.handleXmlObject([task.name], task.schema);
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

  async #handleGenerateTask(task: GenerateTask) {
    const captured = await this.doGeneration(task);
    if (task.name != null) {
      this.state.captured[task.name] = captured;
      this.callbacks.onCapture({
        name: task.name,
        value: captured,
      });
    }
  }

  async #handleSelectTask(task: SelectTask) {
    const captured = await this.doSelect(task);
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
        await this.#handleSelectTask(task);
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
      // case "JsonSchemaTask": {
      //   // deno-lint-ignore no-explicit-any
      //   const json = await this.#fetchJSON<any>({
      //     model: this.#model,
      //     prompt: this.state.text,
      //     guided_json: task.jsonSchema,
      //     temperature: this.data.sampling_params.temperature,
      //     top_p: this.data.sampling_params.top_p,
      //     top_k: this.data.sampling_params.top_k,
      //     frequency_penalty: this.data.sampling_params.frequency_penalty,
      //     presence_penalty: this.data.sampling_params.presence_penalty,
      //     max_tokens: task.max_tokens,
      //   });
      //   this.#reportUsage({
      //     promptTokens: json.usage.prompt_tokens,
      //     completionTokens: json.usage.completion_tokens,
      //   });
      //   const captured = json.choices[0].text;
      //   this.state.text += captured;
      //   if (task.name != null) {
      //     this.state.captured[task.name] = JSON.parse(captured);
      //     this.callbacks.onCapture({
      //       name: task.name,
      //       value: JSON.parse(captured),
      //     });
      //   }
      //   break;
      // }
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
