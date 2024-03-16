import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Component } from "./Component";

export type GeneratorAttributes = {
  name: string;
  stop: string[];
  max_tokens: number;
};
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lmGenerator: {
      createNewLmGenerator: () => ReturnType;
    };
  }
}
export const LmGenerator = Node.create({
  name: "lmGenerator",

  group: "inline",

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      name: {
        default: "Unnamed",
        parseHTML: (element) => {
          return element.getAttribute("data-name");
        },
        renderHTML: (attributes) => {
          return {
            "data-name": attributes.name,
          };
        },
      },
      stop: {
        default: [],
        parseHTML: (element) => {
          return JSON.parse(element.getAttribute("data-stop") ?? "[]");
        },
        renderHTML: (attributes) => {
          return {
            "data-stop": JSON.stringify(attributes.stop),
          };
        },
      },
      max_tokens: {
        default: 16,
        parseHTML: (element) => {
          return parseInt(element.getAttribute("data-max_tokens") ?? "16");
        },
        renderHTML: (attributes) => {
          return {
            "data-max_tokens": attributes.max_tokens,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      createNewLmGenerator:
        () =>
        ({ chain, tr }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {},
            })
            .setNodeSelection(tr.selection.to - 1)
            .run();
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
