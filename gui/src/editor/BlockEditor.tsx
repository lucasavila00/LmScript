import { Editor, EditorContent } from "@tiptap/react";
import { useBlockEditor } from "./hooks/useBlockEditor";
import { ContentItemMenu } from "./components/ContentItemMenu";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { RightSidebar } from "./components/RightSidebar";
import { EditorHeader } from "./components/EditorHeader";
import { VariablesContext } from "./context/variables";
import { EditorContext } from "./context/editor";
import { TextMenu } from "./components/TextMenu";
import { useBackendConfig } from "./hooks/useBackendConfig";
import { Play, ValidationError } from "./components/Play/Play";
import { LmEditorState, NamedVariable } from "./lib/types";
import { SidebarState } from "./hooks/useSideBar";
import { useVariables } from "./hooks/useVariables";
import { useSamplingParams } from "./hooks/useSamplingParams";
import stringify from "json-stable-stringify";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { getMessagesOfAuthor } from "./lib/playMessages";
import { messagesToTasks } from "./lib/messageToTasks";
import { ChatTemplate } from "@lmscript/client/chat-template";
import { SelectChatTemplate } from "./components/BackendSetup";
import { assertIsNever } from "../lib/utils";
type LoadedEditorCommonProps = {
  currentFilePath: string | undefined;
  onSaveFileAs: (content: LmEditorState) => void;
  onSaveFile: (content: LmEditorState) => void;
  sidebarState: SidebarState;
  onOpenFile: () => void;
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

const TaskJSONWithTemplate: FC<{
  editorState: LmEditorState;
  template: ChatTemplate | undefined;
  variables: NamedVariable[];
}> = ({ editorState, template, variables }) => {
  const msgs = getMessagesOfAuthor(editorState);
  if (msgs.tag === "error") {
    return <ValidationError transformResult={msgs} />;
  }

  if (template == null) {
    return <>Please select a template</>;
  }

  const tasks = messagesToTasks(msgs.value, template, variables);
  const generations = msgs.value.flatMap((it) =>
    it.parts.flatMap((it) => {
      switch (it.tag) {
        case "lmGenerate": {
          return [
            {
              uuid: it.nodeAttrs.id,
              name: it.nodeAttrs.name,
            },
          ];
        }
        case "text": {
          return [];
        }
        default: {
          return assertIsNever(it);
        }
      }
    }),
  );
  const data = { tasks, generations };
  return (
    <>
      <pre className="whitespace-pre-wrap p-4 max-w-2xl mx-auto max-h-80 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
      <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}>
        Copy to Clipboard
      </Button>
    </>
  );
};

const TaskJSON: FC<{
  editorState: LmEditorState;
  variables: NamedVariable[];
}> = ({ editorState, variables }) => {
  const [template, setTemplate] = useState<ChatTemplate | undefined>(undefined);
  return (
    <>
      <div className="flex flex-col gap-4">
        <SelectChatTemplate value={template} onChange={(it) => setTemplate(it)} />
        <TaskJSONWithTemplate editorState={editorState} template={template} variables={variables} />
      </div>
    </>
  );
};

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
}) => {
  const menuContainerRef = useRef(null);
  const backendConfigHook = useBackendConfig();
  const [isExporting, setIsExporting] = useState(false);
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
      }}
      onExportToTasks={() => setIsExporting(true)}
    />
  );

  return (
    <>
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Tasks</DialogTitle>
            <DialogDescription>
              <TaskJSON editorState={getLmEditorState()} variables={variablesHook.variables} />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex h-full w-full" ref={menuContainerRef}>
        {isExecuting ? (
          <>
            <div className="relative flex flex-col flex-1 h-full overflow-hidden">
              {header}
              <div className="flex-1 overflow-y-auto">
                {backendConfigHook.backend == null ? (
                  <div className="mt-8">
                    Configure a backend to execute the editor content.
                    <Button onClick={sidebarState.open}>Open Backend Config</Button>
                  </div>
                ) : (
                  <>
                    <Play
                      backend={backendConfigHook.backend}
                      editorState={getLmEditorState()}
                      onOpenBackendConfig={sidebarState.open}
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
> = ({ initialContent, onSaveFileAs, currentFilePath, onSaveFile, sidebarState, onOpenFile }) => {
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
    />
  );
};
