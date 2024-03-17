import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext } from "react";
import { VariablesContext } from "../../../editor/context/variables";
import { StyledReactSelect } from "../../../components/ui/react-select";
import { EditorContext } from "../../../editor/context/editor";

const ComponentTyped: FC<{
  selectedName: string;
  onChange: (name: string) => void;
}> = ({ selectedName, onChange }) => {
  const availableVariables = useContext(VariablesContext);
  const editor = useContext(EditorContext);

  return (
    <StyledReactSelect
      classNames={{
        container: () => "inline-block !min-h-8",
        control: () => "!min-h-8",
      }}
      value={
        selectedName === ""
          ? undefined
          : {
              label: `{${selectedName}}`,
              value: selectedName,
            }
      }
      onChange={(v) => {
        if (v != null) {
          onChange(v.value);
        }
      }}
      placeholder="Select a variable..."
      isClearable={false}
      options={availableVariables.map((v) => ({
        label: `{${v.name}}`,
        value: v.name,
      }))}
      onMenuClose={() => {
        setTimeout(() => {
          editor?.commands.focus(undefined, { scrollIntoView: false });
        }, 1);
      }}
    />
  );
};
export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  const selectedName = props.node.attrs.name;
  return (
    <NodeViewWrapper as="span">
      {/* <ControlLabelContext.Provider value={"Print:\u00A0"}> */}
      <ComponentTyped
        selectedName={selectedName}
        onChange={(name) => {
          props.updateAttributes({
            ...props.node.attrs,
            name,
          });
        }}
      />
      {/* </ControlLabelContext.Provider> */}
    </NodeViewWrapper>
  );
};
