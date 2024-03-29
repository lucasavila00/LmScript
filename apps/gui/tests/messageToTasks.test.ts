import { test, expect } from "vitest";
import { messagePartToTasks } from "../src/editor/lib/messageToTasks";
test("messagePartToTasks handles typed variable in choices", () => {
  const res = messagePartToTasks(
    {
      tag: "lmGenerate",
      nodeAttrs: {
        choices: [{ tag: "typed", value: "{PERSON}" }],
        id: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4",
        max_tokens: 16,
        name: "illustrator",
        stop: [],
        type: "selection",
        regex: undefined,
      },
    },
    [
      {
        uuid: "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e5",
        name: "PERSON",
        value: "The object",
      },
    ],
  );
  expect(res).toMatchInlineSnapshot(`
    {
      "choices": [
        "The object",
      ],
      "name": "e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e4",
      "tag": "SelectTask",
    }
  `);
});
