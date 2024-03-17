import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { useRef } from "react";
import { RightSidebar } from "./components/RightSidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import { EditorContext } from "./context/editor";
import { TextMenu } from "./components/TextMenu";
import { LeftSidebar } from "./components/LeftSidebar";
import { useRunner } from "./hooks/useRunner";
import { Play } from "./components/Play/Play";

export const BlockEditor = () => {
  const {
    editor,
    rightSidebar,
    variablesHook,
    leftSidebar,
    samplingParamsHook,
  } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const runnerHook = useRunner();

  if (editor == null) {
    // throw new Error("Editor is null");
    return <></>;
  }

  return (
    <>
      <div className="flex h-full w-full" ref={menuContainerRef}>
        <LeftSidebar
          runnerHook={runnerHook}
          editor={editor}
          isOpen={leftSidebar.isOpen}
        />
        {leftSidebar.isOpen ? (
          <>
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
              <EditorHeader
                isRightSidebarOpen={rightSidebar.isOpen}
                toggleRightSidebar={rightSidebar.toggle}
                isLeftSidebarOpen={leftSidebar.isOpen}
                toggleLeftSidebar={leftSidebar.toggle}
              />
              <div className="flex-1 overflow-y-auto">
                {runnerHook.backend == null ? (
                  <>TODO: select a backend msg</>
                ) : (
                  <>
                    <Play
                      backend={runnerHook.backend}
                      editorState={{
                        doc: editor.getJSON(),
                        variables: variablesHook.variables,
                        samplingParams: samplingParamsHook.samplingParams,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <VariablesContext.Provider value={variablesHook.variables}>
              <EditorContext.Provider value={editor}>
                <div className="relative flex flex-col flex-1 h-full overflow-hidden">
                  <EditorHeader
                    isRightSidebarOpen={rightSidebar.isOpen}
                    toggleRightSidebar={rightSidebar.toggle}
                    isLeftSidebarOpen={leftSidebar.isOpen}
                    toggleLeftSidebar={leftSidebar.toggle}
                  />
                  <EditorContent
                    editor={editor}
                    className="flex-1 overflow-y-auto"
                  />
                  <ContentItemMenu editor={editor} />
                  <TextMenu editor={editor} />
                </div>
              </EditorContext.Provider>
            </VariablesContext.Provider>
          </>
        )}
        <RightSidebar
          isOpen={rightSidebar.isOpen}
          editor={editor}
          variablesHook={variablesHook}
          samplingParamsHook={samplingParamsHook}
        />
      </div>
    </>
  );
};
