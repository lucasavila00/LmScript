import { HtmlPlay } from "../editor/components/Play/HtmlPlay";
import { LmEditorState } from "../editor/lib/types";

const meta = {
  title: "HtmlPlay",
  parameters: {
    // layout: "centered",
  },
};

export default meta;

const editorState: Pick<LmEditorState, "doc" | "variables"> = {
  variables: [
    {
      name: "content",
      value: 'Question: "What is the person doing?" Answer: "The person is happy"',
      uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3",
    },
    {
      name: "PERSON",
      value: "A person.",
      uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4",
    },
    {
      name: "OBJECT",
      value: "An object.",
      uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
    },
  ],
  doc: {
    type: "doc",
    content: [
      { type: "authorSelect", attrs: { author: "user" } },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "What is the best subject for the illustration to accompany the following?",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Content" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: '"' },
          {
            type: "variableSelect",
            attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3" },
          },
          { type: "text", text: '"' },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Instructions" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "First explain why you're choosing the best subject for the illustration, then choose the best subject for the illustration, either a person or an object. Answer with just \"",
          },
          {
            type: "variableSelect",
            attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4" },
          },
          { type: "text", text: '" or "' },
          {
            type: "variableSelect",
            attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5" },
          },
          { type: "text", text: '".' },
        ],
      },
      { type: "paragraph", content: [{ type: "text", text: "For example:" }] },
      {
        type: "heading",
        attrs: { level: 4 },
        content: [{ type: "text", text: "Example 1" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Explanation: I'm choosing a person because the scene is about a person.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Illustrate: " },
          {
            type: "variableSelect",
            attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4" },
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 4 },
        content: [{ type: "text", text: "Example 2" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Explanation: I'm choosing an object because the scene is about an object.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Illustrate: " },
          {
            type: "variableSelect",
            attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5" },
          },
        ],
      },
      { type: "authorSelect", attrs: { author: "assistant" } },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Explanation: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "720ddbc0-12e6-4583-83b6-d0229a60445b",
              choices: [],
              type: "generation",
              max_tokens: 256,
              name: "_explanation",
              stop: ["\n"],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Illustrate: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "id9100e156-5a1c-4ae5-bcf9-bc531a659220",
              choices: [
                {
                  label: "{PERSON}",
                  value: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4",
                  tag: "variable",
                },
                {
                  label: "{OBJECT}",
                  value: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
                  tag: "variable",
                },
              ],
              type: "selection",
              max_tokens: 16,
              name: "illustrator",
              stop: [],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "A list: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e6",
              choices: [],
              type: "generation",
              max_tokens: 256,
              name: "bullet_list",
              stop: ["\n"],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "An ordered list: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e7",
              choices: [],
              type: "generation",
              max_tokens: 256,
              name: "ordered_list",
              stop: ["\n"],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "An heading 2: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e8",
              choices: [],
              type: "generation",
              max_tokens: 256,
              name: "ordered_list",
              stop: ["\n"],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Multi paragraphs: " },
          {
            type: "lmGenerator",
            attrs: {
              id: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e9",
              choices: [],
              type: "generation",
              max_tokens: 256,
              name: "ordered_list",
              stop: ["\n"],
            },
          },
        ],
      },
    ],
  },
};
export const LoadingAll = () => {
  return (
    <HtmlPlay
      uiGenerationData={{
        state: "loading",
        captures: {},
        finalText: undefined,
      }}
      onRetry={() => {}}
      editorState={editorState}
      onOpenBackendConfig={() => {}}
    />
  );
};

export const LoadingSecond = () => {
  return (
    <HtmlPlay
      uiGenerationData={{
        state: "loading",
        captures: {
          "720ddbc0-12e6-4583-83b6-d0229a60445b": "The explanation!",
        },
        finalText: undefined,
      }}
      onRetry={() => {}}
      editorState={editorState}
      onOpenBackendConfig={() => {}}
    />
  );
};

export const LoadedAll = () => {
  return (
    <HtmlPlay
      uiGenerationData={{
        state: "finished",
        captures: {
          "720ddbc0-12e6-4583-83b6-d0229a60445b": "The explanation!",
          "id9100e156-5a1c-4ae5-bcf9-bc531a659220": "A person.",
          "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e6": `
- A list item 1
- A list item 2
`,
          "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e7": `
1. B list item 1
2. B list item 2
`,
          "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e8": `## Heading 2`,
          "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e9": `Paragraph 1

Paragraph 2`,
        },
        finalText: undefined,
      }}
      onRetry={() => {}}
      editorState={editorState}
      onOpenBackendConfig={() => {}}
    />
  );
};
