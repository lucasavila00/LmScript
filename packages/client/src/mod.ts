import {
  AbstractBackend,
  ClientState,
  FetcherSamplingParams,
  MatchTask,
  OnCapture,
  Task,
} from "./backends/abstract";
import { Role } from "./chat-template";
import { Schema } from "./schema";
import { ERROR_MESSAGES, NOOP } from "./utils";
import { explainXmlSchema } from "./xml-schema";

type EmptyRecord = Record<never, string>;
type AnyRecord = Record<string, string>;

/**
 * The type of a just-created client, with no captured data.
 */
export type InitClient = LmScript<EmptyRecord, EmptyRecord>;

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

export type JsonGenerationOptions = {
  maxTokens?: number;
};

/**
 * Options for creating a new client.
 * Template is required to support roles.
 */
export type CreateClientOptions = FetcherSamplingParams & {};
const validateRegex = (regex: string) => {
  if (regex == "") {
    return false;
  }
  try {
    new RegExp(regex);
    return true;
  } catch {
    return false;
  }
};

type ClientStateWithCounter = ClientState & {
  currentRole: Role | undefined;
};
/**
 * The client is a thread of tasks that can be executed to generate text.
 */

export class LmScript<
  GEN extends Record<string, any> = EmptyRecord,
  SEL extends Record<string, string> = EmptyRecord,
> {
  #tasks: Task[];
  readonly #options: CreateClientOptions;
  #state: ClientStateWithCounter;
  readonly #fetcher: AbstractBackend;

  constructor(backend: AbstractBackend, options?: CreateClientOptions) {
    this.#options = {
      ...(options ?? {}),
      temperature: options?.temperature ?? 0.7,
    };
    this.#state = {
      text: "",
      captured: {},
      currentRole: undefined,
    };
    this.#tasks = [];
    this.#fetcher = backend;
  }

  #wrapRole<GEN2 extends Record<string, string>, SEL2 extends Record<string, string>>(
    role: Role,
    cb: string | ((it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>),
  ): LmScript<GEN2, SEL2> {
    if (this.#state.currentRole !== undefined) {
      throw new Error(ERROR_MESSAGES.cannotNestRoles);
    }
    this.#state.currentRole = role;
    if (typeof cb === "string") {
      // deno-lint-ignore no-explicit-any
      const out = this.#startRole(role).push(cb) as any;
      this.#state.currentRole = undefined;
      return out;
    }

    const out = cb(this.#startRole(role));
    this.#state.currentRole = undefined;
    return out;
  }

  /**
   * Starts a role message in the conversation.
   *
   * Most of the time this should not be used directly, use `client.assistant`, `client.system`, or `client.user` instead.
   */
  #startRole(role: Role): LmScript<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "StartRoleTask",
        role,
      },
    ]);
  }

  /**
   * Wraps the calls made to the client in the callback with the assistant role.
   *
   * The client should be configured with a template to support roles.
   *
   * If a template is not provided, an error will be thrown.
   */
  assistant(cb: string): LmScript<GEN, SEL>;
  assistant<
    GEN2 extends Record<string, any> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: (it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>): LmScript<GEN2, SEL2>;
  assistant<
    GEN2 extends Record<string, string> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: string | ((it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>)): LmScript<GEN2, SEL2> {
    return this.#wrapRole("assistant", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the system role.
   *
   * The client should be configured with a template to support roles.
   *
   * If a template is not provided, an error will be thrown.
   */
  system(cb: string): LmScript<GEN, SEL>;
  system<
    GEN2 extends Record<string, any> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: (it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>): LmScript<GEN2, SEL2>;
  system<
    GEN2 extends Record<string, any> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: string | ((it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>)): LmScript<GEN2, SEL2> {
    return this.#wrapRole("system", cb);
  }
  /**
   * Wraps the calls made to the client in the callback with the user role.
   *
   * The client should be configured with a template to support roles.
   *
   * If a template is not provided, an error will be thrown.
   */

  user(cb: string): LmScript<GEN, SEL>;
  user<
    GEN2 extends Record<string, any> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: (it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>): LmScript<GEN2, SEL2>;
  user<
    GEN2 extends Record<string, any> = Record<never, never>,
    SEL2 extends Record<string, string> = Record<never, never>,
  >(cb: string | ((it: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>)): LmScript<GEN2, SEL2> {
    return this.#wrapRole("user", cb);
  }

  #clone(state: ClientStateWithCounter, tasks: Task[]) {
    const newInstance = new LmScript<GEN, SEL>(this.#fetcher, this.#options);
    newInstance.#state = state;
    newInstance.#tasks = tasks;
    return newInstance;
  }

  /**
   * Adds text to the thread.
   */
  push(text: string): LmScript<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "AddTextTask",
        text,
      },
    ]);
  }

  #doSelection(name: string | undefined, options: SelectorOptions<string>): LmScript<GEN, SEL> {
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
   * This is an advanced feature that is tricky to use, and exists for optimization.
   * It reduces a round-trip to the server and improves cache locality.
   *
   * In general you should use `.run` and regular JavaScript conditionals over `.match`.
   *
   * This matches on a previous `select.` It takes a variable name and a map of choices.
   *
   * The types of all branches should be the same, use `.castSelection` or `.castGenerated` to change the types
   * of branches that differ.
   */
  match<K extends keyof SEL>(
    variable: K,
  ): <GEN2 extends Record<string, any>, SEL2 extends Record<string, string>>(choices: {
    [P in SEL[K]]: (client: LmScript<GEN, SEL>) => LmScript<GEN2, SEL2>;
  }) => LmScript<GEN2, SEL2> {
    return (choices) => {
      const matchTask: MatchTask = {
        tag: "MatchTask",
        variable: String(variable),
        choices: Object.fromEntries(
          Object.entries(choices).map(([key, valueUntyped]) => {
            const value: (
              client: LmScript<AnyRecord, AnyRecord>,
            ) => LmScript<AnyRecord, AnyRecord> =
              // deno-lint-ignore no-explicit-any
              valueUntyped as any;
            const client = new LmScript<AnyRecord, AnyRecord>(this.#fetcher, this.#options);
            const out = value(client);
            const tasks: Task[] = out.#tasks;
            return [key, tasks];
          }),
        ),
      };
      // deno-lint-ignore no-explicit-any
      return this.#clone(this.#state, [...this.#tasks, matchTask]) as any;
    };
  }

  /**
   * Repeats a captured variable.
   */
  repeat(variable: keyof GEN | keyof SEL): LmScript<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "RepeatTask",
        variable: String(variable),
      },
    ]);
  }

  /**
   * Fool the type-checker into thinking that a selection variable was captured.
   */
  castSelection<const N extends string>(
    _name: N,
  ): LmScript<
    {
      [K in keyof SEL | N]: K extends N ? never : K extends keyof SEL ? SEL[K] : never;
    },
    GEN
  > {
    // deno-lint-ignore no-explicit-any
    return this as any;
  }

  /**
   * Selects a choice from a list of options.
   * Capture the selected choice with a name.
   */
  select<const N extends string, const V extends string>(
    name: N,
    options: SelectorOptions<V> | undefined,
  ): LmScript<
    GEN,
    {
      [K in keyof SEL | N]: K extends N ? V : K extends keyof SEL ? SEL[K] : never;
    }
  >;
  /**
   * Selects a choice from a list of options.
   * Does not capture the selected choice with a name.
   */
  select<V extends string>(options: SelectorOptions<V>): LmScript<GEN, SEL>;
  select(arg1: string | SelectorOptions<string>, arg2?: SelectorOptions<string>): unknown {
    if (typeof arg1 === "string") {
      return this.#doSelection(arg1, arg2!);
    }
    return this.#doSelection(undefined, arg1!);
  }

  #doGeneration(
    name: string | undefined,
    generatorOptions: GeneratorOptions | undefined,
  ): LmScript<GEN, SEL> {
    if (generatorOptions?.regex && !validateRegex(generatorOptions.regex)) {
      throw new Error("Invalid regex");
    }
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
   * Fool the type-checker into thinking that a generated variable was captured.
   */
  castGenerated<const N extends string>(
    _name: N,
  ): LmScript<
    {
      [K in keyof GEN | N]: K extends N ? never : K extends keyof GEN ? GEN[K] : never;
    },
    SEL
  > {
    // deno-lint-ignore no-explicit-any
    return this as any;
  }

  /**
   * Generates text and captures it with a name.
   */
  gen<const N extends string>(
    name: N,
    options?: GeneratorOptions | undefined,
  ): LmScript<
    {
      [K in keyof GEN | N]: K extends N ? string : K extends keyof GEN ? GEN[K] : never;
    },
    SEL
  >;

  /**
   * Generates text, but does not capture it with a name.
   */
  gen(options?: GeneratorOptions | undefined): LmScript<GEN, SEL>;
  gen(arg1?: string | GeneratorOptions, arg2?: GeneratorOptions): unknown {
    if (typeof arg1 === "string") {
      return this.#doGeneration(arg1, arg2);
    } else {
      return this.#doGeneration(undefined, arg1);
    }
  }

  pushSchemaExample<T>(title: string, schema: Schema<T>, example: T): LmScript<GEN, SEL> {
    return this.#clone(this.#state, [
      ...this.#tasks,
      {
        tag: "AddTextTask",
        text: explainXmlSchema(schema.data, title, example),
      },
    ]) as any;
  }

  genSchema<const N extends string, T extends Record<string, any>>(
    captureAs: N,
    title: string,
    schema: Schema<T>,
  ): LmScript<
    {
      [K in keyof GEN | N]: K extends N ? T : K extends keyof GEN ? GEN[K] : never;
    },
    SEL
  >;
  genSchema<const N extends string, T extends Record<string, any>>(
    title: N,
    schema: Schema<T>,
  ): LmScript<
    {
      [K in keyof GEN | N]: K extends N ? T : K extends keyof GEN ? GEN[K] : never;
    },
    SEL
  >;

  genSchema(
    first: string,
    second: string | Schema<Record<string, any>>,
    third?: Schema<Record<string, any>>,
  ): any {
    return this.#clone(this.#state, [
      ...this.#tasks,
      third == null
        ? {
            tag: "XmlTask",
            name: first,
            schema: (second as any).data,
            schemaKey: undefined,
          }
        : { tag: "XmlTask", name: first, schemaKey: second as any, schema: (third as any).data },
    ]) as any;
  }

  #executeJSONJustText(): Promise<{
    captured: {
      [K in keyof GEN | keyof SEL]: K extends keyof GEN
        ? GEN[K]
        : K extends keyof SEL
          ? SEL[K]
          : never;
    };
    state: LmScript<GEN, SEL>;
    rawText: string;
  }> {
    let text = this.#state.text;
    for (const task of this.#tasks) {
      if (task.tag === "AddTextTask") {
        text += task.text;
      } else {
        throw new Error("INTERNAL ERROR: Expected only text.");
      }
    }
    const newInstance = this.#clone({ ...this.#state, text }, []);
    return Promise.resolve({
      // deno-lint-ignore no-explicit-any
      captured: this.#state.captured as any,
      state: newInstance,
      rawText: text,
    });
  }

  /**
   * Executes the thread and returns the captured data and the conversation.
   */
  async run(
    options?: FetcherSamplingParams & {
      onCapture?: OnCapture;
    },
  ): Promise<{
    captured: {
      [K in keyof GEN | keyof SEL]: K extends keyof GEN
        ? GEN[K]
        : K extends keyof SEL
          ? SEL[K]
          : never;
    };
    state: LmScript<GEN, SEL>;
    rawText: string;
  }> {
    const areAllTasksText = this.#tasks.every((task) => task.tag === "AddTextTask");
    if (areAllTasksText) {
      return this.#executeJSONJustText();
    }

    const { ...restCreatorOptions } = this.#options;
    const { onCapture, ...restOptions } = options ?? {};
    const out = await this.#fetcher.executeJSON(
      {
        sampling_params: { ...restCreatorOptions, ...restOptions },
        tasks: this.#tasks,
        initial_state: this.#state,
      },
      {
        onCapture: onCapture ?? NOOP,
      },
    );
    const newInstance = this.#clone({ ...this.#state, ...out }, []);
    return {
      // deno-lint-ignore no-explicit-any
      captured: out.captured as any,
      state: newInstance,
      rawText: out.text,
    };
  }
}
