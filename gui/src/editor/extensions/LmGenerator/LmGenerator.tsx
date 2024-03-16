import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Component } from "./Component";
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
        tag: "lm-generator",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["lm-generator", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
