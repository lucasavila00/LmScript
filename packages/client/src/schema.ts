import { assertIsNever } from "./utils";

type SchemaTypes =
  | "number"
  | "string"
  | "null"
  | "boolean"
  | "union"
  | "intersection"
  | "literal"
  | "object"
  | "array";

export type Schema<T> = {
  decode: (it: unknown) => T;
  type: SchemaTypes;
  children: Schema<any>[] | void | Record<string, Schema<any>> | string | number | boolean;
};

const number = (): Schema<number> => ({
  type: "number",
  children: void 0,
  decode: (it: unknown) => {
    if (typeof it !== "number") {
      throw new Error("Expected a number");
    }
    return it;
  },
});

const string = (): Schema<string> => ({
  type: "string",
  children: void 0,
  decode: (it: unknown) => {
    if (typeof it !== "string") {
      throw new Error("Expected a string");
    }
    return it;
  },
});

const null_ = (): Schema<null> => ({
  type: "null",
  children: void 0,
  decode: (it: unknown) => {
    if (it !== null) {
      throw new Error("Expected null");
    }
    return it;
  },
});

const boolean = (): Schema<boolean> => ({
  type: "boolean",
  children: void 0,
  decode: (it: unknown) => {
    if (typeof it !== "boolean") {
      throw new Error("Expected a boolean");
    }
    return it;
  },
});

const literal = <T extends string | number | boolean>(value: T): Schema<T> => ({
  type: "literal",
  children: value,
  decode: (it: unknown) => {
    if (it !== value) {
      throw new Error(`Expected ${value}`);
    }
    return value;
  },
});

const union = <T extends [Schema<any>, ...Schema<any>[]]>(
  schemas: T,
): Schema<T[number] extends Schema<infer U> ? U : never> => ({
  type: "union",
  children: schemas,
  decode: (it: unknown) => {
    for (const schema of schemas) {
      try {
        return schema.decode(it);
      } catch {}
    }
    throw new Error("Expected one of the schemas");
  },
});

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

const intersection = <T extends [Schema<Record<string, any>>, Schema<Record<string, any>>]>(
  schemas: T,
): Schema<UnionToIntersection<T[number] extends Schema<infer U> ? U : never>> => {
  return {
    type: "intersection",
    children: schemas,
    decode: (it: unknown) => {
      for (const schema of schemas) {
        it = schema.decode(it);
      }
      return it as any;
    },
  };
};

const object = <T extends Record<string, Schema<any>>>(
  schema: T,
): Schema<{
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
}> => ({
  type: "object",
  children: schema,
  decode: (it: unknown) => {
    if (typeof it !== "object" || it === null) {
      throw new Error("Expected an object");
    }
    const obj = it as Record<string, unknown>;
    for (const key in schema) {
      obj[key] = schema[key].decode(obj[key]);
    }
    return obj as any;
  },
});

const array = <T extends Schema<any>>(
  schema: T,
): Schema<T extends Schema<infer U> ? U[] : never> => ({
  type: "array",
  children: [schema],
  decode: (it: unknown) => {
    if (!Array.isArray(it)) {
      throw new Error("Expected an array");
    }
    return it.map((item) => schema.decode(item)) as any;
  },
});

export const s = {
  number,
  string,
  null: null_,
  boolean,
  literal,
  union,
  intersection,
  object,
  array,
};

export type TypeOf<T> = T extends Schema<infer U> ? U : never;

export const toJsonSchema = (schema: Schema<any>): object => {
  switch (schema.type) {
    case "array":
      return {
        type: "array",
        items: toJsonSchema((schema.children as Schema<any>[])[0]),
      };
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(schema.children as Record<string, Schema<any>>).map(([key, value]) => [
            key,
            toJsonSchema(value),
          ]),
        ),
        required: Object.keys(schema.children as Record<string, Schema<any>>),
      };
    case "union":
      return { anyOf: (schema.children as Schema<any>[]).map(toJsonSchema) };
    case "intersection":
      return { allOf: (schema.children as Schema<any>[]).map(toJsonSchema) };
    case "literal":
      return { const: schema.children };
    case "number":
      return { type: "number" };
    case "string":
      return { type: "string" };
    case "null":
      return { type: "null" };
    case "boolean":
      return { type: "boolean" };
    default:
      return assertIsNever(schema.type);
  }
};
