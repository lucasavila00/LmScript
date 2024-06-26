import { Editor, EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { FC, useCallback, useEffect, useRef } from "react";
import { RightSidebar } from "./components/RightSidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import { EditorContext } from "./context/editor";
import { TextMenu } from "./components/TextMenu";
import { useBackendConfig } from "./hooks/useBackendConfig";
import { Play } from "./components/Play/Play";
import { LmEditorState } from "@lmscript/editor-tools/types";
import { SidebarState } from "./hooks/useSideBar";
import { useVariables } from "./hooks/useVariables";
import { useSamplingParams } from "./hooks/useSamplingParams";
import stringify from "json-stable-stringify";
import { Button } from "../components/ui/button";
import React from "react";

type LoadedEditorCommonProps = {
  currentFilePath: string | undefined;
  onSaveFileAs: (content: LmEditorState) => void;
  onSaveFile: (content: LmEditorState) => void;
  sidebarState: SidebarState;
  onOpenFile: () => void;
  onNewEmpty: () => void;
  initialContent: LmEditorState;
};

const useAutoSave = (
  getLmEditorState: () => LmEditorState,
  currentFilePath: string | undefined,
  onSaveFile: (content: LmEditorState) => void,
  initialContent: LmEditorState,
) => {
  const onSaveFileRef = useRef(onSaveFile);
  onSaveFileRef.current = onSaveFile;

  const initialContentRef = useRef(initialContent);
  initialContentRef.current = initialContent;
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        stringify(initialContentRef.current) !== stringify(getLmEditorState()) &&
        currentFilePath != null
      ) {
        onSaveFileRef.current(getLmEditorState());
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [getLmEditorState, currentFilePath]);
};

const ErrorRenderer: FC<{
  error: unknown;
  onOpenBackendConfig: () => void;
}> = ({ error, onOpenBackendConfig }) => {
  return (
    <>
      <div className="flex items-center justify-center flex-col mt-12 gap-2">
        <div className="text-lg font-medium">An Error Ocurred</div>
        <div className="text-sm text-muted-foreground max-w-xl text-center">{String(error)}</div>

        <div className="text-sm text-muted-foreground max-w-xl text-center mt-8">
          If the error persists, please check the backend configuration.
        </div>
        <Button className="mt-4" onClick={onOpenBackendConfig}>
          Open Backend Config
        </Button>
      </div>
    </>
  );
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onOpenBackendConfig: () => void;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { theError: null | unknown }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { theError: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { theError: error };
  }

  render() {
    if (this.state.theError != null) {
      return (
        <ErrorRenderer
          error={this.state.theError}
          onOpenBackendConfig={this.props.onOpenBackendConfig}
        />
      );
    }

    return this.props.children;
  }
}

const LoadedBlockEditor: FC<
  LoadedEditorCommonProps & {
    editor: Editor;
    isExecuting: boolean;
    toggleExecuting: () => void;
    variablesHook: ReturnType<typeof useVariables>;
    samplingParamsHook: ReturnType<typeof useSamplingParams>;
  }
> = ({
  isExecuting,
  toggleExecuting,
  editor,
  variablesHook,
  samplingParamsHook,
  onSaveFileAs,
  currentFilePath,
  onSaveFile,
  sidebarState,
  onOpenFile,
  initialContent,
  onNewEmpty,
}) => {
  const menuContainerRef = useRef(null);
  const backendConfigHook = useBackendConfig();
  const getLmEditorState = useCallback(
    () => ({
      doc: editor.getJSON(),
      variables: variablesHook.variables,
      samplingParams: samplingParamsHook.samplingParams,
      version: "1" as const,
    }),
    [editor, variablesHook.variables, samplingParamsHook.samplingParams],
  );

  useAutoSave(getLmEditorState, currentFilePath, onSaveFile, initialContent);

  const header = (
    <EditorHeader
      isRightSidebarOpen={sidebarState.isOpen}
      toggleRightSidebar={sidebarState.toggle}
      isExecuting={isExecuting}
      toggleExecuting={toggleExecuting}
      fileManagement={{
        filePath: currentFilePath,
        onOpenFile,
        onSaveFile: () => onSaveFile(getLmEditorState()),
        onSaveAsFile: () => onSaveFileAs(getLmEditorState()),
        onNewEmpty,
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
                  <div className="mt-8 flex flex-col items-center">
                    Configure a backend to execute the editor content.
                    <Button className="mt-4" onClick={sidebarState.open}>
                      Open Backend Config
                    </Button>
                  </div>
                ) : (
                  <>
                    <ErrorBoundary onOpenBackendConfig={sidebarState.open}>
                      <Play
                        backend={backendConfigHook.backend}
                        editorState={getLmEditorState()}
                        onOpenBackendConfig={sidebarState.open}
                      />
                    </ErrorBoundary>
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
                  <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
                  <ContentItemMenu editor={editor} />
                  <TextMenu editor={editor} />
                </div>
              </EditorContext.Provider>
            </VariablesContext.Provider>
          </>
        )}
        <RightSidebar
          isOpen={sidebarState.isOpen}
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

export const BlockEditor: FC<
  LoadedEditorCommonProps & {
    initialContent: LmEditorState;
  }
> = ({
  onNewEmpty,
  initialContent,
  onSaveFileAs,
  currentFilePath,
  onSaveFile,
  sidebarState,
  onOpenFile,
}) => {
  const { isExecuting, toggleExecuting, editor, variablesHook, samplingParamsHook } =
    useBlockEditor(initialContent);

  if (editor == null) {
    // it can be null while mounting
    return <></>;
  }

  return (
    <LoadedBlockEditor
      isExecuting={isExecuting}
      toggleExecuting={toggleExecuting}
      editor={editor}
      variablesHook={variablesHook}
      samplingParamsHook={samplingParamsHook}
      onSaveFileAs={onSaveFileAs}
      currentFilePath={currentFilePath}
      onSaveFile={onSaveFile}
      sidebarState={sidebarState}
      onOpenFile={onOpenFile}
      initialContent={initialContent}
      onNewEmpty={onNewEmpty}
    />
  );
};
