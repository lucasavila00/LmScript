import {
  ClientState,
  FetcherSamplingParams,
  MatchTask,
  SglFetcher,
  SglServerFetcher,
  Task,
} from "./sgl-fetcher.ts";
type EmptyRecord = Record<never, string>;
type AnyRecord = Record<string, string>;
/**
 * The type of a just-created client.
 */
export type InitClient = SglClient<EmptyRecord, EmptyRecord>;

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
export type CreateClientOptions = FetcherSamplingParams & {
  template?: ChatTemplate | ChatTemplateDefinition;
};
export type Role = "assistant" | "system" | "user";
export type ChatTemplateDefinition = Record<Role, [string, string]>;

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
  GEN extends Record<string, string> = EmptyRecord,
  SEL extends Record<string, string> = EmptyRecord
> {
  #tasks: Task[];
  readonly #options: CreateClientOptions;
  #state: ClientState;
  readonly #fetcher: SglFetcher;
  constructor(endpoint: string | SglFetcher, options?: CreateClientOptions) {
    this.#options = options ?? {};
    this.#state = {
      text: "",
      captured: {},
    };
    this.#tasks = [];
    this.#fetcher =
      typeof endpoint === "string" ? new SglServerFetcher(endpoint) : endpoint;
  }

  #wrapRole<
    GEN2 extends Record<string, string>,
    SEL2 extends Record<string, string>
  >(
    role: Role,
    cb: (it: SglClient<GEN, SEL>) => SglClient<GEN2, SEL2>
  ): SglClient<GEN2, SEL2> {
    const template = this.#options.template;
    if (template == null) {
      throw new Error("Template is required.");
    }
    if (typeof template === "string") {
      return cb(this.push(getRoleStart(template, role))).push(
        getRoleEnd(template, role)
      );
    }
    const [start, end] = template[role];
    return cb(this.push(start)).push(end);
  }

  /**
   * Wraps the calls made to the client in the callback with the assistant role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   * client
   *   .system((m) => m.push("You are a helpful assistant."))
   *   .user((m) => m.push(question1))
   *   .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *   .user((m) => m.push(question2))
   *   .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *   .run();
   * ```
   */
  assistant<
    GEN2 extends Record<string, string> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>
  >(
    cb: (it: SglClient<GEN, SEL>) => SglClient<GEN2, SEL2>
  ): SglClient<GEN2, SEL2> {
    return this.#wrapRole("assistant", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the system role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   * client
   *   .system((m) => m.push("You are a helpful assistant."))
   *   .user((m) => m.push(question1))
   *   .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *   .user((m) => m.push(question2))
   *   .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *   .run();
   * ```
   */
  system<
    GEN2 extends Record<string, string> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>
  >(
    cb: (it: SglClient<GEN, SEL>) => SglClient<GEN2, SEL2>
  ): SglClient<GEN2, SEL2> {
    return this.#wrapRole("system", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the user role.
   * The client should be configured with a template to support roles.
   * If a template is not provided, an error will be thrown.
   *
   * ```ts
   * client
   *   .system((m) => m.push("You are a helpful assistant."))
   *   .user((m) => m.push(question1))
   *   .assistant((m) => m.gen("answer1", { maxTokens: 256 }))
   *   .user((m) => m.push(question2))
   *   .assistant((m) => m.gen("answer2", { maxTokens: 1025 }))
   *   .run();
   * ```
   */
  user<
    GEN2 extends Record<string, string> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>
  >(
    cb: (it: SglClient<GEN, SEL>) => SglClient<GEN2, SEL2>
  ): SglClient<GEN2, SEL2> {
    return this.#wrapRole("user", cb);
  }

  #clone(state: ClientState, tasks: Task[]) {
    const newInstance = new SglClient<GEN, SEL>(this.#fetcher, this.#options);
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
  push(text: string): SglClient<GEN, SEL> {
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
  ): SglClient<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "SelectTask",
        choices: options.choices,
        name,
      },
    ]);
  }

  match<K extends keyof SEL>(
    variable: K
  ): <
    GEN2 extends Record<string, string>,
    SEL2 extends Record<string, string>
  >(choices: {
    [P in SEL[K]]: (client: SglClient<GEN, SEL>) => SglClient<GEN2, SEL2>;
  }) => SglClient<GEN2, SEL2> {
    return (choices) => {
      const matchTask: MatchTask = {
        tag: "MatchTask",
        variable: String(variable),
        choices: Object.fromEntries(
          Object.entries(choices).map(([key, valueUntyped]) => {
            const value: (
              client: SglClient<AnyRecord, AnyRecord>
            ) => SglClient<AnyRecord, AnyRecord> =
              // deno-lint-ignore no-explicit-any
              valueUntyped as any;
            const client = new SglClient<AnyRecord, AnyRecord>(
              this.#fetcher,
              this.#options
            );
            const out = value(client);
            const tasks: Task[] = out.#tasks;
            return [key, tasks];
          })
        ),
      };
      // deno-lint-ignore no-explicit-any
      return this.#clone(this.#state, [...this.#tasks, matchTask]) as any;
    };
  }

  repeat(variable: keyof GEN | keyof SEL): SglClient<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "RepeatTask",
        variable: String(variable),
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
  select<const N extends string, const V extends string>(
    name: N,
    options: SelectorOptions<V> | undefined
  ): SglClient<
    GEN,
    {
      [K in keyof SEL | N]: K extends N
        ? V
        : K extends keyof SEL
        ? SEL[K]
        : never;
    }
  >;
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
  select<V extends string>(options: SelectorOptions<V>): SglClient<GEN, SEL>;
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
  ): SglClient<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "GenerateTask",
        name,
        stop:
          typeof generatorOptions?.stop === "string"
            ? [generatorOptions.stop]
            : generatorOptions?.stop ?? [],
        max_tokens: generatorOptions?.maxTokens ?? 16,
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
  gen<const N extends string>(
    name: N,
    options?: GeneratorOptions | undefined
  ): SglClient<
    {
      [K in keyof GEN | N]: K extends N
        ? string
        : K extends keyof GEN
        ? GEN[K]
        : never;
    },
    SEL
  >;
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
  gen(options?: GeneratorOptions | undefined): SglClient<GEN, SEL>;
  gen(arg1?: string | GeneratorOptions, arg2?: GeneratorOptions): unknown {
    if (typeof arg1 === "string") {
      return this.#doGeneration(arg1, arg2);
    } else {
      return this.#doGeneration(undefined, arg1);
    }
  }

  #runThreadJustText(): Promise<
    [
      {
        [K in keyof GEN | keyof SEL]: K extends keyof GEN
          ? GEN[K]
          : K extends keyof SEL
          ? SEL[K]
          : never;
      },
      SglClient<GEN, SEL>,
      string
    ]
  > {
    let text = this.#state.text;
    for (const task of this.#tasks) {
      if (task.tag === "AddTextTask") {
        text += task.text;
      } else {
        throw new Error("Expected only text.");
      }
    }
    const newInstance = this.#clone(
      { text, captured: this.#state.captured },
      []
    );
    // deno-lint-ignore no-explicit-any
    return Promise.resolve([this.#state.captured as any, newInstance, text]);
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
  async run(options?: FetcherSamplingParams): Promise<
    [
      {
        [K in keyof GEN | keyof SEL]: K extends keyof GEN
          ? GEN[K]
          : K extends keyof SEL
          ? SEL[K]
          : never;
      },
      SglClient<GEN, SEL>,
      string
    ]
  > {
    const areAllTasksText = this.#tasks.every(
      (task) => task.tag === "AddTextTask"
    );
    if (areAllTasksText) {
      return this.#runThreadJustText();
    }

    const out = await this.#fetcher.runThread({
      sampling_params: { ...this.#options, ...options },
      tasks: this.#tasks,
      initial_state: this.#state,
    });
    const newInstance = this.#clone(out, []);
    // deno-lint-ignore no-explicit-any
    return [out.captured as any, newInstance, out.text];
  }
}
