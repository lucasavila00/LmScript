import { JSONContent } from "@tiptap/react";
import { Author, EditorState, GenerationNodeAttrs } from "./types";

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

export type Error = {
  tag: "variable-not-found";
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
  private readonly root: JSONContent;
  constructor(
    private readonly editorState: Pick<EditorState, "doc" | "variables">,
  ) {
    const root = this.editorState.doc;
    if (root.type !== "doc") {
      throw new Error("Expected doc as root");
    }
    const first = root.content?.[0];
    if (first == null || first.type !== "authorSelect") {
      throw new Error("Expected authorSelect at first position");
    }

    this.currentAuthor = first.attrs?.author;
    this.root = root;
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
    this.pushText("#".repeat(level));
    this.handleSecondLevel(content.content ?? []);
    this.pushText("\n\n");
  }

  private handleSecondLevel(arr: JSONContent[]) {
    for (const content of arr) {
      switch (content.type) {
        case "text": {
          this.pushText(content.text ?? "");
          break;
        }
        case "variableSelect": {
          const variableName = content.attrs?.name;
          const fromVariables = this.editorState.variables.find(
            (v) => v.name === variableName,
          );
          if (fromVariables?.value == null) {
            this.errors.push({
              tag: "variable-not-found",
              variableId: variableName,
            });
          } else {
            this.pushText(fromVariables.value);
          }
          break;
        }
        case "lmGenerator": {
          this.messageParts.push({
            tag: "lmGenerate",
            nodeAttrs: content.attrs as GenerationNodeAttrs,
          });
          break;
        }
        default: {
          throw new Error(`Unexpected content type: ${content.type}`);
        }
      }
    }
  }

  private handleParagraph(content: JSONContent) {
    this.handleSecondLevel(content.content ?? []);
    this.pushText("\n\n");
  }

  handleTopLevel() {
    for (const content of (this.root.content ?? []).slice(1)) {
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
        default: {
          throw new Error(`Unexpected content type: ${content.type}`);
        }
      }
    }

    this.acc.push({ author: this.currentAuthor, parts: this.messageParts });
  }

  getErrors(): Error[] {
    return this.errors;
  }
  getAcc(): MessageOfAuthor[] {
    return this.acc;
  }
}

export const getMessagesOfAuthor = (
  editorState: EditorState,
): TransformResult => {
  const state = new MessageOfAuthorGetter(editorState);
  state.handleTopLevel();

  const errors = state.getErrors();
  if (errors.length > 0) {
    return { tag: "error", value: errors };
  }
  const acc = state.getAcc();
  return { tag: "success", value: acc };
};
