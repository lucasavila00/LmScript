import { Content } from "@tiptap/react";
import { NamedVariable } from "../context/variables";

type InitialContent = {
  doc: Content;
  variables: NamedVariable[];
};
export const initialContent: InitialContent = {
  variables: [
    {
      name: "content",
      value:
        'Question: "What is the person doing?" Answer: "The person is happy"',
    },
    { name: "PERSON_ILLUSTRATOR", value: "A person." },
    { name: "OBJECT_ILLUSTRATOR", value: "An object." },
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
          { type: "variableSelect", attrs: { name: "PERSON_ILLUSTRATOR" } },
          { type: "text", text: '" or "' },
          { type: "variableSelect", attrs: { name: "OBJECT_ILLUSTRATOR" } },
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
          { type: "variableSelect", attrs: { name: "PERSON_ILLUSTRATOR" } },
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
          { type: "variableSelect", attrs: { name: "OBJECT_ILLUSTRATOR" } },
        ],
      },
      { type: "authorSelect", attrs: { author: "assistant" } },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Explanation: " },
          {
            type: "lmGenerator",
            attrs: { name: "_explanation", stop: ["\n"], max_tokens: 256 },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Illustrate: " },
          {
            type: "lmChoices",
            attrs: {
              name: "illustrator",
              choices: [
                { tag: "variable", value: "PERSON_ILLUSTRATOR" },
                { tag: "variable", value: "OBJECT_ILLUSTRATOR" },
              ],
            },
          },
        ],
      },
    ],
  },
};
