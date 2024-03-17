import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { StyledReactSelect } from "../../../components/ui/react-select";
import { avatarLabel, avatarFullLabel } from "../../../editor/lib/avatar";
import { AUTHOR_OPTIONS } from "../../../editor/lib/types";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC } from "react";

export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper className="flex justify-center">
      <div className="select-none flex gap-2 items-center min-w-0 mx-auto">
        <Avatar>
          <AvatarFallback>
            {avatarLabel(props.node.attrs.author)}
          </AvatarFallback>
        </Avatar>
        <StyledReactSelect
          value={{
            value: props.node.attrs.author,
            label: avatarFullLabel(props.node.attrs.author),
          }}
          options={AUTHOR_OPTIONS.map((it) => ({
            label: avatarFullLabel(it),
            value: it,
          }))}
          onChange={(selected) => {
            if (selected != null) {
              props.updateAttributes({
                ...props.node.attrs,
                author: selected.value,
              });
            }
          }}
          classNames={{
            container: () => "!min-h-8",
            control: () => "!min-h-8",
          }}
        />
      </div>
    </NodeViewWrapper>
  );
};
