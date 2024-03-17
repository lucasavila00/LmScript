import { Backend } from "../../hooks/useBackendConfig";
import { MessageOfAuthor } from "../../../editor/lib/playMessages";
import {
  NamedVariable,
  SamplingParams,
  UiGenerationData,
} from "../../../editor/lib/types";
import { messagesToTasks } from "../../../editor/lib/messageToTasks";
import { atomFamily } from "recoil";
import { GetBackendInstance } from "../../../lib/get-lmscript-backend";

export const generateAsyncAtom = atomFamily<
  UiGenerationData,
  {
    backend: Backend;
    messages: MessageOfAuthor[];
    samplingParams: SamplingParams;
    variables: NamedVariable[];
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
      const tasks = messagesToTasks(
        param.messages,
        param.backend.template,
        param.variables,
      );

      instance
        .executeJSON(
          {
            tasks,
            sampling_params: param.samplingParams,
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
        });
    },
  ],
});
