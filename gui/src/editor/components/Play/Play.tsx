import { Backend } from "../../hooks/useBackendConfig";
import {
  MessageOfAuthor,
  getMessagesOfAuthor,
} from "../../../editor/lib/playMessages";
import {
  EditorState,
  NamedVariable,
  SamplingParams,
} from "../../../editor/lib/types";
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
  editorState: EditorState;
}> = ({ variables, backend, messages, samplingParams, editorState }) => {
  const [cacheBumper, setCacheBumper] = useState(0);
  const onRetry = () => setCacheBumper((prev) => prev + 1);
  const loadable = useRecoilValueLoadable(
    generateAsyncAtom({
      samplingParams,
      backend,
      messages,
      variables,
      cacheBumper,
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
        />
      );
    }
    default: {
      return assertIsNever(loadable);
    }
  }
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
        editorState={editorState}
      />
    );
  }
  return <>TODO: validation error {JSON.stringify(msgs)}</>;
};
