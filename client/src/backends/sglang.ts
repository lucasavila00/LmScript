/**
 * This module contains the backend for the regular SGLang server.
 * @module
 */

import { delay } from "../utils.ts";
import { assertIsNever } from "../utils.ts";
import { OnCapture } from "./abstract.ts";
import {
  AbstractBackend,
  ClientState,
  FetcherSamplingParams,
  GenerationThread,
  Task,
  TasksOutput,
} from "./abstract.ts";

type SglSamplingParams = {
  skip_special_tokens: boolean;
  max_new_tokens: number;
  stop: string | string[];
  temperature: number;
  top_p: number;
  top_k: number;
  frequency_penalty: number;
  presence_penalty: number;
  ignore_eos: boolean;
  regex: string | undefined;
  dtype: string | undefined;
};
const createSglSamplingParams = (
  params: Partial<SglSamplingParams>,
  fetcher_params: Partial<FetcherSamplingParams>,
): SglSamplingParams => {
  return {
    skip_special_tokens: params.skip_special_tokens ?? true,
    max_new_tokens: params.max_new_tokens ?? 16,
    stop: params.stop ?? [],
    temperature: fetcher_params?.temperature ?? params.temperature ?? 1.0,
    top_p: fetcher_params.top_p ?? params.top_p ?? 1.0,
    top_k: fetcher_params.top_k ?? params.top_k ?? -1,
    frequency_penalty: fetcher_params.frequency_penalty ??
      params.frequency_penalty ?? 0.0,
    presence_penalty: fetcher_params.presence_penalty ??
      params.presence_penalty ?? 0.0,
    ignore_eos: params.ignore_eos ?? false,
    regex: params.regex,
    dtype: params.dtype,
  };
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
  readonly #onCapture: OnCapture;
  constructor(
    url: string,
    sampling_params: FetcherSamplingParams,
    state: ClientState,
    onCapture: OnCapture,
  ) {
    this.#state = JSON.parse(JSON.stringify(state));
    this.#url = url;
    this.#sampling_params = sampling_params;
    this.#onCapture = onCapture;
  }

  async #httpRequestNoRetry<T>(data: object): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(this.#url + "/generate", {
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
    let lastError: unknown;
    for (let i = 1; i < 5; i++) {
      try {
        return await this.#httpRequestNoRetry(data);
      } catch (e) {
        lastError = e;
        await delay(1000 * i * i);
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }
  #generate(
    data: SglGenerateData,
  ): Promise<{ text: string; meta_info: MetaInfoGeneration }> {
    return this.#httpRequest(data);
  }
  #select(
    data: SglSelectData,
  ): Promise<{ text: string; meta_info: MetaInfoSelection }[]> {
    return this.#httpRequest(data);
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
          sampling_params: createSglSamplingParams(
            {
              max_new_tokens: task.max_tokens,
              stop: task.stop,
            },
            this.#sampling_params,
          ),
        });
        this.#state.text += out.text;
        if (task.name != null) {
          this.#state.captured[task.name] = out.text;
          this.#onCapture(task.name, out.text);
        }
        break;
      }
      case "SelectTask": {
        // Cache common prefix
        const res = await this.#generate({
          text: this.#state.text,
          sampling_params: createSglSamplingParams(
            { max_new_tokens: 0, temperature: 0.0 },
            this.#sampling_params,
          ),
        });

        const prompt_len = res.meta_info.prompt_tokens;

        const obj = await this.#select({
          text: task.choices.map((c) => this.#state.text + c),
          sampling_params: createSglSamplingParams(
            {
              max_new_tokens: 0,
              temperature: 0.0,
            },
            this.#sampling_params,
          ),
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
          this.#onCapture(task.name, decision);
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

  constructor(url: string) {
    this.#url = url;
  }
  async executeJSON(
    data: GenerationThread,
    onCapture: OnCapture,
  ): Promise<TasksOutput> {
    const executor = new SglServerExecutor(
      this.#url,
      data.sampling_params,
      data.initial_state,
      onCapture,
    );
    for (const task of data.tasks) {
      await executor.runTask(task);
    }
    return executor.getState();
  }
}
