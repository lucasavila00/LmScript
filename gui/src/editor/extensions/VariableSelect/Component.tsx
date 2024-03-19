import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext } from "react";
import { VariablesContext } from "../../../editor/context/variables";
import { StyledReactSelect } from "../../../components/ui/react-select";
import { EditorContext } from "../../../editor/context/editor";

const ComponentTyped: FC<{
  selectedUuid: string;
  onChange: (uuid: string) => void;
}> = ({ selectedUuid, onChange }) => {
  const availableVariables = useContext(VariablesContext);
  const editor = useContext(EditorContext);

  const foundVariable = availableVariables.find((v) => v.uuid === selectedUuid);
  return (
    <StyledReactSelect
      classNames={{
        container: () => "inline-block !min-h-8",
        control: () => "!min-h-8",
      }}
      value={
        selectedUuid == null || foundVariable == null
          ? undefined
          : {
              label: `{${foundVariable.name}}`,
              value: selectedUuid,
            }
      }
      key={foundVariable?.uuid ?? ""}
      onChange={(v) => {
        if (v != null) {
          onChange(v.value);
        }
      }}
      placeholder="Select a variable..."
      isClearable={false}
      options={availableVariables.map((v) => ({
        label: `{${v.name}}`,
        value: v.uuid,
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
  const selectedUuid = props.node.attrs.uuid;
  return (
    <NodeViewWrapper as="span">
      {/* <ControlLabelContext.Provider value={"Print:\u00A0"}> */}
      <ComponentTyped
        selectedUuid={selectedUuid}
        onChange={(uuid) => {
          props.updateAttributes({
            ...props.node.attrs,
            uuid,
          });
        }}
      />
      {/* </ControlLabelContext.Provider> */}
    </NodeViewWrapper>
  );
};
