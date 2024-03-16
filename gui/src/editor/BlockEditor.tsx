import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { useRef } from "react";
import { LmGeneratorMenu } from "./components/LmGeneratorMenu";
import { Sidebar } from "./components/Sidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import "./styles/index.css";

export const BlockEditor = () => {
  const { editor, leftSidebar } = useBlockEditor();
  const menuContainerRef = useRef(null);

  if (editor == null) {
    // throw new Error("Editor is null");
    return <></>;
  }

  return (
    <>
      <VariablesContext.Provider value={["test"]}>
        <div className="flex h-full w-full" ref={menuContainerRef}>
          <div className="relative flex flex-col flex-1 h-full overflow-hidden">
            <EditorHeader
              isSidebarOpen={leftSidebar.isOpen}
              toggleSidebar={leftSidebar.toggle}
            />
            <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
            <ContentItemMenu editor={editor} />
            <LmGeneratorMenu editor={editor} appendTo={menuContainerRef} />
          </div>
          <Sidebar isOpen={leftSidebar.isOpen} editor={editor} />
        </div>
      </VariablesContext.Provider>
    </>
  );
};
