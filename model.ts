export type InitializedModel = SglModel<{}>;

type RunOptions = {
  temperature?: number;
};

type SelectorOptions<S extends string> = {
  choices: S[];
};
type GeneratorOptions = {
  stop?: string | string[];
  maxTokens?: number;
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
  runOptions: RunOptions | undefined
): SglSamplingParams => {
  return {
    skip_special_tokens: params.skip_special_tokens ?? true,
    max_new_tokens: params.max_new_tokens ?? 16,
    stop: params.stop ?? [],
    temperature: runOptions?.temperature ?? params.temperature ?? 1.0,
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

export class SglModel<T> {
  #tasks: Task[];
  #url: string;
  #state: TaskAccumulator;
  private constructor(url: string, state: TaskAccumulator, tasks: Task[]) {
    this.#url = url;
    this.#state = state;
    this.#tasks = tasks;
  }

  static fromUrl(url: string): SglModel<{}> {
    return new SglModel(
      url,
      {
        captured: {},
        text: "",
      },
      []
    );
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
  talk(text: string): SglModel<T> {
    const task: Task = async (acc) => {
      return { ...acc, text: acc.text + text };
    };
    return new SglModel(this.#url, this.#state, [...this.#tasks, task]);
  }

  #doSelection(
    name: string | undefined,
    options: SelectorOptions<string>
  ): SglModel<T> {
    const task: Task = async (acc, runOptions) => {
      // Cache common prefix
      const res = await this.#generationHttpRequest({
        text: acc.text,
        sampling_params: createSglSamplingParams(
          {
            max_new_tokens: 0,
          },
          runOptions
        ),
      });
      const prompt_len = res.meta_info.prompt_tokens;

      const obj = await this.#selectionHttpRequest({
        text: options.choices.map((c) => acc.text + c),
        sampling_params: createSglSamplingParams(
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

      //   const prompt_logprob = obj.map((r) => r.meta_info.prompt_logprob);

      const argMax = normalized_prompt_logprob.reduce(
        (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
        0
      );
      const decision = options.choices[argMax];

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
    return new SglModel(this.#url, this.#state, [...this.#tasks, task]);
  }
  select<U extends string, S extends string>(
    name: U,
    options: SelectorOptions<S> | undefined
  ): SglModel<{
    [K in U | keyof T]: K extends U ? S : K extends keyof T ? T[K] : never;
  }>;
  select<S extends string>(
    options: SelectorOptions<S> | undefined
  ): SglModel<T>;
  select(
    arg1?: string | SelectorOptions<string>,
    arg2?: SelectorOptions<string>
  ): any {
    if (typeof arg1 === "string") {
      return this.#doSelection(arg1, arg2!);
    }
    return this.#doSelection(undefined, arg1!);
  }

  #doGeneration(
    name: string | null,
    generatorOptions: GeneratorOptions | undefined
  ): SglModel<T> {
    const task: Task = async (acc, runOptions) => {
      const { text: out, meta_info: _ } = await this.#generationHttpRequest({
        text: acc.text,
        sampling_params: createSglSamplingParams(
          {
            max_new_tokens: generatorOptions?.maxTokens,
            stop: generatorOptions?.stop,
          },
          runOptions
        ),
      });
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
    return new SglModel(this.#url, this.#state, [...this.#tasks, task]);
  }
  gen<U extends string>(
    name: U,
    options?: GeneratorOptions | undefined
  ): SglModel<{
    [K in keyof T | U]: K extends U ? string : K extends keyof T ? T[K] : never;
  }>;
  gen(options?: GeneratorOptions | undefined): SglModel<T>;
  gen(arg1?: string | GeneratorOptions, arg2?: GeneratorOptions): any {
    if (typeof arg1 === "string") {
      return this.#doGeneration(arg1, arg2);
    } else {
      return this.#doGeneration(null, arg1);
    }
  }
  async run(options?: RunOptions): Promise<[SglModel<T>, T, string]> {
    let state = { ...this.#state };
    for (const task of this.#tasks) {
      state = await task(state, options);
    }
    const cl = new SglModel<T>(this.#url, state, []);
    return [cl, state.captured as T, state.text];
  }
}
