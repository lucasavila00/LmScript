/**
 * This module contains the backend for the vLLM using OpenAI compatible API.
 * @module
 */

import { ChatTemplate } from "../chat-template";
import { NOOP } from "../utils";
import {
  AbstractBackend,
  ClientState,
  ExecutionCallbacks,
  GenerateTask,
  GenerationThread,
  ReportUsage,
  SelectTask,
} from "./abstract";
import { BaseExecutor } from "./executor";

class VllmBackendExecutor extends BaseExecutor {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  readonly #auth: string | undefined;

  constructor(options: {
    url: string;
    auth?: string;
    model: string;
    reportUsage?: ReportUsage;
    data: GenerationThread;
    callbacks: ExecutionCallbacks;
    template: ChatTemplate;
  }) {
    super(options.data, options.callbacks, options.template);
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#auth = options.auth;
  }
  async #fetchJSON<T>(body: object): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.#auth != null) {
      headers["Authorization"] = `Bearer ${this.#auth}`;
    }
    return this.fetchJSONWithTimeout(`${this.#url}/v1/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
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
}

/**
 * Backend for the VLLM OpenAI API.
 */
export class VllmBackend implements AbstractBackend {
  readonly #url: string;
  readonly #model: string;
  readonly #reportUsage: ReportUsage;
  readonly #auth: string | undefined;
  readonly #template: ChatTemplate;
  constructor(options: {
    url: string;
    template: ChatTemplate;
    auth?: string;
    model: string;
    reportUsage?: ReportUsage;
  }) {
    this.#url = options.url;
    this.#model = options.model;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#auth = options.auth;
    this.#template = options.template;
  }
  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<ClientState> {
    return new VllmBackendExecutor({
      url: this.#url,
      model: this.#model,
      reportUsage: this.#reportUsage,
      auth: this.#auth,
      data,
      callbacks,
      template: this.#template,
    }).executeJSON();
  }
}
