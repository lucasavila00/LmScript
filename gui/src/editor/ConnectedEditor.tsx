import { useState } from "react";
import { EditorMeta, EditorMetaProvider } from "./Context";
import Editor from "./Editor";
import { TypedBlock } from "./EditorSchema";

const initialContent: TypedBlock[] = [
  {
    type: "paragraph",
    content: "Welcome to this demo!",
  },
  {
    type: "paragraph",
    content: [
      {
        type: "generate",
        props: {
          uuid: "the uuid",
        },
      },
      {
        type: "text",
        text: " <- This is an example mention",
        styles: {},
      },
    ],
  },
  {
    type: "paragraph",
    content: "Press the '@' key to open the mentions menu and add another",
  },
  {
    type: "paragraph",
  },
];
const initialMeta: EditorMeta = {
  "the uuid": {
    tag: "generate",
    name: "the name",
    stop: [],
    max_tokens: 16,
  },
};

export const ConnectedEditor = () => {
  const [content, setContent] = useState<TypedBlock[]>(initialContent);
  const [meta, setMeta] = useState<EditorMeta>(initialMeta);

  return (
    <>
      <EditorMetaProvider meta={meta} setMeta={setMeta}>
        <Editor initialContent={content} onChangeContent={setContent} />
      </EditorMetaProvider>
    </>
  );
};
