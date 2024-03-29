import { FC, Fragment } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Icon } from "../../components/ui/Icon";
import { Input } from "../../components/ui/input";
import { useVariables } from "../hooks/useVariables";

export const VariablesSidebar: FC<{
  variablesHook: ReturnType<typeof useVariables>;
}> = ({ variablesHook }) => {
  const {
    variables,
    changeVariableName,
    deleteVariable: onDeleteVariable,
    changeVariableValue,
    addVariable,
  } = variablesHook;
  return (
    <>
      <div className="flex flex-col gap-8 my-8">
        {variables.map((item, idx) => {
          return (
            <Fragment key={idx}>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <Input
                    placeholder="Type variable name..."
                    value={item.name}
                    className="h-8"
                    onChange={(ev) => changeVariableName(idx, ev.target.value)}
                  />
                  <button
                    // className="h-8 w-8 min-h-8 min-w-8 p-0"
                    onClick={() => onDeleteVariable(idx)}
                  >
                    <Icon name="Trash" className="w-4 h-4 text-neutral-500 hover:text-red-500" />
                  </button>
                </div>
                <Textarea
                  placeholder="Type the default value here..."
                  value={item.value}
                  rows={4}
                  onChange={(ev) => changeVariableValue(idx, ev.target.value)}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
      <Button className="w-full" onClick={addVariable} variant="outline">
        New Variable
      </Button>
    </>
  );
};
