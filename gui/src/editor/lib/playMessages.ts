import { JSONContent } from "@tiptap/react";
import { Author, LmEditorState, GenerationNodeAttrs } from "./types";

export type MessagePartText = {
  tag: "text";
  text: string;
};

export type MessagePartGenerate = {
  tag: "lmGenerate";
  nodeAttrs: GenerationNodeAttrs;
};

export type MessagePart = MessagePartText | MessagePartGenerate;

export type MessageOfAuthor = {
  author: Author;
  parts: MessagePart[];
};

export type Error =
  | {
      tag: "variable-not-found";
      variableId: string;
    }
  | {
      tag: "variable-in-choice-not-found";
      variableId: string;
    };

export type TransformSuccess = {
  tag: "success";
  value: MessageOfAuthor[];
};

export type TransformError = {
  tag: "error";
  value: Error[];
};

export type TransformResult = TransformSuccess | TransformError;

class MessageOfAuthorGetter {
  private currentAuthor: Author;
  private messageParts: MessagePart[] = [];
  private acc: MessageOfAuthor[] = [];
  private errors: Error[] = [];
  private inListItem = false;
  constructor(private readonly editorState: Pick<LmEditorState, "doc" | "variables">) {
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
    this.acc.push({ author: this.currentAuthor, parts: this.messageParts });
    this.messageParts = [];
    this.currentAuthor = content.attrs?.author;
  }

  private pushText(text: string) {
    const last = this.messageParts[this.messageParts.length - 1];
    if (last?.tag === "text") {
      last.text += text;
      return;
    }
    this.messageParts.push({ tag: "text", text });
  }

  private handleHeading(content: JSONContent) {
    const level = Number(content.attrs?.level ?? 0);
    this.pushText("#".repeat(level) + " ");
    this.handleSecondLevel(content.content ?? []);
    this.addDoubleBreak();
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
            this.pushText(fromVariables.value);
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
          this.messageParts.push({
            tag: "lmGenerate",
            nodeAttrs,
          });
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

    this.acc.push({ author: this.currentAuthor, parts: this.messageParts });
  }

  getErrors(): Error[] {
    return this.errors;
  }
  getAcc(): MessageOfAuthor[] {
    return this.acc.map((data) => {
      const parts = [...data.parts];
      // trim left first, trim right last
      const first = parts[0];
      if (first != null && first.tag === "text") {
        first.text = first.text.trimStart();
      }

      const last = parts[parts.length - 1];
      if (last != null && last.tag === "text") {
        last.text = last.text.trimEnd();
      }

      return { ...data, parts };
    });
  }
}

export const getMessagesOfAuthor = (editorState: LmEditorState): TransformResult => {
  const state = new MessageOfAuthorGetter(editorState);

  const errors = state.getErrors();
  if (errors.length > 0) {
    return { tag: "error", value: errors };
  }
  const acc = state.getAcc();
  return { tag: "success", value: acc };
};
