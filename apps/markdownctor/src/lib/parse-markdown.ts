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

export const parseMarkdownUnbound = (
  block: string,
  deps: {
    randomUUID: () => string;
  },
): ParsedBlock[] => {
  const parsed = lexer(block);

  return parsed.map((item) => {
    switch (item.type) {
      case "paragraph": {
        return {
          uuid: deps.randomUUID(),
          tag: "paragraph",
          content: item.text,
        };
      }
      case "list": {
        return {
          uuid: deps.randomUUID(),
          tag: "list",
          items: (item as Tokens.List).items.map((i) => i.text),
          ordered: (item as Tokens.List).ordered,
        };
      }
      case "heading": {
        return { uuid: deps.randomUUID(), tag: "heading", level: item.depth, content: item.text };
      }
      default: {
        return {
          uuid: deps.randomUUID(),
          tag: "error",
          error: String(`Type not supported: ${item.type}`),
          original: item.raw,
        };
      }
    }
  });
};

export const parseMarkdown = (block: string): ParsedBlock[] => {
  return parseMarkdownUnbound(block, { randomUUID: () => crypto.randomUUID() });
};
