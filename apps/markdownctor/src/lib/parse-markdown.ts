import { lexer, Tokens } from "marked";

type ParsedBlockError = {
  tag: "error";
  error: unknown;
  original: string;
};

type ParsedBlockHeading = {
  tag: "heading";
  level: number;
  content: string;
};

type ParsedBlockParagraph = {
  tag: "paragraph";
  content: string;
};

type ParsedBlockList = {
  tag: "list";
  items: string[];
  ordered: boolean;
};

type ParsedBlock = ParsedBlockError | ParsedBlockHeading | ParsedBlockParagraph | ParsedBlockList;

const parseBlockThrowing = (block: string): ParsedBlock[] => {
  const parsed = lexer(block);

  return parsed.map((item) => {
    switch (item.type) {
      case "paragraph": {
        return {
          tag: "paragraph",
          content: item.text,
        };
      }
      case "list": {
        return {
          tag: "list",
          items: (item as Tokens.List).items.map((i) => i.text),
          ordered: (item as Tokens.List).ordered,
        };
      }
      case "heading": {
        return {
          tag: "heading",
          level: item.depth,
          content: item.text,
        };
      }
      default: {
        throw new Error(`Unknown type: ${item.type}`);
      }
    }
  });
};

export const parseMarkdown = (text: string): ParsedBlock[] => {
  const blocks = text.split("\n\n");

  return blocks.flatMap((block) => {
    try {
      return parseBlockThrowing(block);
    } catch (e) {
      return {
        tag: "error",
        error: e,
        original: block,
      };
    }
  });
};
