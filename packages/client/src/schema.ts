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
};

export type ArraySchemaData = {
  type: "array";
  children: SchemaClassData;
};

export type DiscriminatedUnionSchemaData = {
  type: "discriminatedUnion";
  children: Record<string, ObjectSchemaData>;
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

const discriminatedUnion = <T extends Record<string, Schema<Record<string, any>>>>(
  schemas: T,
): Schema<
  {
    [K in keyof T]: T[K] extends Schema<infer U>
      ? {
          [P in keyof U | "tag"]: P extends keyof U ? U[P] : P extends "tag" ? K : never;
        }
      : never;
  }[keyof T]
> =>
  new Schema({
    type: "discriminatedUnion",
    children: Object.fromEntries(
      Object.entries(schemas).map(([k, v]) => [k, v.data as ObjectSchemaData]),
    ),
  });

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

const intersection = <T extends [Schema<Record<string, any>>, Schema<Record<string, any>>]>(
  schemas: T,
): Schema<UnionToIntersection<T[number] extends Schema<infer U> ? U : unknown>> =>
  new Schema({
    type: "object",
    children: Object.fromEntries(
      schemas.map((schema) => Object.entries(schema).map(([k, v]) => [k, v.data])),
    ),
  });

function object<T extends Record<string, Schema<any>>>(
  schema: T,
): Schema<{
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
}> {
  return new Schema({
    type: "object",
    children: Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, value.data])),
  });
}

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
