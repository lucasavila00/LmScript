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

export type StoredChoice =
  | {
      tag: "variable";
      value: string;
    }
  | {
      tag: "typed";
      value: string;
    };

export type ChoicesNodeAttrs = {
  choices: StoredChoice[];
  type: "generation" | "selection" | "regex";
  name: string;
  max_tokens: number;
};

export const LmChoices = Node.create({
  name: "lmChoices",

  group: "inline",
  // content: "inline*",
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
      type: {
        default: "generation",
        parseHTML: (element) => {
          return element.getAttribute("data-type");
        },
        renderHTML: (attributes) => {
          return {
            "data-type": attributes.type,
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
