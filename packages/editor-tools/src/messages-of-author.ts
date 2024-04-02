import { AddTextTask, GenerateTask } from "@lmscript/client/backends/abstract";
import {
  JSONContent,
  Author,
  LmEditorState,
  GenerationNodeAttrs,
  NamedVariable,
  StoredChoice,
} from "./types";
import { assertIsNever } from "./utils";

export type ExtendedSelectTask = {
  tag: "ExtendedSelectTask";
  name: string | undefined;
  choices: StoredChoice[];
};

export type VariableSelectExtension = {
  tag: "VariableSelectExtension";
  data: NamedVariable;
};
export type ExtendedTask =
  | AddTextTask
  | GenerateTask
  | ExtendedSelectTask
  | VariableSelectExtension;
export type MessageOfAuthor = {
  author: Author;
  tasks: ExtendedTask[];
};

export type CustomError =
  | {
      tag: "variable-not-found";
      variableId: string;
    }
  | {
      tag: "variable-in-choice-not-found";
      variableId: string;
    };
export const printCustomError = (error: CustomError): string => {
  switch (error.tag) {
    case "variable-not-found": {
      return `Variable with id ${error.variableId} not found`;
    }
    case "variable-in-choice-not-found": {
      return `Variable in choice with id ${error.variableId} not found`;
    }
    default: {
      return assertIsNever(error);
    }
  }
};

export class MessageOfAuthorGetter {
  private currentAuthor: Author;
  private messageTasks: ExtendedTask[] = [];
  private acc: MessageOfAuthor[] = [];
  private errors: CustomError[] = [];
  private inListItem = false;
  private readonly useGenerationUuids: boolean;
  constructor(
    private readonly editorState: Pick<LmEditorState, "doc" | "variables">,
    useGenerationUuids: boolean,
  ) {
    this.useGenerationUuids = useGenerationUuids;
    const root = this.editorState.doc;
    if (root.type !== "doc") {
      throw new Error("Expected doc as root");
    }
    const first = root.content?.[0];
    if (first == null || first.type !== "authorSelect") {
      throw new Error("Expected authorSelect at first position");
    }

    this.currentAuthor = first.attrs?.author;

    this.handleTopLevel((root.content ?? []).slice(1));
  }
  private addDoubleBreak() {
    this.pushText("\n\n");
  }
  private addSingleBreak() {
    this.pushText("\n");
  }
  private handleAuthorSelect(content: JSONContent) {
    this.acc.push({ author: this.currentAuthor, tasks: this.messageTasks });
    this.messageTasks = [];
    this.currentAuthor = content.attrs?.author;
  }

  private pushText(text: string) {
    const last = this.messageTasks[this.messageTasks.length - 1];
    if (last?.tag === "AddTextTask") {
      last.text += text;
      return;
    }
    this.messageTasks.push({ tag: "AddTextTask", text });
  }

  private handleHeading(content: JSONContent) {
    const level = Number(content.attrs?.level ?? 0);
    this.pushText("#".repeat(level) + " ");
    this.handleSecondLevel(content.content ?? []);
    this.addDoubleBreak();
  }

  // TODO: remove removeLastSpace when backends support token healing
  private removeLastSpace() {
    const last = this.messageTasks[this.messageTasks.length - 1];
    if (last?.tag === "AddTextTask" && last.text.endsWith(" ")) {
      last.text = last.text.slice(0, -1);
    }
  }

  private noteAttrToTask(nodeAttrs: GenerationNodeAttrs): ExtendedTask {
    switch (nodeAttrs.type) {
      case "generation":
      case "regex": {
        // TODO: remove removeLastSpace when backends support token healing
        this.removeLastSpace();
        return {
          tag: "GenerateTask",
          name: this.useGenerationUuids ? nodeAttrs.id : nodeAttrs.name,
          stop: nodeAttrs.stop,
          max_tokens: nodeAttrs.max_tokens,
          regex: nodeAttrs.regex,
        };
      }
      case "selection": {
        return {
          tag: "ExtendedSelectTask",
          name: this.useGenerationUuids ? nodeAttrs.id : nodeAttrs.name,
          choices: nodeAttrs.choices,
        };
      }
      default: {
        return assertIsNever(nodeAttrs.type);
      }
    }
  }

  private handleSecondLevel(arr: JSONContent[]) {
    for (const content of arr) {
      switch (content.type) {
        case "text": {
          this.pushText(content.text ?? "");
          break;
        }
        case "variableSelect": {
          const variableUuid = content.attrs?.uuid;
          const fromVariables = this.editorState.variables.find((v) => v.uuid === variableUuid);
          if (fromVariables?.value == null) {
            this.errors.push({
              tag: "variable-not-found",
              variableId: variableUuid,
            });
          } else {
            this.messageTasks.push({
              tag: "VariableSelectExtension",
              data: fromVariables,
            });
            // this.pushText(fromVariables.value);
          }
          break;
        }
        case "lmGenerator": {
          const nodeAttrs = content.attrs as GenerationNodeAttrs;
          if (nodeAttrs.type === "selection") {
            nodeAttrs.choices.forEach((choice) => {
              if (choice.tag === "variable") {
                const fromVariables = this.editorState.variables.find(
                  (v) => v.uuid === choice.value,
                );
                if (fromVariables?.value == null) {
                  this.errors.push({
                    tag: "variable-in-choice-not-found",
                    variableId: choice.value,
                  });
                }
              }
            });
          }
          this.messageTasks.push(this.noteAttrToTask(nodeAttrs));
          break;
        }

        case "hardBreak": {
          this.addSingleBreak();
          if (this.inListItem) {
            this.pushText(" ".repeat(4));
          }
          break;
        }
        default: {
          throw new Error(`Unexpected second level content type: ${content.type}`);
        }
      }
    }
  }

  private handleParagraph(content: JSONContent) {
    this.handleSecondLevel(content.content ?? []);
    this.pushText("\n\n");
  }
  private handleList(bl: JSONContent, numbered: boolean) {
    const items = bl.content ?? [];

    for (const [item, listIdx] of items.map((it, idx) => [it, idx] as const)) {
      if (item.type !== "listItem") {
        throw new Error(`Unexpected list item type: ${item.type}`);
      }
      this.pushText(numbered ? `${listIdx + 1}. ` : "- ");

      const itemContent = item.content ?? [];
      if (itemContent.length != 1 && itemContent[0].type != "paragraph") {
        throw new Error(`Unexpected list item content type: ${itemContent[0].type}`);
      }
      this.inListItem = true;
      this.handleSecondLevel(itemContent[0].content ?? []);
      this.inListItem = false;
      this.addSingleBreak();
    }
    this.addSingleBreak();
  }

  private handleHorizontalRule(_content: JSONContent) {
    this.addDoubleBreak();
    this.pushText("----");
    this.addDoubleBreak();
  }

  private handleTopLevel(arr: JSONContent[]) {
    for (const content of arr) {
      switch (content.type) {
        case "authorSelect": {
          this.handleAuthorSelect(content);
          break;
        }
        case "heading": {
          this.handleHeading(content);
          break;
        }
        case "paragraph": {
          this.handleParagraph(content);
          break;
        }
        case "bulletList": {
          this.handleList(content, false);
          break;
        }
        case "orderedList": {
          this.handleList(content, true);
          break;
        }
        case "horizontalRule": {
          this.handleHorizontalRule(content);
          break;
        }
        default: {
          throw new Error(`Unexpected top level content type: ${content.type}`);
        }
      }
    }

    this.acc.push({ author: this.currentAuthor, tasks: this.messageTasks });
  }

  getErrors(): CustomError[] {
    return this.errors;
  }
  getAcc(): MessageOfAuthor[] {
    return this.acc.map((data) => {
      const tasks = [...data.tasks];
      // trim left first, trim right last
      const first = tasks[0];
      if (first != null && first.tag === "AddTextTask") {
        first.text = first.text.trimStart();
      }

      const last = tasks[tasks.length - 1];
      if (last != null && last.tag === "AddTextTask") {
        last.text = last.text.trimEnd();
      }

      return { ...data, tasks };
    });
  }
}
