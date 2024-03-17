import { Backend } from "@/editor/hooks/useRunner";
import {
  MessageOfAuthor,
  getMessagesOfAuthor,
} from "@/editor/lib/playMessages";
import { EditorState, NamedVariable, SamplingParams } from "@/editor/lib/types";
import { assertIsNever } from "@/lib/utils";
import { FC } from "react";
import { atomFamily, useRecoilValueLoadable } from "recoil";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { AbstractBackend } from "@lmscript/client/backends/abstract";
import { messagesToTasks } from "@/editor/lib/messageToTasks";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
const getBackendInstance = (backend: Backend): AbstractBackend => {
  switch (backend.tag) {
    case "runpod-serverless-sglang": {
      return new RunpodServerlessBackend(backend.url, backend.token);
    }
    case "runpod-serverless-vllm": {
      return new VllmBackend({
        url: backend.url,
        auth: backend.token,
        model: backend.model,
      });
    }
    case "sglang": {
      return new SGLangBackend(backend.url);
    }
    default: {
      return assertIsNever(backend);
    }
  }
};

type Captures = Record<string, string>;
const generateAsyncAtom = atomFamily<
  {
    captures: Captures;
    finalText: string | undefined;
  },
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
      captures: {},
      finalText: undefined,
    };
  },
  effects: (param) => [
    (opts) => {
      const instance = getBackendInstance(param.backend);
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
              };
            }
            return prev;
          });
        });
    },
  ],
});

const PlayStream: FC<{
  backend: Backend;
  messages: MessageOfAuthor[];
  samplingParams: SamplingParams;
  variables: NamedVariable[];
}> = ({ variables, backend, messages, samplingParams }) => {
  const generationAtom = useRecoilValueLoadable(
    generateAsyncAtom({
      samplingParams,
      backend,
      messages,
      variables,
    }),
  );

  console.log(generationAtom);

  return <></>;
};

export const Play: FC<{
  backend: Backend;
  editorState: EditorState;
}> = ({ editorState, backend }) => {
  const msgs = getMessagesOfAuthor(editorState);
  if (msgs.tag === "success") {
    return (
      <PlayStream
        backend={backend}
        messages={msgs.value}
        samplingParams={editorState.samplingParams}
        variables={editorState.variables}
      />
    );
  }
  return <>TODO: error {JSON.stringify(msgs)}</>;
};
