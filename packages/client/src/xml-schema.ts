import { SchemaData } from "./schema";

const explainXmlField = (data: SchemaData, key: string, example: any): string => {
  switch (data.type) {
    case "array": {
      const contents = (example as Array<any>)
        .map((it) => explainXmlField(data.children, "value", it))
        .join("");
      return `<${key} type="array">\n${contents}</${key}>\n`;
    }
    case "null": {
      return `<${key} type="null">null</${key}>\n`;
    }
    case "object": {
      const contents = Object.entries(example)
        .flatMap(([k, v]) =>
          data.children[k] == null ? [] : explainXmlField(data.children[k], k, v),
        )
        .join("");
      return `<${key}>\n${contents}</${key}>\n`;
    }
    case "boolean": {
      return `<${key} type="${data.type}">${example}</${key}>\n`;
    }
    case "number": {
      return `<${key} type="${data.type}">${example}</${key}>\n`;
    }
    case "string": {
      return `<${key} type="${data.type}">${example}</${key}>\n`;
    }
    case "discriminatedUnion": {
      const tag = example["tag"];
      const selectedSchema = data.children[tag];
      const contents = explainXmlField(selectedSchema, tag, example);
      return `<${key}>\n${contents}</${key}>\n`;
    }
  }
};
export const explainXmlSchema = (schema: SchemaData, title: string, example: any): string => {
  return explainXmlField(schema, title, example);
};
