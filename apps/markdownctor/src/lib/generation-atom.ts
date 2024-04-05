import { atomFamily } from "recoil";
import { GenerationInput } from "./types";
export type UiGenerationData = {
  state: "loading" | "initialized" | "finished" | "error";
  captures: Record<string, unknown>;
  finalText: string | undefined;
  error?: unknown;
};
import { AbstractBackend, Task } from "@lmscript/client/backends/abstract";
import { parseMarkdown } from "./parse-markdown";
import { assertIsNever } from "./utils";

const getInstance = (): AbstractBackend => {
  throw new Error("not implemented");
};
const getTasks = (input: GenerationInput) => {
  const tasks: Task[] = [
    {
      tag: "StartRoleTask",
      role: "user",
    },
    {
      tag: "AddTextTask",
      text: input.md,
    },
    {
      tag: "StartRoleTask",
      role: "assistant",
    },
    ...parseMarkdown(input.md).flatMap((block): Task[] => {
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
          throw new Error("not implemented");
        }
        case "paragraph": {
          throw new Error("not implemented");
        }
        case "list": {
          throw new Error("not implemented");
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
              temperature: 0.5,
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
