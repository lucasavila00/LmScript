import { HtmlPlay } from "../editor/components/Play/HtmlPlay";
import { EditorState } from "../editor/lib/types";

const meta = {
  title: "HtmlPlay",
  parameters: {
    // layout: "centered",
  },
};

export default meta;

const editorState: Pick<EditorState, "doc" | "variables"> = {
  variables: [
    {
      name: "content",
      value:
        'Question: "What is the person doing?" Answer: "The person is happy"',
    },
    { name: "PERSON", value: "A person." },
    { name: "OBJECT", value: "An object." },
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
          { type: "variableSelect", attrs: { name: "content" } },
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
          { type: "variableSelect", attrs: { name: "PERSON" } },
          { type: "text", text: '" or "' },
          { type: "variableSelect", attrs: { name: "OBJECT" } },
          { type: "text", text: '".' },
        ],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "For example:" }],
      },
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
          { type: "variableSelect", attrs: { name: "PERSON" } },
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
          { type: "variableSelect", attrs: { name: "OBJECT" } },
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
                { label: "{PERSON}", value: "PERSON", tag: "variable" },
                { label: "{OBJECT}", value: "OBJECT", tag: "variable" },
              ],
              type: "selection",
              max_tokens: 16,
              name: "illustrator",
              stop: [],
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
      editorState={editorState}
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
      editorState={editorState}
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
        },
        finalText: undefined,
      }}
      editorState={editorState}
    />
  );
};
