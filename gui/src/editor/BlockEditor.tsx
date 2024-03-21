import { EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { FC, useRef } from "react";
import { RightSidebar } from "./components/RightSidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import { EditorContext } from "./context/editor";
import { TextMenu } from "./components/TextMenu";
import { useBackendConfig } from "./hooks/useBackendConfig";
import { Play } from "./components/Play/Play";
import { LmEditorState } from "./lib/types";
import { SidebarState } from "./hooks/useSideBar";

import stringify from "json-stable-stringify";

export const BlockEditor: FC<{
  initialContent: LmEditorState;
  currentFilePath: string | undefined;
  onSaveFileAs: (content: LmEditorState) => void;
  onSaveFile: (content: LmEditorState) => void;
  sidebarState: SidebarState;
  onOpenFile: () => void;
}> = ({
  initialContent,
  onSaveFileAs,
  currentFilePath,
  onSaveFile,
  sidebarState,
  onOpenFile,
}) => {
  const {
    isExecuting,
    toggleExecuting,
    editor,
    variablesHook,
    samplingParamsHook,
  } = useBlockEditor(initialContent);
  const menuContainerRef = useRef(null);
  const backendConfigHook = useBackendConfig();
  if (editor == null) {
    // it can be null while mounting
    return <></>;
  }

  const lmEditorState = {
    doc: editor?.getJSON(),
    variables: variablesHook.variables,
    samplingParams: samplingParamsHook.samplingParams,
    version: "1" as const,
  };
  const header = (
    <EditorHeader
      isRightSidebarOpen={sidebarState.isOpen}
      toggleRightSidebar={sidebarState.toggle}
      isExecuting={isExecuting}
      toggleExecuting={toggleExecuting}
      fileManagement={{
        filePath: currentFilePath,
        onOpenFile,
        onSaveFile: () => onSaveFile(lmEditorState),
        onSaveAsFile: () => onSaveFileAs(lmEditorState),
        hasChangesToSave: stringify(lmEditorState) != stringify(initialContent),
      }}
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
                      editorState={lmEditorState}
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
          isOpen={sidebarState.isOpen}
          editor={editor}
          variablesHook={variablesHook}
          samplingParamsHook={samplingParamsHook}
          backendConfigHook={backendConfigHook}
          isExecuting={isExecuting}
          onClose={sidebarState.close}
        />
      </div>
    </>
  );
};
