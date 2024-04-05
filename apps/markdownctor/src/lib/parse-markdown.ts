import { lexer, Tokens } from "marked";

export type ParsedBlockError = {
  uuid: string;
  tag: "error";
  error: string;
  original: string;
};

export type ParsedBlockHeading = { uuid: string; tag: "heading"; level: number; content: string };

export type ParsedBlockParagraph = { uuid: string; tag: "paragraph"; content: string };

export type ParsedBlockList = { uuid: string; tag: "list"; items: string[]; ordered: boolean };

export type ParsedBlock =
  | ParsedBlockError
  | ParsedBlockHeading
  | ParsedBlockParagraph
  | ParsedBlockList;

export const parseMarkdown = (block: string): ParsedBlock[] => {
  const parsed = lexer(block);

  return parsed.map((item) => {
    switch (item.type) {
      case "paragraph": {
        return {
          uuid: crypto.randomUUID(),
          tag: "paragraph",
          content: item.text,
        };
      }
      case "list": {
        return {
          uuid: crypto.randomUUID(),
          tag: "list",
          items: (item as Tokens.List).items.map((i) => i.text),
          ordered: (item as Tokens.List).ordered,
        };
      }
      case "heading": {
        return { uuid: crypto.randomUUID(), tag: "heading", level: item.depth, content: item.text };
      }
      default: {
        return {
          uuid: crypto.randomUUID(),
          tag: "error",
          error: String(`Type not supported: ${item.type}`),
          original: item.raw,
        };
      }
    }
  });
};
