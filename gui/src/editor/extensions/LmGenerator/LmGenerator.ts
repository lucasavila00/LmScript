import { mergeAttributes, Node } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { newUuid } from "../../../lib/utils";
// export type LmGeneratorOptions = {};

export const LmGeneratorPluginKey = new PluginKey("lmGenerator");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lmGenerator: {
      createNewLmGenerator: () => ReturnType;
      updateLmGenerator: (value: string) => ReturnType;
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
      id: {
        default: null,
        parseHTML: (_element) => newUuid(),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            "data-id": attributes.id,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      createNewLmGenerator: () => ({ chain, tr }) => {
        return chain().insertContent({
          type: this.name,
          attrs: {
            id: newUuid(),
          },
        })
          .setNodeSelection(tr.selection.to - 1)
          .run();
      },
      updateLmGenerator: (value) => ({ chain, state }) => {
        const activeNodePosition = state.selection.$from.pos;

        const activeNode = state.doc.nodeAt(activeNodePosition);

        if (activeNode == null) {
          return false;
        }

        if (activeNode.type.name !== "lmGenerator") {
          return false;
        }
        return chain()
          .insertContentAt(
            {
              from: activeNodePosition,
              to: activeNodePosition + activeNode.nodeSize,
            },
            {
              type: "lmGenerator",
              attrs: {
                id: value,
              },
            },
          )
          .setNodeSelection(activeNodePosition)
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
        },
        HTMLAttributes,
      ),
      `@${node.attrs.id}`,
    ];
  },

  renderText({ node }) {
    return `@${node.attrs.id}`;
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
              tr.insertText(
                "@",
                pos,
                pos + node.nodeSize,
              );

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
