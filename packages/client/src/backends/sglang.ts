/**
 * This module contains the backend for the regular SGLang server.
 * @module
 */

import { ChatTemplate } from "../chat-template";
import { NOOP } from "../utils";
import {
  AbstractBackend,
  ClientState,
  ExecutionCallbacks,
  FetcherSamplingParams,
  GenerateTask,
  GenerationThread,
  ReportUsage,
  SelectTask,
} from "./abstract";
import { BaseExecutor } from "./executor";

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

class SglServerExecutor extends BaseExecutor {
  readonly #url: string;
  readonly #reportUsage: ReportUsage;

  constructor(
    url: string,
    data: GenerationThread,
    callbacks: ExecutionCallbacks,
    reportUsage: ReportUsage,
    template: ChatTemplate,
  ) {
    super(data, callbacks, template);

    this.#url = url;
    this.#reportUsage = reportUsage;
  }

  async #httpRequest<T>(data: object): Promise<T> {
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
  async #generateRequest(
    data: SglGenerateData,
  ): Promise<{ text: string; meta_info: MetaInfoGeneration }> {
    const out = await this.#httpRequest<{ text: string; meta_info: MetaInfoGeneration }>(data);
    this.#reportUsage({
      completionTokens: out.meta_info.completion_tokens,
      promptTokens: out.meta_info.prompt_tokens,
    });
    return out;
  }
  async #selectRequest(
    data: SglSelectData,
  ): Promise<{ text: string; meta_info: MetaInfoSelection }[]> {
    const out = await this.#httpRequest<{ text: string; meta_info: MetaInfoSelection }[]>(data);
    for (const item of out) {
      this.#reportUsage({
        completionTokens: item.meta_info.completion_tokens,
        promptTokens: item.meta_info.prompt_tokens,
      });
    }
    return out;
  }
  override async doSelect(task: Omit<SelectTask, "name">): Promise<string> {
    // Cache common prefix
    const res = await this.#generateRequest({
      text: this.state.text,
      sampling_params: {
        ...this.data.sampling_params,
        max_new_tokens: 0,
        temperature: 0.0,
      },
    });

    const prompt_len = res.meta_info.prompt_tokens;

    const obj = await this.#selectRequest({
      text: task.choices.map((c) => this.state.text + c),
      sampling_params: {
        ...this.data.sampling_params,
        max_new_tokens: 0,
        temperature: 0.0,
      },
      return_logprob: true,
      logprob_start_len: Math.max(prompt_len - 2, 0),
    });

    const normalized_prompt_logprob = obj.map((r) => r.meta_info.normalized_prompt_logprob);

    const argMax = normalized_prompt_logprob.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0,
    );
    const decision = task.choices[argMax];

    this.state.text += decision;

    return decision;
  }
  override async doGeneration(task: Omit<GenerateTask, "name">): Promise<string> {
    const out = await this.#generateRequest({
      text: this.state.text,
      sampling_params: {
        ...this.data.sampling_params,
        max_new_tokens: task.max_tokens,
        stop: task.stop,
        regex: task.regex,
      },
    });
    const captured = out.text;
    this.state.text += captured;
    return captured;
  }
}

/**
 * Backend for the regular SGLang server.
 */
export class SGLangBackend implements AbstractBackend {
  readonly #url: string;
  readonly #reportUsage: ReportUsage;
  readonly #template: ChatTemplate;
  constructor(options: { url: string; reportUsage?: ReportUsage; template: ChatTemplate }) {
    this.#url = options.url;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#template = options.template;
  }
  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<ClientState> {
    return new SglServerExecutor(
      this.#url,
      data,
      callbacks,
      this.#reportUsage,
      this.#template,
    ).executeJSON();
  }
}
