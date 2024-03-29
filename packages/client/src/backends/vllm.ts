import { assertIsNever, delay, NOOP } from "../utils";
import {
  AbstractBackend,
  ExecutionCallbacks,
  GenerationThread,
  ReportUsage,
  Task,
  TasksOutput,
} from "./abstract";

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
        lastError = e;
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }
  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<TasksOutput> {
    // const headers: Record<string, string> = {
    //   "Content-Type": "application/json",
    // };
    // if (this.#auth != null) {
    //   headers["Authorization"] = `Bearer ${this.#auth}`;
    // }

    // const response = await fetch(`${this.#url}/v1/models`, {
    //   method: "GET",
    //   headers,
    // });
    // if (!response.ok) {
    //   throw new Error(`HTTP error: ${response.status}`);
    // }
    // const json = await response.json();
    // console.log(json);
    // console.log(JSON.stringify(json));
    // throw new Error("Not implemented");

    const state = JSON.parse(JSON.stringify(data.initial_state));

    const handleTask = async (task: Task) => {
      switch (task.tag) {
        case "AddTextTask": {
          state.text += task.text;
          break;
        }
        case "GenerateTask": {
          // deno-lint-ignore no-explicit-any
          const json = await this.#fetchJSON<any>({
            model: this.#model,
            prompt: state.text,
            max_tokens: task.max_tokens,
            stop: task.stop,
            guided_regex: task.regex,
            temperature: data.sampling_params.temperature,
            top_p: data.sampling_params.top_p,
            top_k: data.sampling_params.top_k,
            frequency_penalty: data.sampling_params.frequency_penalty,
            presence_penalty: data.sampling_params.presence_penalty,
          });
          this.#reportUsage({
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
          });
          const captured = json.choices[0].text;
          state.text += captured;
          if (task.name != null) {
            state.captured[task.name] = captured;
            callbacks.onCapture({
              name: task.name,
              value: captured,
            });
          }
          break;
        }
        case "SelectTask": {
          // deno-lint-ignore no-explicit-any
          const json = await this.#fetchJSON<any>({
            model: this.#model,
            prompt: state.text,
            guided_choice: task.choices,
            temperature: data.sampling_params.temperature,
            top_p: data.sampling_params.top_p,
            top_k: data.sampling_params.top_k,
            frequency_penalty: data.sampling_params.frequency_penalty,
            presence_penalty: data.sampling_params.presence_penalty,
          });
          this.#reportUsage({
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
          });
          const captured = json.choices[0].text;
          state.text += captured;
          if (task.name != null) {
            state.captured[task.name] = captured;
            callbacks.onCapture({
              name: task.name,
              value: captured,
            });
          }
          break;
        }
        case "RepeatTask": {
          const captured = state.captured[task.variable];
          if (captured == null) {
            throw new Error(`No captured value for ${task.variable}`);
          }
          state.text += captured;
          break;
        }
        case "MatchTask": {
          const value = state.captured[task.variable];
          if (value == null) {
            throw new Error(`Variable ${task.variable} not found`);
          }
          const tasks = task.choices[value];
          if (tasks == null) {
            throw new Error(`Variable ${task.variable} not found`);
          }
          for (const innerTask of tasks) {
            await handleTask(innerTask);
          }
          break;
        }
        default: {
          return assertIsNever(task);
        }
      }
    };
    for (const task of data.tasks) {
      await handleTask(task);
    }
    return state;
  }
}
