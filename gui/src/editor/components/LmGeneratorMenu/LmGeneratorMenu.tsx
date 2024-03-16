/* eslint-disable @typescript-eslint/no-explicit-any */
import { BubbleMenu as BaseBubbleMenu } from "@tiptap/react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { MenuProps } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratorAttributes } from "@/editor/extensions/LmGenerator/LmGenerator";
const getActiveNode = (editor: MenuProps["editor"]) => {
  const { state } = editor;
  const activeNodePosition = state.selection.$from.pos;

  const activeNode = state.doc.nodeAt(activeNodePosition);

  if (activeNode == null) {
    return undefined;
  }

  if (activeNode.type.name !== "lmGenerator") {
    return undefined;
  }
  const data = editor.getAttributes("lmGenerator");

  if (Object.keys(data).length === 0) {
    return undefined;
  }
  const from = activeNodePosition;
  const to = activeNodePosition + activeNode.nodeSize;
  return {
    activeNode,
    data,
    from,
    to,
  };
};
const LmGeneratorMenuContent: FC<{
  // initialAttributes: GeneratorAttributes;
  activeNode: NonNullable<ReturnType<typeof getActiveNode>>;
  onClose: (attributes: GeneratorAttributes, from: number, to: number) => void;
}> = ({ activeNode, onClose }) => {
  const [attributes, setAttributes] = useState<GeneratorAttributes>(
    activeNode.data as any
  );

  // const attributes = initialAttributes;
  // const setAttributes = (newAttributes: GeneratorAttributes) => {
  //   onClose(newAttributes);
  // };

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const attributesRef = useRef(attributes);
  attributesRef.current = attributes;

  const activeNodeRef = useRef(activeNode);
  activeNodeRef.current = activeNode;

  useEffect(() => {
    return () => {
      onCloseRef.current(
        attributesRef.current,
        activeNodeRef.current.from,
        activeNodeRef.current.to
      );
    };
  }, []);

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Generate</h4>
        <p className="text-sm text-muted-foreground">
          Configure the generator settings
        </p>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={attributes.name}
            onChange={(e) => {
              setAttributes({
                ...attributes,
                name: e.target.value,
              });
            }}
            className="col-span-2 h-8"
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="maxWidth">Stop</Label>
          <Input
            id="maxWidth"
            defaultValue="300px"
            className="col-span-2 h-8"
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="max_tokens">Max. Tokens</Label>
          <Input
            id="max_tokens"
            value={attributes.max_tokens}
            onChange={(e) => {
              setAttributes({
                ...attributes,
                max_tokens: parseInt(e.target.value),
              });
            }}
            className="col-span-2 h-8"
          />
        </div>
        {/* <div className="grid grid-cols-3 items-center gap-4">
    <Label htmlFor="maxHeight">Max. height</Label>
    <Input
      id="maxHeight"
      defaultValue="none"
      className="col-span-2 h-8"
    />
  </div> */}
      </div>
    </div>
  );
};

export const LmGeneratorMenu = ({
  editor,
  appendTo,
}: MenuProps): JSX.Element => {
  const shouldShow = useCallback(() => {
    const isActive = editor.isActive("lmGenerator");

    return isActive;
  }, [editor]);

  const activeNode = getActiveNode(editor);

  // return chain()
  //   .insertContentAt(
  //     {
  //       from: activeNodePosition,
  //       to: activeNodePosition + activeNode.nodeSize,
  //     },
  //     {
  //       type: "lmGenerator",
  //       attrs: {
  //         id: value,
  //       },
  //     },
  //   )
  //   .setNodeSelection(activeNodePosition)
  //   .run();
  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="lmGeneratorMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        placement: "bottom",
        popperOptions: {
          strategy: "fixed",
          modifiers: [
            // {
            //   name: "flip",
            //   options: {
            //     fallbackPlacements: ["bottom", "right"],
            //   },
            // },
            // {
            //   name: "preventOverflow",
            //   options: {
            //     altAxis: true,
            //     tether: false,
            //   },
            // },
          ],
        },
        appendTo: () => {
          return appendTo?.current;
        },
        onHidden: () => {},
      }}
      className="z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
    >
      {activeNode == null ? (
        <></>
      ) : (
        <LmGeneratorMenuContent
          onClose={(attrs, from, to) => {
            if (JSON.stringify(attrs) !== JSON.stringify(activeNode.data)) {
              // console.log("differ, updating...");
              // editor.commands.updateAttributes("lmGenerator", attrs)
              editor.commands.insertContentAt(
                {
                  from,
                  to,
                },
                {
                  type: "lmGenerator",
                  attrs,
                }
              );
            }
          }}
          activeNode={activeNode}
        />
      )}
    </BaseBubbleMenu>
  );
};

export default LmGeneratorMenu;
