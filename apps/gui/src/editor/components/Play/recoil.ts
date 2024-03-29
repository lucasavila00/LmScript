import { Backend } from "../../hooks/useBackendConfig";
import { LmEditorState, UiGenerationData } from "@lmscript/editor-tools/types";
import { compileEditorState } from "@lmscript/editor-tools";
import { atomFamily } from "recoil";
import { GetBackendInstance } from "../../../lib/get-lmscript-backend";

export const generateAsyncAtom = atomFamily<
  UiGenerationData,
  {
    backend: Backend;
    editorState: LmEditorState;
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
      const getter = (window as any).getBackendInstance as GetBackendInstance;
      const instance = getter(param.backend);
      const tasks = compileEditorState(param.editorState, param.backend.template);

      instance
        .executeJSON(
          {
            tasks,
            sampling_params: param.editorState.samplingParams,
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
                      [cap.name]: cap.value,
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
                captures: out.captured,
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
