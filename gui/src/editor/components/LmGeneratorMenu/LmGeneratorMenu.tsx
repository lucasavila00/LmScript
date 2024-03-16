/* eslint-disable @typescript-eslint/no-explicit-any */
import { BubbleMenu as BaseBubbleMenu } from "@tiptap/react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { MenuProps } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GeneratorAttributes } from "@/editor/extensions/LmGenerator/LmGenerator";
import { StyledReactSelect } from "@/components/ui/react-select";
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

type SelectOption = {
  label: string;
  value: string;
};

const STOP_AT_OPTIONS: SelectOption[] = [
  {
    value: '"',
    label: 'Double quote (")',
  },
  {
    value: "'",
    label: "Single quote (')",
  },
  {
    value: "\n",
    label: "New line (\\n)",
  },
  {
    value: "\t",
    label: "Tab (\\t)",
  },
  {
    value: " ",
    label: "Space ( )",
  },
];

const LmGeneratorMenuContent: FC<{
  activeNode: NonNullable<ReturnType<typeof getActiveNode>>;
  onClose: (attributes: GeneratorAttributes, from: number, to: number) => void;
}> = ({ activeNode, onClose }) => {
  const [attributes, setAttributes] = useState<GeneratorAttributes>(
    activeNode.data as any,
  );

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
        activeNodeRef.current.to,
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
      <form
        className="flex flex-col gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          onCloseRef.current(
            attributesRef.current,
            activeNodeRef.current.from,
            activeNodeRef.current.to,
          );
        }}
      >
        <input type="submit" hidden />
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
          <Label htmlFor="stop">Stop</Label>
          <StyledReactSelect
            name={"stop"}
            isMulti={true}
            isSearchable={true}
            hideSelectedOptions={true}
            value={attributes.stop.map((stop) => ({
              label:
                STOP_AT_OPTIONS.find((s) => s.value === stop)?.label ?? stop,
              value: stop,
            }))}
            onChange={(selected) => {
              setAttributes({
                ...attributes,
                stop: selected.map((s) => s.value),
              });
            }}
            placeholder={"Select..."}
            classNames={{
              container: () => "col-span-2 !min-h-8",
              control: () => "!min-h-8",
            }}
            options={STOP_AT_OPTIONS}
          />
          {/* <Input
            id="maxWidth"
            defaultValue="300px"
            className="col-span-2 h-8"
          /> */}
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
      </form>
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

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey="lmGeneratorMenu"
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        // placement: "bottom",
        // popperOptions: {
        //   strategy: "fixed",
        //   modifiers: [],
        // },
        appendTo: () => {
          return appendTo?.current;
        },
        // onHidden: () => {},
      }}
      className="z-50 w-96 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none"
    >
      {activeNode == null ? (
        <></>
      ) : (
        <LmGeneratorMenuContent
          onClose={(attrs, from, to) => {
            if (JSON.stringify(attrs) !== JSON.stringify(activeNode.data)) {
              editor
                .chain()
                .insertContentAt(
                  {
                    from,
                    to,
                  },
                  {
                    type: "lmGenerator",
                    attrs,
                  },
                )
                .focus()
                .run();
            }
          }}
          activeNode={activeNode}
        />
      )}
    </BaseBubbleMenu>
  );
};

export default LmGeneratorMenu;
