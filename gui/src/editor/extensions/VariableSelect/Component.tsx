import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext, useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VariablesContext } from "@/editor/context/variables";

export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  const availableVariables = useContext(VariablesContext);
  const [open, setOpen] = useState(false);
  const selectedName = props.node.attrs.name;
  return (
    <NodeViewWrapper as="span">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={open}
            variant="outline"
            className="items-center inline-flex h-8 px-1"
          >
            {/* <ComponentPlaceholderIcon className="mr-0.5 h-4 w-4 shrink-0 opacity-50" /> */}
            {selectedName != "" ? `{${selectedName}}` : "Select a variable..."}
            <CaretSortIcon className="ml-0.5 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search variables..." className="h-9" />
            <CommandList>
              <CommandEmpty>No variable defined.</CommandEmpty>
              <CommandGroup>
                {availableVariables.map((framework, idx) => (
                  <CommandItem
                    key={idx}
                    value={framework.name}
                    onSelect={(newName) => {
                      console.log({ newName });
                      props.updateAttributes({
                        ...props.node.attrs,
                        name: newName,
                      });
                      setOpen(false);
                    }}
                  >
                    {framework.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedName === framework.name
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
};
