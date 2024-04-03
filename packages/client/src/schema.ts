import { assertIsNever } from "./utils";

type NumberSchemaData = {
  type: "number";
  example: number;
};

type StringSchemaData = {
  type: "string";
  example: string;
};

type NullSchemaData = {
  type: "null";
  example: null;
};

type BooleanSchemaData = {
  type: "boolean";
  example: boolean;
};

type LiteralSchemaData = {
  type: "literal";
  children: string | number | boolean;
};

type EnumSchemaData = {
  type: "enum";
  children: Array<string | number | boolean>;
};

type ObjectSchemaData = {
  type: "object";
  children: Record<string, Schema<any>>;
  title: string;
};

type ArraySchemaData = {
  type: "array";
  children: [Schema<any>];
};

type UnionSchemaData = {
  type: "union";
  children: { discriminator: string; schemas: Schema<any>[] };
};

type IntersectionSchemaData = {
  type: "intersection";
  children: Schema<any>[];
  title: string;
};

export type SchemaData =
  | NumberSchemaData
  | StringSchemaData
  | NullSchemaData
  | BooleanSchemaData
  | LiteralSchemaData
  | EnumSchemaData
  | ObjectSchemaData
  | ArraySchemaData
  | UnionSchemaData
  | IntersectionSchemaData;

type SchemaClassData = SchemaData & {
  description?: string;
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
}

const number = (example: number): Schema<number> =>
  new Schema({
    type: "number",
    example,
  });

const string = (example: string): Schema<string> =>
  new Schema({
    type: "string",
    example,
  });

const null_ = (): Schema<null> =>
  new Schema({
    type: "null",
    example: null,
  });

const boolean = (): Schema<boolean> =>
  new Schema({
    type: "boolean",
    example: true,
  });

const literal = <T extends string | number | boolean>(value: T): Schema<T> =>
  new Schema({
    type: "literal",
    children: value,
  });

const enum_ = <const T extends Array<string | number | boolean>>(
  schemas: T,
): Schema<T extends Array<infer U> ? U : never> =>
  new Schema<any>({
    type: "enum",
    children: schemas,
  });
const discriminatedUnion = <
  N extends string,
  K extends N,
  T extends [Schema<Record<K, any>>, ...Schema<Record<K, any>>[]],
>(
  discriminator: N,
  schemas: T,
): Schema<T[number] extends Schema<infer U> ? U : never> =>
  new Schema({
    type: "union",
    children: { discriminator, schemas },
  });

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

const intersection = <T extends [Schema<Record<string, any>>, Schema<Record<string, any>>]>(
  title: string,
  schemas: T,
): Schema<UnionToIntersection<T[number] extends Schema<infer U> ? U : never>> =>
  new Schema({
    type: "intersection",
    children: schemas,
    title,
  });

const object = <T extends Record<string, Schema<any>>>(
  title: string,
  schema: T,
): Schema<{
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
}> => new Schema({ type: "object", children: schema, title });

const array = <T extends Schema<any>>(schema: T): Schema<T extends Schema<infer U> ? U[] : never> =>
  new Schema({
    type: "array",
    children: [schema],
  });

export const s = {
  number,
  string,
  null: null_,
  boolean,
  literal,
  discriminatedUnion,
  intersection,
  object,
  array,
  enum: enum_,
};

export type TypeOf<T> = T extends Schema<infer U> ? U : never;

export const toJsonSchema = (schema: Schema<any>): object => {
  const schemaData = schema.data;
  switch (schemaData.type) {
    case "array":
      return {
        type: "array",
        items: toJsonSchema(schemaData.children[0]),
      };
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(schemaData.children).map(([key, value]) => [key, toJsonSchema(value)]),
        ),
        required: Object.keys(schemaData.children),
      };
    case "union":
      return { anyOf: schemaData.children.schemas.map(toJsonSchema) };
    case "enum":
      return { enum: schemaData.children };
    case "intersection":
      return { allOf: schemaData.children.map(toJsonSchema) };
    case "literal":
      return { const: schemaData.children };
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
