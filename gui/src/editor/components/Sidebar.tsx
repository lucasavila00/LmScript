import { cn } from "@/lib/utils";
import { memo } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VariablesSidebar } from "./VariablesSidebar";
import { useVariables } from "../hooks/useVariables";

export const Sidebar = memo<{
  editor: Editor;
  isOpen: boolean;
  variablesHook: ReturnType<typeof useVariables>;
}>(({ editor, isOpen, variablesHook }) => {
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
              <VariablesSidebar variablesHook={variablesHook} />
            </TabsContent>
            <TabsContent value="settings">
              <Button
                onClick={() => {
                  console.log(
                    JSON.stringify({
                      variables: variablesHook.variables,
                      doc: editor.getJSON(),
                    }),
                  );
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
