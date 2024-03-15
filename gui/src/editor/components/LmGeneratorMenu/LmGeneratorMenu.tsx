import { BubbleMenu as BaseBubbleMenu } from "@tiptap/react";
import { useCallback } from "react";
import { MenuProps } from "../types";
import { newUuid } from "../../../lib/utils";

export const LmGeneratorMenu = ({
  editor,
  appendTo,
}: MenuProps): JSX.Element => {
  // const activeNode = useMemo(() => {
  //   const activeNodePosition = editor.state.selection.$from.pos;

  //   const activeNode = editor.state.doc.nodeAt(activeNodePosition);

  //   console.log(activeNode);

  //   if (activeNode == null) {
  //     return undefined;
  //   }

  //   if (activeNode.type.name !== "lmGenerator") {
  //     return undefined;
  //   }

  //   const isActive = editor.isActive("lmGenerator");

  //   if (!isActive) {
  //     return undefined;
  //   }

  //   return activeNode;
  // }, [editor]);

  // console.log({ activeNode });
  const shouldShow = useCallback(() => {
    const isActive = editor.isActive("lmGenerator");

    return isActive;
  }, [editor]);

  const data = editor.getAttributes("lmGenerator");
  console.log(data);

  const onSetNewId = useCallback(() => {
    editor.commands.updateLmGenerator(newUuid());
  }, [editor]);

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="lmGeneratorMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        popperOptions: {
          modifiers: [{ name: "flip", enabled: false }],
        },
        appendTo: () => {
          return appendTo?.current;
        },
        onHidden: () => {},
      }}
    >
      <button onClick={onSetNewId}>change id</button>
    </BaseBubbleMenu>
  );
};

export default LmGeneratorMenu;
