export const INITIAL_MARKDOWN = `## Title

\`\`\`jsx
function Demo() {
  return <div>demo</div>
}
\`\`\`

\`\`\`bash
# Not dependent on uiw.
npm install @codemirror/lang-markdown --save
npm install @codemirror/language-data --save
\`\`\`

[weisit ulr](https://uiwjs.github.io/react-codemirror/)

\`\`\`go
package main
import "fmt"
func main() {
  fmt.Println("Hello, 世界")
}
\`\`\`
`;

export type PromptExample = {
  id: string;
  title: string;
  value: string;
};

export const DEFAULT_PROMPT_EXAMPLE: PromptExample = {
  id: "fix_grammar",
  title: "Fix grammar",
  value: ``,
};
export const PROMPT_EXAMPLES: PromptExample[] = [DEFAULT_PROMPT_EXAMPLE];
