import { JSONContent } from "@tiptap/react";
import { Author, EditorState } from "./types";

type MessagePartText = {
  tag: "text";
  text: string;
};

type MessagePartCapture = {
  tag: "capture";
  id: string;
};

type MessagePart = MessagePartText | MessagePartCapture;

type MessageOfAuthor = {
  author: Author;
  parts: MessagePart[];
};

class MessageOfAuthorGetter {
  private currentAuthor: Author;
  private messageParts: MessagePart[] = [];
  private acc: MessageOfAuthor[] = [];
  private readonly root: JSONContent;
  constructor(private readonly editorState: EditorState) {
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

  private handleHeading(content: JSONContent) {
    const level = Number(content.attrs?.level ?? 0);
    const children = this.handleSecondLevel(content.content ?? []);
    this.messageParts.push({
      tag: "text",
      text: `${"#".repeat(level)} ${children}\n`,
    });
  }

  private handleSecondLevel(arr: JSONContent[]): string {
    let acc = "";
    for (const content of arr) {
      switch (content.type) {
        case "text": {
          acc += content.text;
          break;
        }
        default: {
          throw new Error(`Unexpected content type: ${content.type}`);
        }
      }
    }
    return acc;
  }

  private handleParagraph(content: JSONContent) {
    const children = this.handleSecondLevel(content.content ?? []);
    this.messageParts.push({ tag: "text", text: `${children}\n` });
  }

  handleTopLevel(): MessageOfAuthor[] {
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

    return this.acc;
  }
}

export const getMessagesOfAuthor = (
  editorState: EditorState,
): MessageOfAuthor[] => {
  return new MessageOfAuthorGetter(editorState).handleTopLevel();
};
