import { Backend } from "../../../editor/hooks/useRunner";
import {
  MessageOfAuthor,
  getMessagesOfAuthor,
} from "../../../editor/lib/playMessages";
import {
  EditorState,
  NamedVariable,
  SamplingParams,
} from "../../../editor/lib/types";
import { FC } from "react";
import { useRecoilValueLoadable } from "recoil";
import { generateAsyncAtom } from "./recoil";
import { Loading } from "../../../components/ui/loading";
import { assertIsNever } from "../../../lib/utils";
import { HtmlPlay } from "./HtmlPlay";

const PlayStream: FC<{
  backend: Backend;
  messages: MessageOfAuthor[];
  samplingParams: SamplingParams;
  variables: NamedVariable[];
  editorState: EditorState;
}> = ({ variables, backend, messages, samplingParams, editorState }) => {
  const loadable = useRecoilValueLoadable(
    generateAsyncAtom({
      samplingParams,
      backend,
      messages,
      variables,
    }),
  );
  switch (loadable.state) {
    case "hasError": {
      return <>TODO: error {loadable.contents}</>;
    }
    case "loading": {
      return <Loading />;
    }
    case "hasValue": {
      return (
        <HtmlPlay
          uiGenerationData={loadable.contents}
          editorState={editorState}
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
  return <>TODO: error {JSON.stringify(msgs)}</>;
};
