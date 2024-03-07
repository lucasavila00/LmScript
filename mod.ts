/**
 * The type of a just-created model.
 */
export type InitModel = SglModel<{}>;

/**
 * Options for the single execution of the model.
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
  creatorOptions: CreateModelOptions | undefined
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
type SglGenerateData = {
  text: string;
  sampling_params: SglSamplingParams;
};
type SglSelectData = {
  text: string[];
  sampling_params: SglSamplingParams;
  return_logprob: boolean;
  logprob_start_len: number;
};
type MetaInfoGeneration = {
  prompt_tokens: number;
};
type MetaInfoSelection = {
  prompt_tokens: number;
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
 * Options for creating a new model.
 * Template is required to support roles.
 */
export type CreateModelOptions = {
  url: string;
  temperature?: number;
  echo?: boolean;
  template?: ChatTemplate;
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
 * The model is a thread of tasks that can be executed to generate text.
 */
export class SglModel<T = {}> {
  #tasks: Task[];
  #options: CreateModelOptions;
  #state: TaskAccumulator;
  constructor(options: CreateModelOptions) {
    this.#options = options;
    this.#state = {
      captured: {},
      text: "",
    };
    this.#tasks = [];
  }

  #wrapRole<U>(role: Role, cb: (it: SglModel<T>) => SglModel<U>): SglModel<U> {
    const template = this.#options.template;
    if (template == null) {
      throw new Error("Template is required.");
    }
    return cb(this.push(getRoleStart(template, role))).push(
      getRoleEnd(template, role)
    );
  }

  /**
   * Wraps the calls made to the model in the callback with the assistant role.
   * The model should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     model: InitModel,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     model
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  assistant<U>(cb: (it: SglModel<T>) => SglModel<U>): SglModel<U> {
    return this.#wrapRole("assistant", cb);
  }
  /**
   * Wraps the calls made to the model in the callback with the system role.
   * The model should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     model: InitModel,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     model
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  system<U>(cb: (it: SglModel<T>) => SglModel<U>): SglModel<U> {
    return this.#wrapRole("system", cb);
  }
  /**
   * Wraps the calls made to the model in the callback with the user role.
   * The model should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   *   const multiTurnQuestion = (
   *     model: InitModel,
   *     question1: string,
   *     question2: string
   *   ) =>
   *     model
   *       .system((m) => m.push("You are a helpful assistant."))
   *       .user((m) => m.push(question1))
   *       .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *       .user((m) => m.push(question2))
   *       .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *       .run();
   * ```
   */
  user<U>(cb: (it: SglModel<T>) => SglModel<U>): SglModel<U> {
    return this.#wrapRole("user", cb);
  }

  async #httpRequest<T>(data: object): Promise<T> {
    const response = await fetch(this.#options.url + "/generate", {
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

  #generationHttpRequest(sglGenerateData: SglGenerateData): Promise<{
    text: string;
    meta_info: MetaInfoGeneration;
  }> {
    return this.#httpRequest(sglGenerateData);
  }
  #selectionHttpRequest(sglSelectData: SglSelectData): Promise<
    Array<{
      text: string;
      meta_info: MetaInfoSelection;
    }>
  > {
    return this.#httpRequest(sglSelectData);
  }

  #clone(state: TaskAccumulator, tasks: Task[]) {
    const newInstance = new SglModel<T>(this.#options);
    newInstance.#state = state;
    newInstance.#tasks = tasks;
    return newInstance;
  }

  /**
   * Adds text to the thread.
   *
   * ```ts
   * const model = new SglModel({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
   *  .push(`<s> [INST] What is the sum of 2 + 2? Answer shortly. [/INST] `)
   *  .gen()
   *  .run();
   *
   * console.log(conversation);
   * ```
   */
  push(text: string): SglModel<T> {
    const task: Task = async (acc) => {
      if (this.#options.echo) {
        console.log(text);
      }
      return { ...acc, text: acc.text + text };
    };
    return this.#clone(this.#state, [...this.#tasks, task]);
  }

  #doSelection(
    name: string | undefined,
    options: SelectorOptions<string>
  ): SglModel<T> {
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
   * const model = new SglModel({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
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
  ): SglModel<{
    [K in N | keyof T]: K extends N ? V : K extends keyof T ? T[K] : never;
  }>;
  /**
   * Selects a choice from a list of options.
   * Does not capture the selected choice with a name.
   *
   * ```ts
   * const model = new SglModel({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
   *  .push(`<s> [INST] Ice cream or cookies? [/INST] `)
   *  .select({
   *    choices: ["ice creams", "cookies"],
   *  })
   *  .run();
   *
   * console.log(captured.desert);
   */
  select<V extends string>(options: SelectorOptions<V>): SglModel<T>;
  select(
    arg1: string | SelectorOptions<string>,
    arg2?: SelectorOptions<string>
  ): any {
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
  ): SglModel<T> {
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
   * const model = new SglModel({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
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
  ): SglModel<{
    [K in keyof T | N]: K extends N ? string : K extends keyof T ? T[K] : never;
  }>;
  /**
   * Generates text, but does not capture it with a name.
   *
   * ```ts
   * const model = new SglModel({
   *   url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
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
  gen(options?: GeneratorOptions | undefined): SglModel<T>;
  gen(arg1?: string | GeneratorOptions, arg2?: GeneratorOptions): any {
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
   * const model = new SglModel({
   *  url: `http://localhost:30005`,
   * });
   *
   * const [threadContinuation, captured, conversation] = await model
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
   * // The thread continuation can be used to continue the thread, it is a instance of SglModel.
   * threadContinuation.push(` </s>`).gen(...)
   * ```
   */
  async run(options?: RunOptions): Promise<[SglModel<T>, T, string]> {
    let state = { ...this.#state };
    for (const task of this.#tasks) {
      state = await task(state, options);
    }
    const newInstance = this.#clone(state, []);
    return [newInstance, state.captured as T, state.text];
  }
}
