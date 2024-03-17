import { Backend } from "@/editor/hooks/useRunner";
import { getMessagesOfAuthor } from "@/editor/lib/playMessages";
import { EditorState } from "@/editor/lib/types";
import { FC } from "react";

const PlayStream: FC<{
  editorState: EditorState;
  captures: Record<string, string>;
}> = ({ editorState }) => {
  const msgs = getMessagesOfAuthor(editorState);
  if (msgs.tag === "success") {
    return (
      <>
        {msgs.value.map((msg, i) => {
          return (
            <div key={i}>
              <pre>{JSON.stringify(msg, null, 2)}</pre>
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      ERROR!!!!!!
      <pre>{JSON.stringify(msgs, null, 2)}</pre>
    </>
  );
};

const useCaptures = (_backend: Backend, _editorState: EditorState) => {
  const captures: Record<string, string> = {};

  return {
    captures,
  };
};

export const Play: FC<{
  backend: Backend;
  editorState: EditorState;
}> = ({ editorState, backend }) => {
  const { captures } = useCaptures(backend, editorState);
  return (
    <>
      <PlayStream editorState={editorState} captures={captures} />
    </>
  );
};
