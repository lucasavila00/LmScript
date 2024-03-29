import { useState } from "react";
import { NamedVariable } from "@lmscript/editor-tools/types";
import { newUuid } from "../../lib/utils";

export const useVariables = (initialVariables: NamedVariable[]) => {
  const [variables, setVariables] = useState<NamedVariable[]>(initialVariables);
  const addVariable = () => {
    setVariables((prev) => {
      const defaultName = "my_var_name";
      const duplicated = prev
        .filter((v) => v.name.startsWith(defaultName))
        .map((it) => it.name.replace(defaultName + "_", ""))
        .map((it) => {
          const n = parseInt(it, 10);
          if (isNaN(n)) {
            return 0;
          }
          return n;
        });
      const suffix = duplicated.length > 0 ? `_${Math.max(...duplicated) + 1}` : "";

      const finalName = `${defaultName}${suffix}`;
      return [
        ...prev,
        {
          name: finalName,
          value: "",
          uuid: newUuid(),
        },
      ];
    });
  };
  const changeVariableValue = (idx: number, value: string) => {
    setVariables((prev) =>
      prev.map((v, i) => {
        if (i === idx) {
          return {
            ...v,
            value,
          };
        }
        return v;
      }),
    );
  };
  const changeVariableName = (idx: number, name: string) => {
    setVariables((prev) =>
      prev.map((v, i) => {
        if (i === idx) {
          return {
            ...v,
            name,
          };
        }
        return v;
      }),
    );
  };
  const deleteVariable = (idx: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    variables,
    addVariable,
    changeVariableValue,
    changeVariableName,
    deleteVariable,
  };
};
