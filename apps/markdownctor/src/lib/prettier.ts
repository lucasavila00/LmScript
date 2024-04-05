import prettier from "prettier/standalone";
import markdown from "prettier/plugins/markdown";

export const formatNoLineBreaks = (code: string): Promise<string> =>
  prettier.format(code, { parser: "markdown", plugins: [markdown], proseWrap: "never" });
