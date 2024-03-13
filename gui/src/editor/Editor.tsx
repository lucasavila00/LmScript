import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  BlockNoteView,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import { Generate } from "./Generate";
import { EditorMetaProvider } from "./Context";

// Our schema with inline content specs, which contain the configs and
// implementations for inline content  that we want our editor to use.
const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    // Adds all default inline content.
    ...defaultInlineContentSpecs,
    // Adds the mention tag.
    generate: Generate,
  },
});

export function Editor() {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
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
    ],
  });

  return (
    <>
      <EditorMetaProvider>
        <BlockNoteView editor={editor}>
          {/* Adds a mentions menu which opens with the "@" key */}
          <SuggestionMenuController
            triggerCharacter={"@"}
            getItems={async (_query) => {
              return [
                {
                  title: "Generate",
                  onItemClick: () => {
                    editor.insertInlineContent([
                      {
                        type: "generate",
                        props: {
                          uuid: window.crypto.randomUUID(),
                        },
                      },
                      " ", // add a space after the generation
                    ]);
                  },
                },
              ];
            }}
          />
        </BlockNoteView>
      </EditorMetaProvider>
    </>
  );
}

export default Editor;
