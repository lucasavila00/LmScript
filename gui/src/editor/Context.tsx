import { FC, createContext, useState } from "react";

type EditorMeta = Record<string, string>;

export const EditorMetaContext = createContext<EditorMeta>({});

type MetaUpdater = (cb: (meta: EditorMeta) => EditorMeta) => void;
export const UpdateEditorMetaContext = createContext<MetaUpdater>(() => {});

export const EditorMetaProvider: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [meta, setMeta] = useState<EditorMeta>({
    "the uuid": "the name",
  });
  return (
    <EditorMetaContext.Provider value={meta}>
      <UpdateEditorMetaContext.Provider value={setMeta}>
        {children}
      </UpdateEditorMetaContext.Provider>
    </EditorMetaContext.Provider>
  );
};
