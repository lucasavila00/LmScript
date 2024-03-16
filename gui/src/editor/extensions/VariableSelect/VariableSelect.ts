import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Component } from "./Component";
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variableSelect: {
      createNewVariableSelect: () => ReturnType;
    };
  }
}

export const VariableSelect = Node.create({
  name: "variableSelect",

  group: "inline",

  atom: true,
  selectable: false,
  inline: true,

  addAttributes() {
    return {
      name: {
        default: "",
        parseHTML: (element) => {
          return {
            name: element.getAttribute("data-name"),
          };
        },

        renderHTML: (attributes) => {
          return {
            "data-name": attributes.name,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      createNewVariableSelect:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              name: "",
            },
          });
        },
    };
  },
  parseHTML() {
    return [
      {
        tag: "variable-select",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["variable-select", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
