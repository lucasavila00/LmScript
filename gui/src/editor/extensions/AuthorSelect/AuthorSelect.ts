import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Component } from "./Component";
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    authorSelect: {
      createNewAuthorSelect: () => ReturnType;
    };
  }
}

export const AuthorSelect = Node.create({
  name: "authorSelect",

  group: "block",

  atom: true,
  selectable: false,

  addAttributes() {
    return {
      author: {
        default: "system",
        parseHTML: (element) => {
          return {
            author: element.getAttribute("data-author"),
          };
        },

        renderHTML: (attributes) => {
          return {
            "data-author": attributes.author,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      createNewAuthorSelect:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              author: "user",
            },
          });
        },
    };
  },
  parseHTML() {
    return [
      {
        tag: "author-select",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["author-select", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
