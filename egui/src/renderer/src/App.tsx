import { BlockEditor } from "gui/src/editor/BlockEditor";
import { useDarkmode } from "gui/src/lib/use-dark-mode";
import { createPortal } from "react-dom";
import { RenderDarkModeSwitcher } from "gui/src/components/dark-mode";
import { initialContent } from "gui/src/editor/hooks/init";
import { useState } from "react";
import { LmEditorState } from "gui/src/editor/lib/types";
import { useSidebar } from "gui/src/editor/hooks/useSideBar";

const serializeFile = (content: LmEditorState): string =>
  JSON.stringify(
    {
      version: "1",
      ...content,
    },
    null,
    2,
  );

function App(): JSX.Element {
  const darkModeHook = useDarkmode();

  const DarkModeSwitcher = createPortal(
    <RenderDarkModeSwitcher hook={darkModeHook} />,
    document.body,
  );

  const [currentFilePath, setCurrentFilePath] = useState<string | undefined>(undefined);

  const [keyBuster, setKeyBuster] = useState(0);
  const bumpKey = (): void => setKeyBuster((prev) => prev + 1);
  const sidebarState = useSidebar(true);
  const [initialEditorData, setInitialEditorData] = useState(initialContent);
  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor
        sidebarState={sidebarState}
        initialContent={initialEditorData}
        key={String(keyBuster)}
        onSaveFileAs={(content) => {
          setInitialEditorData(content);
          window.electron.ipcRenderer
            .invoke("saveFileAs", serializeFile(content))
            .then((filePath) => {
              if (filePath == null || filePath == "") {
                return;
              }
              setCurrentFilePath(filePath);
              bumpKey();
            });
        }}
        onSaveFile={(content) => {
          setInitialEditorData(content);
          window.electron.ipcRenderer.invoke("saveFile", serializeFile(content), currentFilePath);
        }}
        onOpenFile={() => {
          window.electron.ipcRenderer.invoke("openFile").then((data) => {
            if (data == null) {
              return;
            }
            const { stringifiedContent, filePath } = data;
            setInitialEditorData(JSON.parse(stringifiedContent));
            setCurrentFilePath(filePath);
            bumpKey();
          });
        }}
        currentFilePath={currentFilePath}
      />
    </>
  );
}

export default App;
