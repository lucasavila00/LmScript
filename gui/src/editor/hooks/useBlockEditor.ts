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
import { useSidebar } from "./useSidebar";

export const initialContent = {
  type: "doc",
  content: [
    { type: "authorSelect", attrs: { author: "user" } },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "What is the best subject for the illustration to accompany the following?",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Content" }],
    },
    { type: "paragraph", content: [{ type: "text", text: '"{content}"' }] },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Instructions" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: 'First explain why you\'re choosing the best subject for the illustration, then choose the best subject for the illustration, either a person or an object. Answer with just "{PERSON_ILLUSTRATOR}" or "{OBJECT_ILLUSTRATOR}".',
        },
      ],
    },
    { type: "paragraph", content: [{ type: "text", text: "For example:" }] },
    {
      type: "heading",
      attrs: { level: 4 },
      content: [{ type: "text", text: "Example 1" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Explanation: I'm choosing a person because the scene is about a person.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Illustrate: {PERSON_ILLUSTRATOR}" }],
    },
    {
      type: "heading",
      attrs: { level: 4 },
      content: [{ type: "text", text: "Example 2" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Explanation: I'm choosing an object because the scene is about an object.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Illustrate: {OBJECT_ILLUSTRATOR}" }],
    },
    { type: "authorSelect", attrs: { author: "assistant" } },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Explanation: " },
        {
          type: "lmGenerator",
          attrs: { name: "_explanation", stop: ["\n"], max_tokens: 256 },
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Illustrate: {illustrator|select}" }],
    },
  ],
};
const Doc = TiptapDocument.extend({
  content: "authorSelect block*",
});

export const useBlockEditor = () => {
  const leftSidebar = useSidebar();

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
    []
  );

  return { editor, leftSidebar };
};
