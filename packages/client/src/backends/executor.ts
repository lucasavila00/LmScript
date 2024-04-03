import {
  SchemaData,
  ObjectSchemaData,
  ArraySchemaData,
  DiscriminatedUnionSchemaData,
} from "../schema";
import { assertIsNever } from "../utils";
import {
  GenerationThread,
  ClientState,
  SelectTask,
  GenerateTask,
  ExecutionCallbacks,
  Task,
  TasksOutput,
} from "./abstract";

const INTEGER = "(-)?(0|[1-9][0-9]*)";
const NUMBER = `(${INTEGER})(\\.[0-9]+)?([eE][+-][0-9]+)?`;

export abstract class BaseExecutor {
  readonly data: GenerationThread;
  state: ClientState;
  readonly callbacks: ExecutionCallbacks;
  constructor(data: GenerationThread, callbacks: ExecutionCallbacks) {
    this.data = data;
    this.state = JSON.parse(JSON.stringify(this.data.initial_state));
    this.callbacks = callbacks;
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
        await this.#handleXmlArray(path, key, data);
        break;
      }
      case "discriminatedUnion": {
        await this.#handleXmlDiscriminatedUnion(path, key, data);
        break;
      }
      case "object": {
        await this.#handleXmlObject(path, key, data);
        break;
      }
      case "null": {
        this.state.text += `<${key} type="null">null</${key}>\n`;
        this.#writeToPath(newFullPath, null);
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
      default:
        return assertIsNever(data);
    }
  }
  async #handleXmlArray(path: string[], key: string, schema: ArraySchemaData) {
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
  async #handleXmlDiscriminatedUnion(
    path: string[],
    key: string,
    schema: DiscriminatedUnionSchemaData,
  ) {
    this.state.text += `<${key}>\n`;
    this.state.text += `<`;
    const discriminatorValues: string[] = Object.keys(schema.children);
    const selection = await this.doSelect({ tag: "SelectTask", choices: discriminatorValues });
    const schemaSelected = schema.children[selection];
    if (schemaSelected == null) {
      throw new Error(`Discriminator value ${selection} not found`);
    }
    this.state.text = this.state.text.slice(0, -1 - selection.length);
    await this.#handleXmlObject([...path, key], selection, schemaSelected);

    this.state.text += `</${key}>\n`;

    let current = this.state.captured;
    for (const k2 of [...path]) {
      if (current[k2] == null) {
        current[k2] = {};
      }
      current = current[k2] as any;
    }

    current[key] = {
      tag: selection,
      ...(current[key] as any)[selection],
    };
  }
  async #handleXmlObject(path: string[], key: string, schema: ObjectSchemaData) {
    this.state.text += `<${key}>\n`;
    for (const k2 of Object.keys(schema.children)) {
      const field = schema.children[k2];
      await this.#handleXmlField([...path, key], k2, field);
    }
    this.state.text += `</${key}>\n`;
  }

  async #runTask(task: Task): Promise<void> {
    switch (task.tag) {
      case "AddTextTask": {
        this.state.text += task.text;
        break;
      }
      case "GenerateTask": {
        const captured = await this.doGeneration(task);
        if (task.name != null) {
          this.state.captured[task.name] = captured;
          this.callbacks.onCapture({
            name: task.name,
            value: captured,
          });
        }
        break;
      }
      case "SelectTask": {
        const decision = await this.doSelect(task);
        if (task.name != null) {
          this.state.captured[task.name] = decision;
          this.callbacks.onCapture({
            name: task.name,
            value: decision,
          });
        }

        break;
      }
      case "RepeatTask": {
        const value = this.state.captured[task.variable];
        if (value == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        this.state.text += value;
        break;
      }
      case "MatchTask": {
        const value = this.state.captured[task.variable];
        if (value == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        const tasks = task.choices[value as any];
        if (tasks == null) {
          throw new Error(`Variable ${task.variable} not found`);
        }
        for (const innerTask of tasks) {
          await this.#runTask(innerTask);
        }
        break;
      }
      case "XmlTask": {
        await this.#handleXmlField([], task.name, task.schema);
        this.callbacks.onCapture({
          name: task.name,
          value: this.state.captured[task.name],
        });
        break;
      }
      default: {
        return assertIsNever(task);
      }
    }
  }
  async executeJSON(): Promise<TasksOutput> {
    for (const task of this.data.tasks) {
      await this.#runTask(task);
    }
    return this.state;
  }
}
