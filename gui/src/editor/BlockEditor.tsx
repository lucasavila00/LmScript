import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { useRef } from "react";
import { RightSidebar } from "./components/RightSidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import { EditorContext } from "./context/editor";
import { TextMenu } from "./components/TextMenu";
import { useBackendConfig } from "./hooks/useBackendConfig";
import { Play } from "./components/Play/Play";

export const BlockEditor = () => {
  const {
    isExecuting,
    toggleExecuting,
    editor,
    rightSidebar,
    variablesHook,
    samplingParamsHook,
  } = useBlockEditor();
  const menuContainerRef = useRef(null);
  const backendConfigHook = useBackendConfig();

  if (editor == null) {
    // throw new Error("Editor is null");
    return <></>;
  }
  const header = (
    <EditorHeader
      isRightSidebarOpen={rightSidebar.isOpen}
      toggleRightSidebar={rightSidebar.toggle}
      isExecuting={isExecuting}
      toggleExecuting={toggleExecuting}
    />
  );

  return (
    <>
      <div className="flex h-full w-full" ref={menuContainerRef}>
        {isExecuting ? (
          <>
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
              {header}
              <div className="flex-1 overflow-y-auto">
                {backendConfigHook.backend == null ? (
                  <>TODO: select a backend msg</>
                ) : (
                  <>
                    <Play
                      backend={backendConfigHook.backend}
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
                  {header}
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
          backendConfigHook={backendConfigHook}
          isExecuting={isExecuting}
          onClose={rightSidebar.close}
        />
      </div>
    </>
  );
};
