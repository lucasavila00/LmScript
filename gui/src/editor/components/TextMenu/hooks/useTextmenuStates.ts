import { Editor } from "@tiptap/react";
import { useCallback } from "react";
import { ShouldShowProps } from "../../types";
import isCustomNodeSelected from "@/editor/lib/isCustomNodeSelected";
import isTextSelected from "@/editor/lib/isTextSelected";

export const useTextmenuStates = (editor: Editor) => {
  const shouldShow = useCallback(
    ({ view, from }: ShouldShowProps) => {
      if (!view) {
        return false;
      }

      const domAtPos = view.domAtPos(from || 0).node as HTMLElement;
      const nodeDOM = view.nodeDOM(from || 0) as HTMLElement;
      const node = nodeDOM || domAtPos;

      if (isCustomNodeSelected(editor, node)) {
        return false;
      }

      return isTextSelected({ editor });
    },
    [editor],
  );

  return {
    shouldShow,
  };
};
