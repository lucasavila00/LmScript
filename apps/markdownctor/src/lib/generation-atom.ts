import { atomFamily } from "recoil";
import { GenerationInput } from "./types";
export type UiGenerationData = {
  state: "loading" | "initialized" | "finished" | "error";
  captures: Record<string, unknown>;
  finalText: string | undefined;
  error?: unknown;
};
import { AbstractBackend, Task } from "@lmscript/client/backends/abstract";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { assertIsNever } from "./utils";
import { BULLET_LIST_REGEX, NUMBERED_LIST_REGEX } from "@lmscript/client/regex";
const getInstance = (): AbstractBackend => {
  return new SGLangBackend({
    url: "http://localhost:8080/http://localhost:30000",
    template: "mistral",
  });
};
const getTasks = (input: GenerationInput) => {
  const tasks: Task[] = [
    {
      tag: "StartRoleTask",
      role: "user",
    },
    {
      tag: "AddTextTask",
      text: input.prompt,
    },
    {
      tag: "AddTextTask",
      text: input.md,
    },
    {
      tag: "StartRoleTask",
      role: "assistant",
    },
    ...input.parsedMd.flatMap((block): Task[] => {
      switch (block.tag) {
        case "error": {
          return [
            {
              tag: "AddTextTask",
              text: block.original,
            },
          ];
        }
        case "heading": {
          return [
            {
              tag: "AddTextTask",
              text: "#".repeat(block.level),
            },
            {
              tag: "GenerateTask",
              max_tokens: 1024,
              name: block.uuid,
              stop: ["\n"],
              regex: undefined,
            },
            {
              tag: "AddTextTask",
              text: "\n\n",
            },
          ];
        }
        case "paragraph": {
          return [
            {
              tag: "GenerateTask",
              max_tokens: 1024,
              name: block.uuid,
              stop: ["\n\n"],
              regex: undefined,
            },
          ];
        }
        case "list": {
          const regex = block.ordered ? NUMBERED_LIST_REGEX : BULLET_LIST_REGEX;
          return [
            {
              tag: "GenerateTask",
              max_tokens: 1024,
              name: block.uuid,
              stop: ["\n\n"],
              regex,
            },
          ];
        }
        default: {
          return assertIsNever(block);
        }
      }
    }),
  ];

  return tasks;
};
export const generateAsyncAtom = atomFamily<
  UiGenerationData,
  {
    input: GenerationInput;
    cacheBuster: number;
  }
>({
  key: "generateAsyncAtom",
  default: (_param) => {
    return {
      state: "initialized",
      captures: {},
      finalText: undefined,
    };
  },
  effects: (param) => [
    (opts) => {
      const instance = getInstance();
      const tasks = getTasks(param.input);

      instance
        .executeJSON(
          {
            tasks,
            sampling_params: {
              temperature: 0.1,
            },
            initial_state: {
              text: "",
              captured: {},
            },
          },
          {
            onCapture: (cap) => {
              opts.setSelf((prev) => {
                if ("captures" in prev) {
                  return {
                    captures: {
                      ...prev.captures,
                      [cap.name]: String(cap.value),
                    },
                    finalText: undefined,
                    state: "loading",
                  };
                }
                return prev;
              });
            },
          },
        )
        .then((out) => {
          opts.setSelf((prev) => {
            if ("captures" in prev) {
              return {
                captures: {
                  ...prev.captures,
                  ...Object.fromEntries(
                    Object.entries(out.captured).map(([k, v]) => [k, String(v)]),
                  ),
                },
                finalText: out.text,
                state: "finished",
              };
            }
            return prev;
          });
        })
        .catch((error) => {
          opts.setSelf((prev) => {
            if ("captures" in prev) {
              return {
                ...prev,
                state: "error",
                error,
              };
            }
            return prev;
          });
        });
    },
  ],
});
