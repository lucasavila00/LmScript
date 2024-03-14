import {
  BlockNoteSchema,
  PartialBlock,
  defaultInlineContentSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import {
  BlockNoteView,
  DefaultReactSuggestionItem,
  DragHandleMenu,
  RemoveBlockItem,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import "@blocknote/react/style.css";
import { Generate } from "./Generate";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { FC } from "react";

const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    generate: Generate,
  },
});

const getCustomSlashMenuItems = (
  editor: typeof schema.BlockNoteEditor
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor).filter((it) => {
    const deny = ["Image", "Table"];
    return !deny.includes(it.title);
  }),
  {
    title: "Generate",
    aliases: ["gen"],
    group: "AI",
    icon: <HiOutlineGlobeAlt size={18} />,
    subtext: "The AI generates some text",
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

type BSchema = (typeof schema)["blockSchema"];
type ISchema = (typeof schema)["inlineContentSchema"];
type SSchema = (typeof schema)["styleSchema"];
export const Editor: FC<{
  initialContent: PartialBlock<BSchema, ISchema, SSchema>[];
}> = ({ initialContent }) => {
  const editor = useCreateBlockNote({
    schema,
    initialContent,
  });

  return (
    <>
      <BlockNoteView editor={editor} sideMenu={false} slashMenu={false}>
        <SideMenuController
          sideMenu={(props) => (
            <SideMenu
              {...props}
              dragHandleMenu={(props) => (
                <DragHandleMenu {...props}>
                  <RemoveBlockItem {...props}>Delete</RemoveBlockItem>
                </DragHandleMenu>
              )}
            />
          )}
        />
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
    </>
  );
};

export default Editor;
