import { cn } from "@/lib/utils";
import { FC, Fragment, memo } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NamedVariable } from "../context/variables";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";

const VariablesSidebar: FC<{
  variables: NamedVariable[];
  setVariables: (cb: (prev: NamedVariable[]) => NamedVariable[]) => void;
}> = ({ variables, setVariables }) => {
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
      const suffix =
        duplicated.length > 0 ? `_${Math.max(...duplicated) + 1}` : "";

      const finalName = `${defaultName}${suffix}`;
      return [
        ...prev,
        {
          name: finalName,
          value: "",
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
  const onDeleteVariable = (idx: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== idx));
  };
  return (
    <>
      <div className="flex flex-col gap-4 my-4">
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
                    <Icon
                      name="Trash"
                      className="w-4 h-4 text-neutral-500 hover:text-red-500"
                    />
                  </button>
                </div>
                <Textarea
                  placeholder="Type the default value here..."
                  value={item.value}
                  onChange={(ev) => changeVariableValue(idx, ev.target.value)}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
      <Button className="w-full" onClick={addVariable}>
        New Variable
      </Button>
    </>
  );
};

export const Sidebar = memo<{
  editor: Editor;
  isOpen: boolean;
  variables: NamedVariable[];
  setVariables: (cb: (prev: NamedVariable[]) => NamedVariable[]) => void;
}>(({ editor, isOpen, variables, setVariables }) => {
  const windowClassName = cn(
    "absolute top-0 right-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all",
    "dark:bg-black lg:dark:bg-black/30",
    !isOpen && "border-l-transparent",
    isOpen && "w-80 border-l border-l-neutral-200 dark:border-l-neutral-800",
  );

  return (
    <div className={windowClassName}>
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-full p-6 overflow-auto">
          <Tabs defaultValue="variables">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="variables">
              <VariablesSidebar
                variables={variables}
                setVariables={setVariables}
              />
            </TabsContent>
            <TabsContent value="settings">
              <Button
                onClick={() => {
                  console.log(JSON.stringify(editor.getJSON()));
                }}
              >
                Save
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
});

Sidebar.displayName = "TableOfContentSidepanel";
