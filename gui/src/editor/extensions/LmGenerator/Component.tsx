import { PopoverNameEditor } from "@/editor/components/PopoverNameEditor";
import { NodeViewWrapper } from "@tiptap/react";
import { FC } from "react";
import { Node } from "@tiptap/pm/model";

export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper as="span" className="inline-flex items-center">
      <PopoverNameEditor
        name={props.node.attrs.name}
        onChangeName={(name) =>
          props.updateAttributes({
            ...props.node.attrs,
            name,
          })
        }
      />
    </NodeViewWrapper>
  );
};
