import {
  StyledCreatableReactSelect,
  StyledReactSelect,
} from "@/components/ui/react-select";
import { VariablesContext } from "@/editor/context/variables";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext } from "react";
import { PopoverNameEditor } from "@/editor/components/PopoverNameEditor";
import { ChoicesNodeAttrs, StoredChoice } from "./LmChoices";

type Option = {
  label: string;
  value: string;
  tag: "variable" | "typed";
};

const ChoicesEditor: FC<{
  choices: StoredChoice[];
  onChange: (choices: readonly StoredChoice[]) => void;
}> = ({ choices, onChange }) => {
  const availableVariables = useContext(VariablesContext);

  return (
    <StyledCreatableReactSelect
      classNames={{
        container: () => "inline-block",
        control: () => "rounded-none",
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
const InnerGenerator: FC<{
  attrs: ChoicesNodeAttrs;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = ({ attrs, updateAttributes }) => {
  switch (attrs.type) {
    case "generation":
      return <></>;
    case "selection":
      return (
        <>
          <ChoicesEditor
            choices={attrs.choices}
            onChange={(choices) =>
              updateAttributes({
                ...attrs,
                choices,
              })
            }
          />
        </>
      );
    case "regex":
      return <></>;
    default: {
      throw new Error("Invalid type");
    }
  }
};

export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper as="span" className="inline-flex items-center">
      <StyledReactSelect
        value={{
          label: "One of",
          value: "one_of",
        }}
        classNames={{
          container: () => "inline-block shrink-0",
          control: () => "rounded-none rounded-l border-0 border-y border-l",
        }}
      />
      <InnerGenerator
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attrs={props.node.attrs as any}
        updateAttributes={props.updateAttributes}
      />
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
