import { assertIsNever, NOOP } from "../utils.ts";
import {
  AbstractBackend,
  ExecutionCallbacks,
  GenerationThread,
  ReportUsage,
  Task,
  TasksOutput,
} from "./abstract.ts";

/**
 * Backend for the VLLM OpenAI API.
 */
export class VllmBackend implements AbstractBackend {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  constructor(
    options: {
      url: string;
      model: string;
      reportUsage?: ReportUsage;
    },
  ) {
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
  }

  async #fetchJSON<T>(
    body: object,
  ): Promise<T> {
    const response = await fetch(`${this.#url}/v1/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const json = await response.json();
    return json;
  }
  async executeJSON(
    data: GenerationThread,
    callbacks: ExecutionCallbacks,
  ): Promise<TasksOutput> {
    const state = JSON.parse(JSON.stringify(data.initial_state));

    const handleTask = async (
      task: Task,
    ) => {
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
