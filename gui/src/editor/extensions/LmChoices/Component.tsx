import { StyledCreatableReactSelect } from "@/components/ui/react-select";
import { VariablesContext } from "@/editor/context/variables";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext } from "react";

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
        control: () => "min-w-48 !min-h-8",
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
export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  return (
    <NodeViewWrapper as="span">
      <ComponentTyped
        choices={props.node.attrs.choices}
        onChange={(choices) => {
          props.updateAttributes({
            ...props.node.attrs,
            choices,
          });
        }}
      />
    </NodeViewWrapper>
  );
};
