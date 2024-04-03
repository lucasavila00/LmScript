import {
  SchemaData,
  ObjectSchemaData,
  ArraySchemaData,
  DiscriminatedUnionSchemaData,
} from "../schema";
import { assertIsNever } from "../utils";
import { GenerationThread, ClientState, SelectTask, GenerateTask } from "./abstract";

const INTEGER = "(-)?(0|[1-9][0-9]*)";
const NUMBER = `(${INTEGER})(\\.[0-9]+)?([eE][+-][0-9]+)?`;

export abstract class BaseExecutor {
  readonly data: GenerationThread;
  state: ClientState;
  constructor(data: GenerationThread) {
    this.data = data;
    this.state = JSON.parse(JSON.stringify(this.data.initial_state));
  }

  async #writeToPath(path: string[], captured: unknown) {
    let current = this.state.captured;

    for (const key of path.slice(0, -1)) {
      if (current[key] == null) {
        current[key] = {};
      }
      current = current[key] as any;
    }

    const lastPath = path[path.length - 1];
    current[lastPath] = captured;
  }

  abstract doSelect(task: Omit<SelectTask, "name">): Promise<string>;
  abstract doGeneration(task: Omit<GenerateTask, "name">): Promise<string>;

  async #handleSelectPath(
    task: {
      choices: string[];
    },
    path: string[],
  ) {
    const captured = await this.doSelect({ ...task, tag: "SelectTask" });
    this.#writeToPath(path, captured);
  }
  async #handleGeneratePath(task: { stop: string[]; regex: string | undefined }, path: string[]) {
    const captured = await this.doGeneration({
      ...task,
      tag: "GenerateTask",
      regex: undefined,
      max_tokens: 1024,
    });
    this.#writeToPath(path, captured);
  }
  async #handleXmlField(path: string[], key: string, data: SchemaData) {
    const newFullPath = [...path, key];
    switch (data.type) {
      case "array": {
        await this.handleXmlArray(path, key, data);
        break;
      }
      case "null": {
        this.state.text += `<${key} type="null">null</${key}>\n`;
        this.#writeToPath(newFullPath, null);
        break;
      }
      case "object": {
        await this.handleXmlObject(newFullPath, data);
        break;
      }
      case "boolean": {
        this.state.text += `<${key} type="${data.type}">`;
        await this.#handleSelectPath({ choices: ["true", "false"] }, newFullPath);
        let current = this.state.captured;
        for (const key of path) {
          if (current[key] == null) {
            current[key] = {};
          }
          current = current[key] as any;
        }
        current[key] = Boolean(current[key] as any);
        this.state.text += `</${key}>\n`;
        break;
      }
      case "number": {
        this.state.text += `<${key} type="${data.type}">`;
        await this.#handleGeneratePath({ stop: ["</"], regex: `${NUMBER}</` }, newFullPath);

        let current = this.state.captured;
        for (const key of path) {
          if (current[key] == null) {
            current[key] = {};
          }
          current = current[key] as any;
        }
        current[key] = parseFloat(current[key] as any);
        this.state.text += `</${key}>\n`;
        break;
      }
      case "string": {
        this.state.text += `<${key} type="${data.type}">`;
        await this.#handleGeneratePath({ stop: ["</"], regex: undefined }, newFullPath);
        this.state.text += `</${key}>\n`;
        break;
      }
      case "discriminatedUnion": {
        await this.handleXmlDiscriminatedUnion(newFullPath, data);
        break;
      }
      default:
        return assertIsNever(data);
    }
  }
  private async handleXmlArray(path: string[], key: string, schema: ArraySchemaData) {
    this.state.text += `<${key} type="array">\n`;

    const childType = schema.children;
    let idx = 0;
    while (true) {
      const VALUE_START = `<value` as const;
      const choice = await this.doSelect({ tag: "SelectTask", choices: [VALUE_START, `</`] });
      if (choice === "</") {
        this.state.text += `${key}>\n`;

        let current = this.state.captured;
        for (const key of path) {
          if (current[key] == null) {
            current[key] = {};
          }
          current = current[key] as any;
        }
        let acc = [];
        for (const k of Object.keys(current[key] as any).sort(
          (a, b) => parseInt(a) - parseInt(b),
        )) {
          acc.push((current[key] as any)[k]);
        }
        current[key] = acc.map((it) => it.value);
        return;
      }
      this.state.text = this.state.text.slice(0, -VALUE_START.length);
      await this.#handleXmlField([...path, key, String(idx)], "value", childType);
      idx++;
    }
  }
  protected async handleXmlDiscriminatedUnion(
    path: string[],
    schema: DiscriminatedUnionSchemaData,
  ) {
    const lastPath = path[path.length - 1];
    this.state.text += `<${lastPath}>\n`;
    this.state.text += `<`;
    const discriminatorValues: string[] = schema.children.map((it) => it.title);
    const selection = await this.doSelect({ tag: "SelectTask", choices: discriminatorValues });
    const schemaSelected = schema.children.find((it) => it.title === selection);
    if (schemaSelected == null) {
      throw new Error(`Discriminator value ${selection} not found`);
    }
    this.state.text = this.state.text.slice(0, -1 - selection.length);
    await this.handleXmlObject(path, schemaSelected);

    this.state.text += `</${lastPath}>\n`;
  }
  protected async handleXmlObject(path: string[], schema: ObjectSchemaData) {
    this.state.text += `<${schema.title}>\n`;
    for (const key of Object.keys(schema.children)) {
      const field = schema.children[key];
      await this.#handleXmlField(path, key, field);
    }
    this.state.text += `</${schema.title}>\n`;

    let current = this.state.captured;
    for (const key of path) {
      if (current[key] == null) {
        current[key] = {};
      }
      current = current[key] as any;
    }
    current["_tag"] = schema.title;
  }
}
