export type GeneratorOptions = {
  stop?: string | string[];
  maxTokens?: number;
};
export type LMGenerator<T extends string> = {
  _tag: "LMGenerator";
  name: T;
  options: GeneratorOptions;
};

export function gen<T extends string>(
  name: T,
  options?: GeneratorOptions
): LMGenerator<T>;
export function gen(options?: GeneratorOptions): LMGenerator<never>;
export function gen(...args: any) {
  let argsTyped = args as [string, GeneratorOptions] | [GeneratorOptions];
  let nameOrOptions = argsTyped[0];
  let options = argsTyped[1];
  if (typeof nameOrOptions === "string") {
    return { _tag: "LMGenerator", name: nameOrOptions, options: options || {} };
  } else {
    return {
      _tag: "LMGenerator",
      name: "default",
      options: nameOrOptions || {},
    };
  }
}

export type Interpolations<T extends string> = LMGenerator<T> | string | number;

export type StateFn<T extends string> = {
  captured: {
    [K in T]: string;
  };
  text: string;
  metaInfos: any[];
  gen<U extends string>(
    name: U,
    options?: GeneratorOptions
  ): Promise<StateFn<T | U>>;
  gen(options?: GeneratorOptions): Promise<StateFn<T>>;
} & (<U extends string = never>(
  strings: TemplateStringsArray,
  ...keys: Interpolations<U>[]
) => Promise<StateFn<T | U>>);

export type InitializedModel = StateFn<never>;
