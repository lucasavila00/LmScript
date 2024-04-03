import { assertIsNever } from "./utils";

export type NumberSchemaData = {
  type: "number";
};

export type StringSchemaData = {
  type: "string";
};

export type NullSchemaData = {
  type: "null";
};

export type BooleanSchemaData = {
  type: "boolean";
};

export type ObjectSchemaData = {
  type: "object";
  children: Record<string, SchemaClassData>;
  title: string;
};

export type ArraySchemaData = {
  type: "array";
  children: SchemaClassData;
};

export type DiscriminatedUnionSchemaData = {
  type: "discriminatedUnion";
  children: ObjectSchemaData[];
};

// TODO: string enum, number enum

export type SchemaData =
  | NumberSchemaData
  | StringSchemaData
  | NullSchemaData
  | BooleanSchemaData
  | ObjectSchemaData
  | ArraySchemaData
  | DiscriminatedUnionSchemaData;

type SchemaClassData = SchemaData & {
  description?: string;
  example?: any;
};

export class Schema<_T> {
  public data: SchemaClassData;
  constructor(data: SchemaClassData) {
    this.data = data;
  }

  private clone(data: Partial<SchemaClassData>): this {
    return new Schema({ ...this.data, ...data } as any) as any;
  }

  public description(description: string): this {
    return this.clone({ description });
  }

  public example(example: any): this {
    return this.clone({ example });
  }
}

const number = (): Schema<number> =>
  new Schema({
    type: "number",
  });

const string = (): Schema<string> =>
  new Schema({
    type: "string",
  });

const null_ = (): Schema<null> =>
  new Schema({
    type: "null",
  });

const boolean = (): Schema<boolean> =>
  new Schema({
    type: "boolean",
  });

const discriminatedUnion = <
  T extends [Schema<Record<string, any>>, ...Schema<Record<string, any>>[]],
>(
  schemas: T,
): Schema<T[number] extends Schema<infer U> ? U : never> =>
  new Schema({
    type: "discriminatedUnion",
    children: schemas.map((it) => it.data) as any,
  });

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

const intersection = <T extends [Schema<Record<string, any>>, Schema<Record<string, any>>]>(
  title: string,
  schemas: T,
): Schema<UnionToIntersection<T[number] extends Schema<infer U> ? U : never>> =>
  new Schema({
    type: "object",
    children: Object.fromEntries(
      schemas.map((schema) => Object.entries(schema).map(([k, v]) => [k, v.data])),
    ),
    title,
  });

const object = <const N extends string, T extends Record<string, Schema<any>>>(
  title: N,
  schema: T,
): Schema<{
  [K in keyof T | "_tag"]: T[K] extends Schema<infer U> ? U : K extends "_tag" ? N : never;
}> =>
  new Schema({
    type: "object",
    children: Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, value.data])),
    title,
  });

const array = <T extends Schema<any>>(schema: T): Schema<T extends Schema<infer U> ? U[] : never> =>
  new Schema({
    type: "array",
    children: schema.data,
  });

export const s = {
  number,
  string,
  null: null_,
  boolean,
  // literal,
  discriminatedUnion,
  intersection,
  object,
  array,
  // enum: enum_,
};

export type TypeOf<T> = T extends Schema<infer U> ? U : never;

export const toJsonSchema = (schemaData: SchemaClassData): object => {
  switch (schemaData.type) {
    case "array":
      return {
        type: "array",
        items: toJsonSchema(schemaData.children),
      };
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(schemaData.children).map(([key, value]) => [key, toJsonSchema(value)]),
        ),
        required: Object.keys(schemaData.children),
      };
    case "discriminatedUnion":
      return { anyOf: schemaData.children.map(toJsonSchema) };
    case "number":
      return { type: "number" };
    case "string":
      return { type: "string" };
    case "null":
      return { type: "null" };
    case "boolean":
      return { type: "boolean" };
    default:
      return assertIsNever(schemaData);
  }
};
