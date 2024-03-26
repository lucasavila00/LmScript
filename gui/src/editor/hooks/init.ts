import { LmEditorState } from "../lib/types";

export const initialContent: LmEditorState = {
  doc: {
    type: "doc",
    content: [
      {
        type: "authorSelect",
        attrs: {
          author: "user",
        },
      },
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "LmScript GUI Tutorial",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "LmScript GUI allows you to create documents that will be completed by AI.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The editor allows you to create different formatting options, which are rendered as Markdown when sent to the AI.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "You can create:",
          },
        ],
      },
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "Heading 1",
          },
        ],
      },
      {
        type: "heading",
        attrs: {
          level: 2,
        },
        content: [
          {
            type: "text",
            text: "Heading 2",
          },
        ],
      },
      {
        type: "heading",
        attrs: {
          level: 3,
        },
        content: [
          {
            type: "text",
            text: "Heading 3",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "You can create a horizontal separator:",
          },
        ],
      },
      {
        type: "horizontalRule",
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Bullet list:",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Item A",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Item B",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "And also a numbered list",
          },
        ],
      },
      {
        type: "orderedList",
        attrs: {
          start: 1,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Item A",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Item B",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Besides the regular rich text editing, there are other features.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "You can use a variable. Make sure to configure it on the right-side-bar.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "variableSelect",
            attrs: {
              uuid: "98776deb-b048-4e90-96ff-90642c207c02",
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Before we get to the AI parts, let's change the current message author.",
          },
        ],
      },
      {
        type: "authorSelect",
        attrs: {
          author: "assistant",
        },
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "We can use AI to generate content, ending on a new line, or any stop pattern we'd like:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "We can start the line and ",
          },
          {
            type: "lmGenerator",
            attrs: {
              id: "be851f4c-8c63-49bc-a303-8078470308c2",
              choices: [],
              type: "generation",
              max_tokens: 16,
              name: "generation2",
              stop: ["\n"],
            },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "And we can choose among a set of options:",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: '"The best programming language is ',
          },
          {
            type: "lmGenerator",
            attrs: {
              id: "df9a7dec-146f-4857-b376-45573488ef81",
              choices: [
                {
                  tag: "typed",
                  value: "javascript",
                },
                {
                  tag: "typed",
                  value: "typescript",
                },
              ],
              type: "selection",
              max_tokens: 16,
              name: "select1",
              stop: [],
            },
          },
          {
            type: "text",
            text: '"',
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Remember: You can type / to open the suggestion menu, or click on the icons to the left of the paragraph!",
          },
        ],
      },
    ],
  },
  variables: [
    {
      name: "variable1",
      value: "The content of the first variable.",
      uuid: "98776deb-b048-4e90-96ff-90642c207c02",
    },
  ],
  samplingParams: {
    temperature: 0.1,
  },
  version: "1",
};
