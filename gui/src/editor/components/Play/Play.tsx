import { Backend } from "../../hooks/useBackendConfig";
import {
  MessageOfAuthor,
  TransformError,
  getMessagesOfAuthor,
} from "../../../editor/lib/playMessages";
import { LmEditorState, NamedVariable, SamplingParams } from "../../../editor/lib/types";
import { FC, useState } from "react";
import { useRecoilValueLoadable } from "recoil";
import { generateAsyncAtom } from "./recoil";
import { assertIsNever } from "../../../lib/utils";
import { HtmlPlay } from "./HtmlPlay";

const PlayStream: FC<{
  backend: Backend;
  messages: MessageOfAuthor[];
  samplingParams: SamplingParams;
  variables: NamedVariable[];
  editorState: LmEditorState;
  onOpenBackendConfig: () => void;
}> = ({ variables, backend, messages, samplingParams, editorState, onOpenBackendConfig }) => {
  const [cacheBuster, setCacheBuster] = useState(0);
  const onRetry = () => setCacheBuster((prev) => prev + 1);
  const loadable = useRecoilValueLoadable(
    generateAsyncAtom({
      samplingParams,
      backend,
      messages,
      variables,
      cacheBuster,
    }),
  );
  switch (loadable.state) {
    case "hasError": {
      // this should never happen as this atom does not hold a promise, just an effect
      throw loadable.contents;
    }
    case "loading": {
      // this should never happen as this atom does not hold a promise, just an effect
      return <></>;
    }
    case "hasValue": {
      return (
        <HtmlPlay
          uiGenerationData={loadable.contents}
          editorState={editorState}
          onRetry={onRetry}
          onOpenBackendConfig={onOpenBackendConfig}
        />
      );
    }
    default: {
      return assertIsNever(loadable);
    }
  }
};

export const ValidationError: FC<{ transformResult: TransformError }> = ({ transformResult }) => {
  return (
    <div className="flex items-center justify-center flex-col mt-8 gap-2">
      <div className="text-lg font-medium">Validation Error</div>
      {transformResult.value
        .map((err) => {
          switch (err.tag) {
            case "variable-not-found": {
              return `There are variable inputs unconnected`;
            }
            case "variable-in-choice-not-found": {
              return `There are variable inputs unconnected in a choice generation`;
            }
            default: {
              return assertIsNever(err);
            }
          }
        })
        .map((str, idx) => {
          return (
            <div key={idx} className="text-sm text-muted-foreground max-w-xl text-center">
              {str}
            </div>
          );
        })}
    </div>
  );
};

export const Play: FC<{
  backend: Backend;
  editorState: LmEditorState;
  onOpenBackendConfig: () => void;
}> = ({ editorState, backend, onOpenBackendConfig }) => {
  const msgs = getMessagesOfAuthor(editorState);
  if (msgs.tag === "success") {
    return (
      <PlayStream
        backend={backend}
        messages={msgs.value}
        samplingParams={editorState.samplingParams}
        variables={editorState.variables}
        editorState={editorState}
        onOpenBackendConfig={onOpenBackendConfig}
      />
    );
  }
  return <ValidationError transformResult={msgs} />;
};
