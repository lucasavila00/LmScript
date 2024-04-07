/**
 * This module contains the backend for the TGI.
 *
 * EXPERIMENTAL!
 *
 * @module
 */

import { ChatTemplate } from "../chat-template";
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

class TgiBackendExecutor extends BaseExecutor {
  readonly #url: string;
  readonly #auth: string | undefined;

  constructor(options: {
    url: string;
    auth?: string;
    data: GenerationThread;
    callbacks: ExecutionCallbacks;
    template: ChatTemplate;
  }) {
    super(options.data, options.callbacks, options.template);
    this.#url = options.url;
    this.#auth = options.auth;
  }
  async #fetchJSON<T>(body: object): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.#auth != null) {
      headers["Authorization"] = `Bearer ${this.#auth}`;
    }

    const url = `${this.#url}/generate`;

    // console.log("fetching", url, body);

    return this.fetchJSONWithTimeout(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  #fixTemperature(temp: number) {
    const EPS = 0.001;
    if (temp < EPS) {
      return EPS;
    }
    if (temp > 1.0) {
      return 1.0;
    }
    return temp;
  }

  override async doGeneration(task: GenerateTask): Promise<string> {
    const json = await this.#fetchJSON<any>({
      inputs: this.state.text,
      parameters: {
        max_new_tokens: task.max_tokens,
        stop: task.stop,
        grammar:
          task.regex === undefined
            ? undefined
            : {
                type: "regex",
                value: task.regex,
              },
        temperature: this.#fixTemperature(this.data.sampling_params.temperature),
        top_p: this.data.sampling_params.top_p,
        top_k: this.data.sampling_params.top_k,
        frequency_penalty: this.data.sampling_params.frequency_penalty,
        presence_penalty: this.data.sampling_params.presence_penalty,
      },
    });

    let captured = json.generated_text;

    for (const s of task.stop ?? []) {
      if (captured.endsWith(s)) {
        captured = captured.slice(0, -s.length);
        break;
      }
    }

    this.state.text += captured;
    return captured;
  }
  override async doSelect(task: SelectTask): Promise<string> {
    const json = await this.#fetchJSON<any>({
      inputs: this.state.text,
      parameters: {
        max_new_tokens: 128,
        grammar: {
          type: "regex",
          value: `(${task.choices
            // .map((it) => {
            //   // escape regex
            //   return it.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            // })
            .join("|")})`,
        },
        temperature: this.#fixTemperature(this.data.sampling_params.temperature),
        top_p: this.data.sampling_params.top_p,
        top_k: this.data.sampling_params.top_k,
        frequency_penalty: this.data.sampling_params.frequency_penalty,
        presence_penalty: this.data.sampling_params.presence_penalty,
      },
    });

    const captured = json.generated_text;
    this.state.text += captured;
    return captured;
  }
}

/**
 * Backend for the TGI.
 */
export class TgiBackend implements AbstractBackend {
  readonly #url: string;
  readonly #auth: string | undefined;
  readonly #template: ChatTemplate;
  constructor(options: {
    url: string;
    template: ChatTemplate;
    auth?: string;
    reportUsage?: ReportUsage;
  }) {
    this.#url = options.url;
    this.#auth = options.auth;
    this.#template = options.template;
  }
  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<ClientState> {
    return new TgiBackendExecutor({
      url: this.#url,
      auth: this.#auth,
      data,
      callbacks,
      template: this.#template,
    }).executeJSON();
  }
}
