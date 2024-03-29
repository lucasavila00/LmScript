import { useTextmenuStates } from "./hooks/useTextmenuStates";
import { BubbleMenu, Editor } from "@tiptap/react";
import { memo } from "react";
import { useTextmenuContentTypes } from "./hooks/useTextmenuContentTypes";
import { ContentTypePicker } from "./components/ContentTypePicker";

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoContentTypePicker = memo(ContentTypePicker);

export type TextMenuProps = {
  editor: Editor;
};

export const TextMenu = ({ editor }: TextMenuProps) => {
  const states = useTextmenuStates(editor);
  const blockOptions = useTextmenuContentTypes(editor);

  return (
    <BubbleMenu
      tippyOptions={{ popperOptions: { placement: "top-start" } }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100}
    >
      <MemoContentTypePicker options={blockOptions} />
    </BubbleMenu>
  );
};
