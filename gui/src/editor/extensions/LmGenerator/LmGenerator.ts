import { mergeAttributes, Node } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

export const LmGeneratorPluginKey = new PluginKey("lmGenerator");

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

  addOptions() {
    return {};
  },

  group: "inline",

  inline: true,

  selectable: true,

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
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        {
          "data-type": this.name,
          class: "px-2 py-1 rounded-md bg-zinc-200 dark:bg-zinc-800",
        },
        HTMLAttributes,
      ),
      `${node.attrs.name}`,
    ];
  },

  renderText({ node }) {
    return `${node.attrs.name}`;
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isLmGenerator = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isLmGenerator = true;
              tr.insertText("", pos, pos + node.nodeSize);

              return false;
            }
          });

          return isLmGenerator;
        }),
    };
  },

  addProseMirrorPlugins() {
    return [];
  },
});
