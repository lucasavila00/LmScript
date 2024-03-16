import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SelectTrigger,
  Select,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
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
export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper className="author-select select-none flex gap-2 items-center">
      <Avatar>
        <AvatarFallback>{avatarLabel(props.node.attrs.author)}</AvatarFallback>
      </Avatar>
      <Select
        value={props.node.attrs.author}
        onValueChange={(v) => {
          props.updateAttributes({
            author: v,
          });
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Message Author" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="assistant">Assistant</SelectItem>
        </SelectContent>
      </Select>
    </NodeViewWrapper>
  );
};
