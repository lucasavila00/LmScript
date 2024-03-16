import { useEditor } from "@tiptap/react";
import { Document as TiptapDocument } from "@tiptap/extension-document";
import { Heading } from "../extensions/Heading";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { FocusClasses as Focus } from "@tiptap/extension-focus";
import { HorizontalRule } from "../extensions/HorizontalRule";
import { SlashCommand } from "../extensions/SlashCommand";
import StarterKit from "@tiptap/starter-kit";
import { Selection } from "../extensions/Selection";
import { LmGenerator } from "../extensions/LmGenerator/LmGenerator";
import { AuthorSelect } from "../extensions/AuthorSelect/AuthorSelect";
import { TrailingNode } from "../extensions/TrailingNode";

export const initialContent = {
  type: "doc",
  content: [
    {
      type: "authorSelect",
      attrs: {
        author: "system",
      },
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "test",
        },
        {
          type: "lmGenerator",
          attrs: {
            id: "123",
          },
        },
      ],
    },
  ],
};
const Doc = TiptapDocument.extend({
  content: "authorSelect block*",
});

export const useBlockEditor = () => {
  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent,
      extensions: [
        StarterKit.configure({
          document: false,
          dropcursor: false,
          heading: false,
          horizontalRule: false,
          blockquote: false,
          codeBlock: false,
          bold: false,
          code: false,
          gapcursor: false,
          strike: false,
          italic: false,
          // hard break??
          hardBreak: undefined,

          // these use default
          history: undefined,
          listItem: undefined,
          orderedList: undefined,
          paragraph: undefined,
          text: undefined,
          bulletList: undefined,
        }),
        // TiptapDocument,
        Doc,
        Heading,
        Dropcursor.configure({
          width: 2,
          class: "ProseMirror-dropcursor border-black",
        }),
        Placeholder.configure({
          includeChildren: true,
          showOnlyCurrent: false,
          placeholder: () => "",
        }),
        Focus,
        HorizontalRule,
        SlashCommand,
        Selection,
        LmGenerator,
        AuthorSelect,
        TrailingNode,
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

  return { editor };
};
