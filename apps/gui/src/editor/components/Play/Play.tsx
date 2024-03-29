import { Backend } from "../../hooks/useBackendConfig";
import { LmEditorState } from "@lmscript/editor-tools/types";
import { FC, useState } from "react";
import { useRecoilValueLoadable } from "recoil";
import { generateAsyncAtom } from "./recoil";
import { assertIsNever } from "../../../lib/utils";
import { HtmlPlay } from "./HtmlPlay";

const PlayStream: FC<{
  backend: Backend;
  editorState: LmEditorState;
  onOpenBackendConfig: () => void;
}> = ({ backend, editorState, onOpenBackendConfig }) => {
  const [cacheBuster, setCacheBuster] = useState(0);
  const onRetry = () => setCacheBuster((prev) => prev + 1);
  const loadable = useRecoilValueLoadable(
    generateAsyncAtom({
      editorState,
      backend,
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

export const Play: FC<{
  backend: Backend;
  editorState: LmEditorState;
  onOpenBackendConfig: () => void;
}> = ({ editorState, backend, onOpenBackendConfig }) => {
  return (
    <PlayStream
      backend={backend}
      editorState={editorState}
      onOpenBackendConfig={onOpenBackendConfig}
    />
  );
};
