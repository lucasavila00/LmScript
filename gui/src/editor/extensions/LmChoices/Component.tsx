import { Button } from "@/components/ui/button";
import {
  ControlLabelContext,
  StyledCreatableReactSelect,
} from "@/components/ui/react-select";
import { VariablesContext } from "@/editor/context/variables";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { EditorContext } from "@/editor/context/editor";

type Option = {
  label: string;
  value: string;
  tag: "variable" | "typed";
};

type StoredChoice =
  | {
      tag: "variable";
      value: string;
    }
  | {
      tag: "typed";
      value: string;
    };

const ComponentTyped: FC<{
  choices: StoredChoice[];
  onChange: (choices: readonly StoredChoice[]) => void;
}> = ({ choices, onChange }) => {
  const availableVariables = useContext(VariablesContext);

  return (
    <StyledCreatableReactSelect
      classNames={{
        container: () => "inline-block !min-h-8",
        control: () => "!min-h-8 rounded-none rounded-l-md",
      }}
      isMulti={true}
      value={choices.map((it): Option => {
        switch (it.tag) {
          case "variable":
            return {
              label: `{${it.value}}`,
              value: it.value,
              tag: "variable" as const,
            };
          case "typed":
            return { label: it.value, value: it.value, tag: "typed" as const };
          default:
            throw new Error("Invalid tag");
        }
      })}
      onCreateOption={(newOption) => {
        onChange([...choices, { tag: "typed", value: newOption }]);
      }}
      onChange={onChange}
      placeholder="Type to create..."
      noOptionsMessage={() => "Type to create..."}
      isClearable={false}
      options={availableVariables.map(
        (v): Option => ({
          label: `{${v.name}}`,
          value: v.name,
          tag: "variable",
        }),
      )}
    />
  );
};

const PopoverNameEditor: FC<{
  name: string;
  onChangeName: (name: string) => void;
}> = ({ name, onChangeName }) => {
  const [editableName, setEditableName] = useState(name);
  const [isEditing, setIsEditing_] = useState(false);
  const editor = useContext(EditorContext);
  const setIsEditing = (isOpen: boolean) => {
    setIsEditing_(isOpen);
    if (!isOpen) {
      onChangeName(editableName);
      setTimeout(() => {
        editor?.commands.focus();
      }, 1);
    }
  };
  return (
    <Popover open={isEditing} onOpenChange={setIsEditing}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="rounded-none rounded-r-md items-center border-0 border-r border-y"
          variant="outline"
        >
          As: {name}
          <Pencil1Icon className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            setIsEditing(false);
          }}
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Name</h4>
              <p className="text-sm text-muted-foreground">Set the name</p>
            </div>
            <input type="submit" hidden />
            <Input
              value={editableName}
              onChange={(e) => {
                setEditableName(e.target.value);
              }}
              className="h-8"
            />
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper as="span" className="inline-flex items-center">
      <ControlLabelContext.Provider value={<>One of:{"\u00A0"}</>}>
        <ComponentTyped
          choices={props.node.attrs.choices}
          onChange={(choices) =>
            props.updateAttributes({
              ...props.node.attrs,
              choices,
            })
          }
        />
      </ControlLabelContext.Provider>
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
