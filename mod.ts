/**
 * The type of a just-created client.
 */
export type InitClient = SglClient<Record<string, never>>;

/**
 * Options for the single execution of the thread.
 */
export type RunOptions = {
  temperature?: number;
};

/**
 * Options for the selection task.
 */
export type SelectorOptions<S extends string> = {
  choices: S[];
};

/**
 * Options for the generation task.
 */
export type GeneratorOptions = {
  stop?: string | string[];
  maxTokens?: number;
  regex?: string;
};

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
  runOptions: RunOptions | undefined,
  creatorOptions: CreateClientOptions | undefined
): SglSamplingParams => {
  return {
    skip_special_tokens: params.skip_special_tokens ?? true,
    max_new_tokens: params.max_new_tokens ?? 16,
    stop: params.stop ?? [],
    temperature:
      runOptions?.temperature ??
      creatorOptions?.temperature ??
      params.temperature ??
      1.0,
    top_p: params.top_p ?? 1.0,
    top_k: params.top_k ?? -1,
    frequency_penalty: params.frequency_penalty ?? 0.0,
    presence_penalty: params.presence_penalty ?? 0.0,
    ignore_eos: params.ignore_eos ?? false,
    regex: params.regex,
    dtype: params.dtype,
  };
};

/**
 * Options for the generation task.
 */
export type SglGenerateData = {
  text: string;
  sampling_params: SglSamplingParams;
};

/**
 * Options for the selection task.
 */
export type SglSelectData = {
  text: string[];
  sampling_params: SglSamplingParams;
  return_logprob: boolean;
  logprob_start_len: number;
};

/**
 * Meta information about the generation task.
 */
export type MetaInfoGeneration = {
  prompt_tokens: number;
  completion_tokens: number;
};

/**
 * Meta information about the selection task.
 */
export type MetaInfoSelection = {
  prompt_tokens: number;
  completion_tokens: number;

  normalized_prompt_logprob: number;
  prompt_logprob: number;
};
type TaskAccumulator = {
  captured: Record<string, string | undefined>;
  text: string;
};
type Task = (
  acc: TaskAccumulator,
  t: RunOptions | undefined
) => Promise<TaskAccumulator>;

/**
 * Supported chat templates.
 */
export type ChatTemplate =
  | "llama-2-chat"
  | "default"
  | "claude"
  | "chatml"
  | "chatml-llava"
  | "vicuna_v1.1";

/**
 * Options for creating a new client.
 * Template is required to support roles.
 */
export type CreateClientOptions = {
  temperature?: number;
  echo?: boolean;
  template?: ChatTemplate;
  reportUsage?: (usage: {
    promptTokens: number;
    completionTokens: number;
  }) => void;
};
type Role = "assistant" | "system" | "user";
type ChatTemplateDefinition = Record<Role, [string, string]>;

type AllChatTemplates = Record<ChatTemplate, ChatTemplateDefinition>;

const chatTemplates: AllChatTemplates = {
  default: {
    system: ["SYSTEM:", "\n"],
    user: ["USER:", "\n"],
    assistant: ["ASSISTANT:", "\n"],
  },
  claude: {
    system: ["", ""],
    user: ["\n\nHuman: ", ""],
    assistant: ["\n\nAssistant:", ""],
  },
  chatml: {
    system: ["<|im_start|>system\n", "<|im_end|>\n"],
    user: ["<|im_start|>user\n", "<|im_end|>\n"],
    assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
  },
  "chatml-llava": {
    system: ["<|im_start|>system\n", "<|im_end|>\n"],
    user: ["<|im_start|>user\n", "<|im_end|>\n"],
    assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
  },
  "vicuna_v1.1": {
    system: ["", " "],
    user: ["USER:", " "],
    assistant: ["ASSISTANT:", "</s>"],
  },
  "llama-2-chat": {
    system: ["<<SYS>>\n", "\n<</SYS>>\n\n"],
    user: ["[INST] ", " [/INST]"],
    assistant: ["", " </s><s>"],
  },
};

const getRoleStart = (template: ChatTemplate, role: Role) =>
  chatTemplates[template][role][0];
const getRoleEnd = (template: ChatTemplate, role: Role) =>
  chatTemplates[template][role][1];

/**
 * Interface for fetching from a SGL server.
 */
export type SglFetcher = {
  generate: (
    data: SglGenerateData
  ) => Promise<{ text: string; meta_info: MetaInfoGeneration }>;
  select: (
    data: SglSelectData
  ) => Promise<Array<{ text: string; meta_info: MetaInfoSelection }>>;
};

/**
 * Fetches from a regular SGL server.
 */

export class SglServerFetcher implements SglFetcher {
  #url: string;
  constructor(url: string) {
    this.#url = url;
  }
  async #httpRequest<T>(data: object): Promise<T> {
    const response = await fetch(this.#url + "/generate", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      console.error((await response.text()).slice(0, 500));
      throw new Error("HTTP error " + response.status);
    }

    return await response.json();
  }
  generate(
    data: SglGenerateData
  ): Promise<{ text: string; meta_info: MetaInfoGeneration }> {
    return this.#httpRequest(data);
  }
  select(
    data: SglSelectData
  ): Promise<{ text: string; meta_info: MetaInfoSelection }[]> {
    return this.#httpRequest(data);
  }
}

/**
 * The client is a thread of tasks that can be executed to generate text.
 */
export class SglClient<T = Record<string, never>> {
  #tasks: Task[];
  #options: CreateClientOptions;
  #state: TaskAccumulator;
  #fetcher: SglFetcher;
  constructor(endpoint: string | SglFetcher, options?: CreateClientOptions) {
    this.#options = options ?? {};
    this.#state = {
      captured: {},
      text: "",
    };
    this.#tasks = [];
    this.#fetcher =
      typeof endpoint === "string" ? new SglServerFetcher(endpoint) : endpoint;
  }

  #wrapRole<U>(
    role: Role,
    cb: (it: SglClient<T>) => SglClient<U>
  ): SglClient<U> {
    const template = this.#options.template;
    if (template == null) {
      throw new Error("Template is required.");
    }
    return cb(this.push(getRoleStart(template, role))).push(
      getRoleEnd(template, role)
    );
  }

  /**
   * Wraps the calls made to the client in the callback with the assistant role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     client: InitClient,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     client
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  assistant<U>(cb: (it: SglClient<T>) => SglClient<U>): SglClient<U> {
    return this.#wrapRole("assistant", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the system role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     client: InitClient,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     client
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  system<U>(cb: (it: SglClient<T>) => SglClient<U>): SglClient<U> {
    return this.#wrapRole("system", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the user role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     client: InitClient,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     client
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  user<U>(cb: (it: SglClient<T>) => SglClient<U>): SglClient<U> {
    return this.#wrapRole("user", cb);
  }

  async #generationHttpRequest(sglGenerateData: SglGenerateData): Promise<{
    text: string;
    meta_info: MetaInfoGeneration;
  }> {
    const out = await this.#fetcher.generate(sglGenerateData);
    this.#options.reportUsage?.({
      promptTokens: out.meta_info.prompt_tokens,
      completionTokens: out.meta_info.completion_tokens,
    });
    return out;
  }
  async #selectionHttpRequest(sglSelectData: SglSelectData): Promise<
    Array<{
      text: string;
      meta_info: MetaInfoSelection;
    }>
  > {
    const out = await this.#fetcher.select(sglSelectData);
    for (const item of out) {
      this.#options.reportUsage?.({
        promptTokens: item.meta_info.prompt_tokens,
        completionTokens: item.meta_info.completion_tokens,
      });
    }
    return out;
  }

  #clone(state: TaskAccumulator, tasks: Task[]) {
    const newInstance = new SglClient<T>(this.#fetcher, this.#options);
    newInstance.#state = state;
    newInstance.#tasks = tasks;
    return newInstance;
  }

  /**
   * Adds text to the thread.
   *
   * ```ts
   * const client = new SglClient({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
   *  .gen()
   *  .run();
   *
   * console.log(conversation);
   * ```
   */
  push(text: string): SglClient<T> {
    const task: Task = (acc) => {
      if (this.#options.echo) {
        console.log(text);
      }
      return Promise.resolve({ ...acc, text: acc.text + text });
    };
    return this.#clone(this.#state, [...this.#tasks, task]);
  }

  #doSelection(
    name: string | undefined,
    options: SelectorOptions<string>
  ): SglClient<T> {
    const task: Task = async (acc, runOptions) => {
      // Cache common prefix
      const res = await this.#generationHttpRequest({
        text: acc.text,
        sampling_params: this.#createSglSamplingParams(
          {
            max_new_tokens: 0,
          },
          runOptions
        ),
      });
      const prompt_len = res.meta_info.prompt_tokens;

      const obj = await this.#selectionHttpRequest({
        text: options.choices.map((c) => acc.text + c),
        sampling_params: this.#createSglSamplingParams(
          {
            max_new_tokens: 0,
          },
          runOptions
        ),
        return_logprob: true,
        logprob_start_len: Math.max(prompt_len - 2, 0),
      });

      const normalized_prompt_logprob = obj.map(
        (r) => r.meta_info.normalized_prompt_logprob
      );

      const argMax = normalized_prompt_logprob.reduce(
        (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
        0
      );
      const decision = options.choices[argMax];
      if (this.#options.echo) {
        console.log(decision);
      }
      if (name != null) {
        return {
          ...acc,
          text: acc.text + decision,
          captured: {
            ...acc.captured,
            [name]: decision,
          },
        };
      }
      return { ...acc, text: acc.text + decision };
    };
    return this.#clone(this.#state, [...this.#tasks, task]);
  }

  /**
   * Selects a choice from a list of options.
   * Capture the selected choice with a name.
   *
   * ```ts
   * const client = new SglClient({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] Ice cream or cookies? [/INST] `)
   *  .select("desert", {
   *    choices: ["ice creams", "cookies"],
   *  })
   *  .run();
   *
   * console.log(captured.desert);
   * ```
   */
  select<N extends string, V extends string>(
    name: N,
    options: SelectorOptions<V> | undefined
  ): SglClient<{
    [K in N | keyof T]: K extends N ? V : K extends keyof T ? T[K] : never;
  }>;
  /**
   * Selects a choice from a list of options.
   * Does not capture the selected choice with a name.
   *
   * ```ts
   * const client = new SglClient({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] Ice cream or cookies? [/INST] `)
   *  .select({
   *    choices: ["ice creams", "cookies"],
   *  })
   *  .run();
   *
   * console.log(captured.desert);
   */
  select<V extends string>(options: SelectorOptions<V>): SglClient<T>;
  select(
    arg1: string | SelectorOptions<string>,
    arg2?: SelectorOptions<string>
  ): unknown {
    if (typeof arg1 === "string") {
      return this.#doSelection(arg1, arg2!);
    }
    return this.#doSelection(undefined, arg1!);
  }

  #createSglSamplingParams(
    params: Partial<SglSamplingParams>,
    runOptions: RunOptions | undefined
  ): SglSamplingParams {
    return createSglSamplingParams(params, runOptions, this.#options);
  }

  #doGeneration(
    name: string | null,
    generatorOptions: GeneratorOptions | undefined
  ): SglClient<T> {
    const task: Task = async (acc, runOptions) => {
      const { text: out, meta_info: _ } = await this.#generationHttpRequest({
        text: acc.text,
        sampling_params: this.#createSglSamplingParams(
          {
            max_new_tokens: generatorOptions?.maxTokens,
            stop: generatorOptions?.stop,
            regex: generatorOptions?.regex,
          },
          runOptions
        ),
      });
      if (this.#options.echo) {
        console.log(out);
      }
      if (name != null) {
        return {
          ...acc,
          text: acc.text + out,
          captured: {
            ...acc.captured,
            [name]: out,
          },
        };
      }

      return { ...acc, text: acc.text + out };
    };
    return this.#clone(this.#state, [...this.#tasks, task]);
  }

  /**
   * Generates text and captures it with a name.
   *
   * ```ts
   * const client = new SglClient({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
   *  .push(`Sure: The answer is "`)
   *  .gen("name", {
   *     maxTokens: 512,
   *     stop: ['"'],
   *   })
   *  .run();
   *
   * console.log(captured.name);
   * ```
   */
  gen<N extends string>(
    name: N,
    options?: GeneratorOptions | undefined
  ): SglClient<{
    [K in keyof T | N]: K extends N ? string : K extends keyof T ? T[K] : never;
  }>;
  /**
   * Generates text, but does not capture it with a name.
   *
   * ```ts
   * const client = new SglClient({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
   *  .push(`Sure: The answer is "`)
   *  .gen({
   *     maxTokens: 512,
   *     stop: ['"'],
   *   })
   *  .run();
   *
   * console.log(conversation);
   * ```
   */
  gen(options?: GeneratorOptions | undefined): SglClient<T>;
  gen(arg1?: string | GeneratorOptions, arg2?: GeneratorOptions): unknown {
    if (typeof arg1 === "string") {
      return this.#doGeneration(arg1, arg2);
    } else {
      return this.#doGeneration(null, arg1);
    }
  }

  /**
   * Executes the thread and returns the captured data and the conversation.
   *
   * ```ts
   * const client = new SglClient({
   *  url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await client
   *  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
   *  .gen("expression", {
   *    maxTokens: 512,
   *  })
   *  .run({
   *   temperature: 0.1,
   *  });
   * console.log(conversation);
   * console.log(captured.expression);
   *
   * // The thread continuation can be used to continue the thread, it is a instance of SglClient.
   * threadContinuation.push(` </s>`).gen(...)
   * ```
   */
  async run(options?: RunOptions): Promise<[SglClient<T>, T, string]> {
    let state = { ...this.#state };
    for (const task of this.#tasks) {
      state = await task(state, options);
    }
    const newInstance = this.#clone(state, []);
    return [newInstance, state.captured as T, state.text];
  }
}
