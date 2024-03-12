/**
 * This module contains the backend for the regular SGLang server.
 * @module
 */

import { delay, NOOP } from "../utils.ts";
import { assertIsNever } from "../utils.ts";
import {
  AbstractBackend,
  ClientState,
  ExecutionCallbacks,
  FetcherSamplingParams,
  GenerationThread,
  ReportUsage,
  Task,
  TasksOutput,
} from "./abstract.ts";

type SglSamplingParams = FetcherSamplingParams & {
  max_new_tokens?: number;
  stop?: string[];
  regex?: string;
};
/**
 * Options for the generation task.
 */
type SglGenerateData = {
  text: string;
  sampling_params: SglSamplingParams;
};

/**
 * Options for the selection task.
 */
type SglSelectData = {
  text: string[];
  sampling_params: SglSamplingParams;
  return_logprob: boolean;
  logprob_start_len: number;
};

/**
 * Meta information about the generation task.
 */
type MetaInfoGeneration = {
  prompt_tokens: number;
  completion_tokens: number;
};

/**
 * Meta information about the selection task.
 */
type MetaInfoSelection = {
  prompt_tokens: number;
  completion_tokens: number;

  normalized_prompt_logprob: number;
  prompt_logprob: number;
};

class SglServerExecutor {
  #state: ClientState;
  readonly #url: string;
  readonly #sampling_params: FetcherSamplingParams;
  readonly #callbacks: ExecutionCallbacks;
  readonly #reportUsage: ReportUsage;
  readonly #fetcher: typeof fetch;

  constructor(
    url: string,
    sampling_params: FetcherSamplingParams,
    state: ClientState,
    callbacks: ExecutionCallbacks,
    reportUsage: ReportUsage,
    fetcher: typeof fetch,
  ) {
    this.#state = JSON.parse(JSON.stringify(state));
    this.#url = url;
    this.#sampling_params = sampling_params;
    this.#callbacks = callbacks;
    this.#reportUsage = reportUsage;
    this.#fetcher = fetcher;
  }

  async #httpRequestNoRetry<T>(data: object): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await this.#fetcher(this.#url + "/generate", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      if (!response.ok) {
        console.error((await response.text()).slice(0, 500));
        throw new Error("HTTP error " + response.status);
      }

      return await response.json();
    } catch (e) {
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
  async #httpRequest<T>(data: object): Promise<T> {
    let lastError: unknown = null;
    for (let i = 1; i < 5; i++) {
      try {
        if (lastError != null) {
          await delay(1000 * i * i);
        }
        return await this.#httpRequestNoRetry(data);
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }
  async #generate(
    data: SglGenerateData,
  ): Promise<{ text: string; meta_info: MetaInfoGeneration }> {
    const out = await this.#httpRequest<
      { text: string; meta_info: MetaInfoGeneration }
    >(data);
    this.#reportUsage({
      completionTokens: out.meta_info.completion_tokens,
      promptTokens: out.meta_info.prompt_tokens,
    });
    return out;
  }
  async #select(
    data: SglSelectData,
  ): Promise<{ text: string; meta_info: MetaInfoSelection }[]> {
    const out = await this.#httpRequest<
      { text: string; meta_info: MetaInfoSelection }[]
    >(data);
    for (const item of out) {
      this.#reportUsage({
        completionTokens: item.meta_info.completion_tokens,
        promptTokens: item.meta_info.prompt_tokens,
      });
    }
    return out;
  }
  getState(): { text: string; captured: Record<string, string> } {
    return this.#state;
  }
  async runTask(task: Task): Promise<void> {
    switch (task.tag) {
      case "AddTextTask": {
        this.#state.text += task.text;
        break;
      }
      case "GenerateTask": {
        const out = await this.#generate({
          text: this.#state.text,
          sampling_params: {
            ...this.#sampling_params,
            max_new_tokens: task.max_tokens,
            stop: task.stop,
            regex: task.regex,
          },
        });
        this.#state.text += out.text;
        if (task.name != null) {
          this.#state.captured[task.name] = out.text;
          this.#callbacks.onCapture({
            name: task.name,
            value: out.text,
          });
        }
        break;
      }
      case "SelectTask": {
        // Cache common prefix
        const res = await this.#generate({
          text: this.#state.text,
          sampling_params: {
            ...this.#sampling_params,
            max_new_tokens: 0,
            temperature: 0.0,
          },
        });

        const prompt_len = res.meta_info.prompt_tokens;

        const obj = await this.#select({
          text: task.choices.map((c) => this.#state.text + c),
          sampling_params: {
            ...this.#sampling_params,
            max_new_tokens: 0,
            temperature: 0.0,
          },
          return_logprob: true,
          logprob_start_len: Math.max(prompt_len - 2, 0),
        });

        const normalized_prompt_logprob = obj.map(
          (r) => r.meta_info.normalized_prompt_logprob,
        );

        const argMax = normalized_prompt_logprob.reduce(
          (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
          0,
        );
        const decision = task.choices[argMax];

        this.#state.text += decision;
        if (task.name != null) {
          this.#state.captured[task.name] = decision;
          this.#callbacks.onCapture({
            name: task.name,
            value: decision,
          });
        }

        break;
      }
      case "RepeatTask": {
        const value = this.#state.captured[task.variable];
        if (value == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        this.#state.text += value;
        break;
      }
      case "MatchTask": {
        const value = this.#state.captured[task.variable];
        if (value == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        const tasks = task.choices[value];
        if (tasks == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        for (const innerTask of tasks) {
          await this.runTask(innerTask);
        }
        break;
      }
      default: {
        return assertIsNever(task);
      }
    }
  }
}

/**
 * Backend for the regular SGLang server.
 */

export class SGLangBackend implements AbstractBackend {
  readonly #url: string;
  readonly #reportUsage: ReportUsage;
  readonly #fetcher: typeof fetch;
  constructor(url: string, options?: {
    reportUsage?: ReportUsage;
    fetcher?: typeof fetch;
  }) {
    this.#url = url;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#fetcher = options?.fetcher ?? ((input, init) => fetch(input, init));
  }
  async executeJSON(
    data: GenerationThread,
    callbacks: ExecutionCallbacks,
  ): Promise<TasksOutput> {
    const executor = new SglServerExecutor(
      this.#url,
      data.sampling_params,
      data.initial_state,
      callbacks,
      this.#reportUsage,
      this.#fetcher,
    );
    for (const task of data.tasks) {
      await executor.runTask(task);
    }
    return executor.getState();
  }
}
