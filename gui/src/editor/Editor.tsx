import { filterSuggestionItems } from "@blocknote/core";
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
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { FC, useContext, useEffect, useRef } from "react";
import { TypedBlock, schema } from "./EditorSchema";
import {
  CreateEditorMetaContext,
  LastModalStateContext,
  MetaCreator,
  OpenedToggler,
  ToggleOpenedContext,
} from "./Context";
import { newGenerate } from "./Factory";

const getCustomSlashMenuItems = (
  editor: typeof schema.BlockNoteEditor,
  createMeta: MetaCreator,
  openToggler: OpenedToggler
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
      const uuid = window.crypto.randomUUID();
      createMeta(uuid, "generate", newGenerate());
      editor.insertInlineContent([
        {
          type: "generate",
          props: {
            uuid,
          },
        },
        " ", // add a space after the generation
      ]);
      openToggler(uuid, true);
    },
  },
];

export const Editor: FC<{
  initialContent: TypedBlock[];
  onChangeContent: (content: TypedBlock[]) => void;
}> = ({ initialContent, onChangeContent: onChangeContent_ }) => {
  const editor = useCreateBlockNote({
    schema,
    initialContent,
  });

  const createMeta = useContext(CreateEditorMetaContext);
  const openToggler = useContext(ToggleOpenedContext);

  const lastModalState = useContext(LastModalStateContext);
  const editorRef = useRef(editor);
  editorRef.current = editor;
  useEffect(() => {
    if (!lastModalState) {
      try {
        setTimeout(() => {
          editorRef.current.focus();
        }, 1);
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastModalState]);

  const onChangeContent = (content: TypedBlock[]) => {
    const definedIds = new Set<string>();

    content.forEach((block) => {
      if (
        block.type === "paragraph" ||
        block.type === "heading" ||
        block.type === "bulletListItem" ||
        block.type === "numberedListItem"
      ) {
        let shouldUpdate = false;
        const newBlock = {
          ...block,
          content: Array.isArray(block.content)
            ? block.content.map((it) => {
                if (typeof it === "string") {
                  return it;
                }
                if (it.type === "generate") {
                  const uuid = it.props?.uuid ?? "";
                  if (definedIds.has(uuid)) {
                    const newUuid = window.crypto.randomUUID();
                    createMeta(newUuid, "generate", newGenerate());
                    definedIds.add(newUuid);
                    shouldUpdate = true;
                    return {
                      ...it,
                      props: {
                        ...it.props,
                        uuid: newUuid,
                      },
                    };
                  } else {
                    definedIds.add(uuid);
                  }
                }
                return it;
              })
            : block.content,
        };

        if (shouldUpdate) {
          if (block.id != null) {
            editor.updateBlock(block.id, newBlock);
          }
        }
      }
    });
    onChangeContent_(content);
  };

  return (
    <>
      <BlockNoteView
        editor={editor}
        sideMenu={false}
        slashMenu={false}
        onChange={() => {
          onChangeContent(editor.document);
        }}
      >
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
            filterSuggestionItems(
              getCustomSlashMenuItems(editor, createMeta, openToggler),
              query
            )
          }
        />
      </BlockNoteView>
    </>
  );
};

export default Editor;
