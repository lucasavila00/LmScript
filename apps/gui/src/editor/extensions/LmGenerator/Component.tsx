import { StyledCreatableReactSelect, StyledReactSelect } from "../../../components/ui/react-select";
import { VariablesContext } from "../../../editor/context/variables";
import { Node } from "@tiptap/pm/model";
import { NodeViewWrapper } from "@tiptap/react";
import { FC, useContext } from "react";
import { PopoverNameEditor } from "../../../editor/components/PopoverNameEditor";
import { PopoverMaxTokens } from "../../../editor/components/PopoverMaxTokens";
import {
  StoredChoice,
  GenerationNodeAttrs,
  GenerationNodeTypeLabels,
  ALL_GENERATION_NODE_TYPES,
} from "@lmscript/editor-tools/types";
import { assertIsNever, cn } from "../../../lib/utils";

type ChoicesOption = {
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
      value={choices.flatMap((choice): ChoicesOption[] => {
        switch (choice.tag) {
          case "variable": {
            const theVariable = availableVariables.find((v) => v.uuid === choice.value);
            if (theVariable == null) {
              return [];
            }
            return [
              {
                label: `{${theVariable.name}}`,
                value: choice.value,
                tag: "variable" as const,
              },
            ];
          }
          case "typed":
            return [
              {
                label: choice.value,
                value: choice.value,
                tag: "typed" as const,
              },
            ];
          default:
            throw new Error("Invalid tag");
        }
      })}
      onCreateOption={(newOption) => {
        onChange([...choices, { tag: "typed", value: newOption }]);
      }}
      onChange={(vs) => {
        const validVs = vs.filter((v) => {
          switch (v.tag) {
            case "typed": {
              return true;
            }
            case "variable": {
              const found = availableVariables.find((av) => av.uuid === v.value);
              return found != null;
            }
            default: {
              return assertIsNever(v.tag);
            }
          }
        });
        onChange(validVs);
      }}
      placeholder="Type to create..."
      noOptionsMessage={() => "Type to create..."}
      isClearable={false}
      options={availableVariables.map(
        (v): ChoicesOption => ({
          label: `{${v.name}}`,
          value: v.uuid,
          tag: "variable",
        }),
      )}
    />
  );
};
type ReactSelectOption = {
  label: string;
  value: string;
};
const STOP_AT_OPTIONS: ReactSelectOption[] = [
  {
    value: '"',
    label: 'Double quote (")',
  },
  {
    value: "'",
    label: "Single quote (')",
  },
  {
    value: "\n",
    label: "New line (\\n)",
  },
  {
    value: "\t",
    label: "Tab (\\t)",
  },
  {
    value: " ",
    label: "Space ( )",
  },
];

const escapeStop = (stop: string): string => {
  return stop.replace(/\n/g, "\\n");
};
const unescapeStop = (stop: string): string => {
  return stop.replace(/\\n/g, "\n");
};

const StopEditor: FC<{
  stop: string[];
  onChange: (choices: readonly string[]) => void;
  leftMargin: boolean;
  placeholder: string;
}> = ({ leftMargin, placeholder, stop, onChange }) => {
  return (
    <StyledCreatableReactSelect
      classNames={{
        container: () => "inline-block",
        control: () => cn("rounded-none", !leftMargin && "border-0 border-y border-r"),
      }}
      isMulti={true}
      value={stop.map((it) => ({
        label: STOP_AT_OPTIONS.find((option) => option.value === it)?.label ?? escapeStop(it),
        value: it,
      }))}
      options={STOP_AT_OPTIONS}
      placeholder={placeholder}
      noOptionsMessage={() => "Type to create..."}
      isClearable={false}
      onChange={(newOptions) => {
        const unescaped = newOptions.map((it) => unescapeStop(it.value));
        onChange(unescaped);
      }}
    />
  );
};

const REGEX_OPTIONS: ReactSelectOption[] = [
  {
    label: "Bullet List",
    value: "(- [^\n]*\n)+(- [^\n]*)(\n\n)?",
  },
  {
    label: "Numbered List",
    value: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)(\n\n)?",
  },
  {
    label: "Integer",
    value: "[0-9]+",
  },
  {
    label: "Decimal",
    value: "[0-9]+\\.[0-9]+",
  },
  {
    label: "Date",
    value: "\\d{4}-\\d{2}-\\d{2}",
  },
];
const RegexEditor: FC<{
  regex: string | undefined;
  onChange: (regex: string | undefined) => void;
}> = ({ regex, onChange }) => {
  return (
    <StyledCreatableReactSelect
      classNames={{
        container: () => "inline-block",
        control: () => "rounded-none",
      }}
      value={
        regex == null
          ? undefined
          : {
              value: regex,
              label: REGEX_OPTIONS.find((option) => option.value === regex)?.label ?? regex,
            }
      }
      options={REGEX_OPTIONS}
      placeholder="Type to create..."
      isClearable={true}
      noOptionsMessage={() => "Type to create..."}
      onChange={(it) => {
        onChange(it?.value);
      }}
    />
  );
};
const InnerGenerator: FC<{
  attrs: GenerationNodeAttrs;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = ({ attrs, updateAttributes }) => {
  switch (attrs.type) {
    case "generation":
      return (
        <StopEditor
          leftMargin={true}
          stop={attrs.stop}
          onChange={(stop) => updateAttributes({ ...attrs, stop })}
          placeholder="Select stop sequence..."
        />
      );
    case "selection":
      return (
        <ChoicesEditor
          choices={attrs.choices}
          onChange={(choices) =>
            updateAttributes({
              ...attrs,
              choices,
            })
          }
        />
      );
    case "regex":
      return (
        <>
          <RegexEditor
            regex={attrs.regex}
            onChange={(regex) => updateAttributes({ ...attrs, regex })}
          />
          <StopEditor
            leftMargin={false}
            stop={attrs.stop}
            placeholder="Stop?"
            onChange={(stop) => updateAttributes({ ...attrs, stop })}
          />
        </>
      );
    default: {
      throw new Error("Invalid type" + attrs.type);
    }
  }
};

export const Component: FC<{
  node: Node;
  updateAttributes: (attrs: { readonly [attr: string]: unknown }) => void;
}> = (props) => {
  const attrs = props.node.attrs as GenerationNodeAttrs;
  return (
    <NodeViewWrapper as="span" className="inline-flex items-center">
      <StyledReactSelect
        value={{
          label: GenerationNodeTypeLabels[attrs.type],
          value: attrs.type,
        }}
        options={ALL_GENERATION_NODE_TYPES.map((ty) => ({
          label: GenerationNodeTypeLabels[ty],
          value: ty,
        }))}
        classNames={{
          container: () => "inline-block shrink-0",
          control: () => "rounded-none rounded-l border-0 border-y border-l",
        }}
        isClearable={false}
        onChange={(newType) => {
          if (newType != null) {
            props.updateAttributes({
              ...attrs,
              type: newType.value,
            });
          }
        }}
      />
      <InnerGenerator attrs={attrs} updateAttributes={props.updateAttributes} />
      {attrs.type != "selection" && (
        <PopoverMaxTokens
          max={attrs.max_tokens}
          onChangeMax={(max_tokens) =>
            props.updateAttributes({
              ...attrs,
              max_tokens,
            })
          }
        />
      )}
      <PopoverNameEditor
        name={attrs.name}
        onChangeName={(name) =>
          props.updateAttributes({
            ...attrs,
            name,
          })
        }
      />
    </NodeViewWrapper>
  );
};
