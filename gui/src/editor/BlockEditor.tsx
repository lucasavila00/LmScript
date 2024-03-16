import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { useRef } from "react";
import { LmGeneratorMenu } from "./components/LmGeneratorMenu";
import { Sidebar } from "./components/Sidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import "./styles/index.css";
import { EditorContext } from "./context/editor";

export const BlockEditor = () => {
  const { editor, leftSidebar, variablesHook } = useBlockEditor();
  const menuContainerRef = useRef(null);

  if (editor == null) {
    // throw new Error("Editor is null");
    return <></>;
  }

  return (
    <>
      <div className="flex h-full w-full" ref={menuContainerRef}>
        <VariablesContext.Provider value={variablesHook.variables}>
          <EditorContext.Provider value={editor}>
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
              <EditorHeader
                isSidebarOpen={leftSidebar.isOpen}
                toggleSidebar={leftSidebar.toggle}
              />
              <EditorContent
                editor={editor}
                className="flex-1 overflow-y-auto"
              />
              <ContentItemMenu editor={editor} />
              <LmGeneratorMenu editor={editor} appendTo={menuContainerRef} />
            </div>
          </EditorContext.Provider>
        </VariablesContext.Provider>
        <Sidebar
          isOpen={leftSidebar.isOpen}
          editor={editor}
          variablesHook={variablesHook}
        />
      </div>
    </>
  );
};
