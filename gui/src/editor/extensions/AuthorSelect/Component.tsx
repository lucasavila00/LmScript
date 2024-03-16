import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StyledReactSelect } from "@/components/ui/react-select";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC } from "react";

const avatarLabel = (author: string) => {
  switch (author) {
    case "system":
      return "Sys";
    case "user":
      return "Usr";
    case "assistant":
      return "Ast";
    default:
      return "Unk";
  }
};
const fullLabel = (author: string) => {
  switch (author) {
    case "system":
      return "System";
    case "user":
      return "User";
    case "assistant":
      return "Assistant";
    default:
      return "Unknown";
  }
};
const AUTHOR_OPTIONS = ["system", "user", "assistant"] as const;
export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper className="author-select select-none flex gap-2 items-center">
      <Avatar>
        <AvatarFallback>{avatarLabel(props.node.attrs.author)}</AvatarFallback>
      </Avatar>
      <StyledReactSelect
        value={{
          value: props.node.attrs.author,
          label: fullLabel(props.node.attrs.author),
        }}
        options={AUTHOR_OPTIONS.map((it) => ({
          label: fullLabel(it),
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
          control: () => "!min-h-8 w-32",
        }}
      />
    </NodeViewWrapper>
  );
};
