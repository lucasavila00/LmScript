import { Editor, useEditor } from "@tiptap/react";
import { Document as TiptapDocument } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Heading } from "../extensions";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Dropcursor } from "@tiptap/extension-dropcursor";
// import { TrailingNode } from "../extensions/TrailingNode";

export const initialContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{
        type: "text",
        text: "test",
      }],
    },
  ],
};

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useBlockEditor = () => {
  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent,
      extensions: [
        TiptapDocument,
        Text,
        Paragraph,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
        Dropcursor,
        // TrailingNode,
      ],
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          class: "min-h-full",
        },
      },
    },
    [],
  );

  const characterCount = editor?.storage.characterCount ||
    { characters: () => 0, words: () => 0 };

  window.editor = editor;

  return { editor, characterCount };
};
