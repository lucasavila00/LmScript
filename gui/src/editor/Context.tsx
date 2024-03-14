import { FC, createContext, useCallback, useState } from "react";

export type GenerateNodeData = {
  tag: "generate";
  name: string;
  stop: string[];
  max_tokens: number;
};

type NodeData = {
  generate: GenerateNodeData;
};

type AllNodeData = NodeData[keyof NodeData];

type NodeGetter = <T extends keyof NodeData>(
  id: string,
  type: T
) => NodeData[T] | undefined;

type EditorMeta = Record<string, AllNodeData>;

export const EditorMetaContext = createContext<NodeGetter>(() => undefined);

type MetaUpdater = <T extends keyof NodeData>(
  id: string,
  type: T,
  cb: (meta: NodeData[T]) => NodeData[T]
) => void;
export const UpdateEditorMetaContext = createContext<MetaUpdater>(() => {});

export const EditorMetaProvider: FC<{
  children: React.ReactNode;
  initialState: EditorMeta;
}> = ({ children, initialState }) => {
  const [meta, setMeta] = useState<EditorMeta>(initialState);
  const nodeGetter = useCallback<NodeGetter>(
    (id, type) => {
      const item = meta[id];
      if (item == null) {
        return item;
      }
      if (item.tag === type) {
        return item as NodeData[typeof type];
      }
      throw new Error(`Node with id ${id} is not of type ${type}`);
    },
    [meta]
  );
  const metaUpdater = useCallback<MetaUpdater>(
    (id, type, cb) => {
      setMeta((prev) => {
        const item = prev[id];
        if (item == null) {
          return prev;
        }
        if (item.tag === type) {
          return {
            ...prev,
            [id]: cb(item as NodeData[typeof type]),
          };
        }
        throw new Error(`Node with id ${id} is not of type ${type}`);
      });
    },
    [setMeta]
  );
  return (
    <EditorMetaContext.Provider value={nodeGetter}>
      <UpdateEditorMetaContext.Provider value={metaUpdater}>
        {children}
      </UpdateEditorMetaContext.Provider>
    </EditorMetaContext.Provider>
  );
};
