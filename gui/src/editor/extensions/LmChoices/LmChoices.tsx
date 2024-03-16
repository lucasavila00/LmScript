import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Component } from "./Component";
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lmChoices: {
      createNewLmChoices: () => ReturnType;
    };
  }
}

export const LmChoices = Node.create({
  name: "lmChoices",

  group: "inline",

  atom: true,
  selectable: false,
  inline: true,

  addAttributes() {
    return {
      choices: {
        default: [],
        parseHTML: (element) => {
          return JSON.parse(element.getAttribute("data-choices") ?? "[]");
        },

        renderHTML: (attributes) => {
          return {
            "data-choices": JSON.stringify(attributes.choices),
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
            attrs: {},
          });
        },
    };
  },
  parseHTML() {
    return [
      {
        tag: "lm-choices",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["lm-choices", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
