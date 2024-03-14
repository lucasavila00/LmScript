import { EditorMetaProvider } from "./Context";
import Editor from "./Editor";

export const ConnectedEditor = () => {
  return (
    <>
      <EditorMetaProvider
        initialState={{
          "the uuid": {
            tag: "generate",
            name: "the name",
            stop: [],
            max_tokens: 16,
          },
        }}
      >
        <Editor
          initialContent={[
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
              content:
                "Press the '@' key to open the mentions menu and add another",
            },
            {
              type: "paragraph",
            },
          ]}
        />
      </EditorMetaProvider>
    </>
  );
};
