import { test, expect } from "vitest";
import { getMessagesOfAuthor } from "../src/editor/lib/playMessages";
import { SamplingParams } from "../src/editor/lib/types";

const SAMPLING_PARAMS: SamplingParams = {
  temperature: 0.1,
};
test("no author select in first position", async () => {
  const msgs = () =>
    getMessagesOfAuthor({
      variables: [],
      samplingParams: SAMPLING_PARAMS,
      doc: {
        type: "doc",
        content: [],
      },
    });
  expect(() => msgs()).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected authorSelect at first position]`,
  );
});

test("empty state", async () => {
  const msgs = getMessagesOfAuthor({
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [{ type: "authorSelect", attrs: { author: "user" } }],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "parts": [],
        },
      ],
    }
  `);
});

test("handles paragraph", async () => {
  const msgs = getMessagesOfAuthor({
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
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "parts": [
            {
              "tag": "text",
              "text": "What is the best subject for the illustration to accompany the following?

    ",
            },
          ],
        },
      ],
    }
  `);
});

test("handles heading", async () => {
  const msgs = getMessagesOfAuthor({
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Content" }],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "parts": [
            {
              "tag": "text",
              "text": "###Content

    ",
            },
          ],
        },
      ],
    }
  `);
});

test("handles variableSelect", async () => {
  const msgs = getMessagesOfAuthor({
    variables: [
      {
        name: "content",
        value:
          'Question: "What is the person doing?" Answer: "The person is happy"',
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
            { type: "variableSelect", attrs: { name: "content" } },
            { type: "text", text: '"' },
          ],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "parts": [
            {
              "tag": "text",
              "text": ""Question: "What is the person doing?" Answer: "The person is happy""

    ",
            },
          ],
        },
      ],
    }
  `);
});

test("handles missing variableSelect", async () => {
  const msgs = getMessagesOfAuthor({
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
        {
          type: "paragraph",
          content: [{ type: "variableSelect", attrs: { name: "content" } }],
        },
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "error",
      "value": [
        {
          "tag": "variable-not-found",
          "variableId": "content",
        },
      ],
    }
  `);
});

test("handles lmGenerator", async () => {
  const msgs = getMessagesOfAuthor({
    variables: [],
    samplingParams: SAMPLING_PARAMS,
    doc: {
      type: "doc",
      content: [
        { type: "authorSelect", attrs: { author: "user" } },
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
      ],
    },
  });
  expect(msgs).toMatchInlineSnapshot(`
    {
      "tag": "success",
      "value": [
        {
          "author": "user",
          "parts": [
            {
              "tag": "text",
              "text": "Explanation: ",
            },
            {
              "nodeAttrs": {
                "choices": [],
                "id": "720ddbc0-12e6-4583-83b6-d0229a60445b",
                "max_tokens": 256,
                "name": "_explanation",
                "stop": [
                  "
    ",
                ],
                "type": "generation",
              },
              "tag": "lmGenerate",
            },
            {
              "tag": "text",
              "text": "

    ",
            },
          ],
        },
      ],
    }
  `);
});
