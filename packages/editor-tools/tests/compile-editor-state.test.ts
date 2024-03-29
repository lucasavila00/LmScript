import { test, expect } from "vitest";
import { SamplingParams } from "../src/types";
import { compileEditorState } from "../src/mod";

const SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.1,
};
test("handles paragraph", async () => {
  const msgs = compileEditorState(
    {
      version: "1",
      variables: [],
      samplingParams: SAMPLING_PARAMS,
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
        ],
      },
    },
    "mistral",
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "tag": "AddTextTask",
        "text": "<s>[INST] ",
      },
      {
        "tag": "AddTextTask",
        "text": "What is the best subject for the illustration to accompany the following?",
      },
      {
        "tag": "AddTextTask",
        "text": " [/INST]",
      },
    ]
  `);
});

test("handles variable override", async () => {
  const msgs = compileEditorState(
    {
      version: "1",
      variables: [
        {
          name: "content",
          value: 'Question: "What is the person doing?" Answer: "The person is happy"',
          uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
        },
      ],
      samplingParams: SAMPLING_PARAMS,
      doc: {
        type: "doc",
        content: [
          { type: "authorSelect", attrs: { author: "user" } },
          {
            type: "paragraph",
            content: [
              { type: "text", text: '"' },
              {
                type: "variableSelect",
                attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5" },
              },
              { type: "text", text: '"' },
            ],
          },
        ],
      },
    },
    "mistral",
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "tag": "AddTextTask",
        "text": "<s>[INST] ",
      },
      {
        "tag": "AddTextTask",
        "text": ""Question: "What is the person doing?" Answer: "The person is happy""",
      },
      {
        "tag": "AddTextTask",
        "text": " [/INST]",
      },
    ]
  `);
});
test("handles variable override", async () => {
  const msgs = compileEditorState(
    {
      version: "1",
      variables: [
        {
          name: "content",
          value: 'Question: "What is the person doing?" Answer: "The person is happy"',
          uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
        },
      ],
      samplingParams: SAMPLING_PARAMS,
      doc: {
        type: "doc",
        content: [
          { type: "authorSelect", attrs: { author: "user" } },
          {
            type: "paragraph",
            content: [
              { type: "text", text: '"' },
              {
                type: "variableSelect",
                attrs: { uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5" },
              },
              { type: "text", text: '"' },
            ],
          },
        ],
      },
    },
    "mistral",
    {
      content: "The new content",
    },
  );
  expect(msgs).toMatchInlineSnapshot(`
    [
      {
        "tag": "AddTextTask",
        "text": "<s>[INST] ",
      },
      {
        "tag": "AddTextTask",
        "text": ""The new content"",
      },
      {
        "tag": "AddTextTask",
        "text": " [/INST]",
      },
    ]
  `);
});
