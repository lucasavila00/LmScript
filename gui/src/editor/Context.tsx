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

export type EditorMeta = Record<string, AllNodeData>;

export type OpenedModalState = Record<string, boolean>;

export const EditorMetaContext = createContext<NodeGetter>(() => undefined);

export type MetaUpdater = <T extends keyof NodeData>(
  id: string,
  type: T,
  cb: (meta: NodeData[T]) => NodeData[T]
) => void;
export const UpdateEditorMetaContext = createContext<MetaUpdater>(() => {});

export type MetaCreator = <T extends keyof NodeData>(
  id: string,
  type: T,
  meta: NodeData[T]
) => void;

export const CreateEditorMetaContext = createContext<MetaCreator>(() => {});

export const OpenedContext = createContext<OpenedModalState>({});

export type OpenedToggler = (id: string, value: boolean) => void;
export const ToggleOpenedContext = createContext<OpenedToggler>(() => {});

export const LastModalStateContext = createContext<boolean>(false);

export const EditorMetaProvider: FC<{
  children: React.ReactNode;
  meta: EditorMeta;
  setMeta: (cb: (prev: EditorMeta) => EditorMeta) => void;
}> = ({ children, meta, setMeta }) => {
  const [opened, setOpened] = useState<OpenedModalState>({});
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
  const metaCreator = useCallback<MetaCreator>(
    (id, _type, meta) => {
      setMeta((prev) => {
        const item = prev[id];
        if (item != null) {
          throw new Error(`Node with id ${id} already exists`);
        }
        return {
          ...prev,
          [id]: meta,
        };
      });
    },
    [setMeta]
  );
  const toggleOpened = useCallback<OpenedToggler>(
    (id, value) => {
      setOpened((_prev) => {
        return {
          [id]: value,
        };
      });
    },
    [setOpened]
  );
  const lastModalState = Object.values(opened).filter(Boolean).length > 0;
  return (
    <EditorMetaContext.Provider value={nodeGetter}>
      <UpdateEditorMetaContext.Provider value={metaUpdater}>
        <CreateEditorMetaContext.Provider value={metaCreator}>
          <OpenedContext.Provider value={opened}>
            <ToggleOpenedContext.Provider value={toggleOpened}>
              <LastModalStateContext.Provider value={lastModalState}>
                {children}
              </LastModalStateContext.Provider>
            </ToggleOpenedContext.Provider>
          </OpenedContext.Provider>
        </CreateEditorMetaContext.Provider>
      </UpdateEditorMetaContext.Provider>
    </EditorMetaContext.Provider>
  );
};
