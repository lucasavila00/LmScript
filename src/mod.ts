import {
  FetcherSamplingParams,
  SglFetcher,
  SglServerFetcher,
  Task,
} from "./sgl-fetcher.ts";

/**
 * The type of a just-created client.
 */
export type InitClient = SglClient<Record<never, never>>;

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

type ClientState = {
  text: string;
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

/**
 * The client is a thread of tasks that can be executed to generate text.
 */
export class SglClient<
  T extends Record<string, string> = Record<never, never>
> {
  #tasks: Task[];
  readonly #options: CreateClientOptions;
  #state: ClientState;
  readonly #fetcher: SglFetcher;
  constructor(endpoint: string | SglFetcher, options?: CreateClientOptions) {
    this.#options = options ?? {};
    this.#state = {
      text: "",
    };
    this.#tasks = [];
    this.#fetcher =
      typeof endpoint === "string" ? new SglServerFetcher(endpoint) : endpoint;
  }

  #wrapRole<U extends Record<string, string>>(
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
  assistant<U extends Record<string, string>>(
    cb: (it: SglClient<T>) => SglClient<U>
  ): SglClient<U> {
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
  system<U extends Record<string, string>>(
    cb: (it: SglClient<T>) => SglClient<U>
  ): SglClient<U> {
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
  user<U extends Record<string, string>>(
    cb: (it: SglClient<T>) => SglClient<U>
  ): SglClient<U> {
    return this.#wrapRole("user", cb);
  }

  #clone(state: ClientState, tasks: Task[]) {
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
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "AddTextTask",
        text,
      },
    ]);
  }

  #doSelection(
    name: string | undefined,
    options: SelectorOptions<string>
  ): SglClient<T> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "SelectTask",
        choices: options.choices,
        name,
      },
    ]);
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

  #doGeneration(
    name: string | undefined,
    generatorOptions: GeneratorOptions | undefined
  ): SglClient<T> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "GenerateTask",
        name,
        stop:
          typeof generatorOptions?.stop === "string"
            ? [generatorOptions.stop]
            : generatorOptions?.stop ?? [],
        max_tokens: generatorOptions?.maxTokens ?? 256,
        regex: generatorOptions?.regex,
      },
    ]);
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
      return this.#doGeneration(undefined, arg1);
    }
  }

  #runThreadJustText(): Promise<[SglClient<T>, T, string]> {
    let text = this.#state.text;
    for (const task of this.#tasks) {
      if (task.tag === "AddTextTask") {
        text += task.text;
      } else {
        throw new Error("Expected only text.");
      }
    }
    const newInstance = this.#clone({ text }, []);
    return Promise.resolve([newInstance, {} as T, text]);
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
  async run(
    options?: FetcherSamplingParams
  ): Promise<[SglClient<T>, T, string]> {
    const areAllTasksText = this.#tasks.every(
      (task) => task.tag === "AddTextTask"
    );
    if (areAllTasksText) {
      return this.#runThreadJustText();
    }

    const out = await this.#fetcher.runThread({
      sampling_params: options ?? {},
      tasks: this.#tasks,
      initial_text: this.#state.text,
    });
    const newInstance = this.#clone(out, []);
    return [newInstance, out.captured as T, out.text];
  }
}
