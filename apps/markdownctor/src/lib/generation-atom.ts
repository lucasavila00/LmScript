import { atomFamily } from "recoil";
import { GenerationInput } from "./types";
export type UiGenerationData = {
  state: "loading" | "initialized" | "finished" | "error";
  captures: Record<string, unknown>;
  finalText: string | undefined;
  error?: unknown;
};
import { AbstractBackend, Task } from "@lmscript/client/backends/abstract";

const getInstance = (): AbstractBackend => {
  throw new Error("not implemented");
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   const getter = (window as any).getBackendInstance as GetBackendInstance;
      //   const instance = getter(param.backend);
      //   const tasks = compileEditorState(param.editorState, {
      //     template: param.backend.template,
      //     useGenerationUuids: true,
      //   });

      const tasks: Task[] = [
        {
          tag: "AddTextTask",
          text: param.input.md,
        },
      ];

      const instance = getInstance();

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
