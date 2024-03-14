import { createReactInlineContentSpec } from "@blocknote/react";
import { MegaphoneIcon } from "@heroicons/react/16/solid";
import PencilIcon from "@heroicons/react/16/solid/PencilIcon";
import { FC, useContext, useState } from "react";
import { Modal } from "./Modal";
import {
  EditorMetaContext,
  GenerateNodeData,
  OpenedContext,
  ToggleOpenedContext,
  UpdateEditorMetaContext,
} from "./Context";
import CreatableSelect from "react-select/creatable";
const LABEL_CN = "block text-sm font-medium leading-6 text-gray-900";

type SelectOption = {
  label: string;
  value: string;
};

const STOP_AT_OPTIONS: SelectOption[] = [
  {
    value: '"',
    label: 'Double quote (")',
  },
  {
    value: "'",
    label: "Single quote (')",
  },
  {
    value: "\n",
    label: "New line (\\n)",
  },
  {
    value: "\t",
    label: "Tab (\\t)",
  },
  {
    value: " ",
    label: "Space ( )",
  },
];

const INPUT_CN =
  "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

const GenerateComponentModal: FC<{
  name: string;
  onClose: () => void;
  setName: (name: string) => void;
  stop: string[];
  setStop: (stop: string[]) => void;
  maxTokens: number;
  setMaxTokens: (maxTokens: number) => void;
}> = ({ name, setName, onClose, stop, setStop, maxTokens, setMaxTokens }) => {
  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          // ev.stopPropagation();
          onClose();
        }}
      >
        <div>
          <label htmlFor="name" className={LABEL_CN}>
            Save as
          </label>
          <div className="mt-2">
            <input
              name="name"
              className={INPUT_CN}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <label className={LABEL_CN}>Stop</label>
          <div className="mt-2">
            <CreatableSelect
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              menuPortalTarget={document.body}
              isMulti
              options={STOP_AT_OPTIONS}
              value={stop.map((s) => ({
                label: STOP_AT_OPTIONS.find((o) => o.value === s)?.label || s,
                value: s,
              }))}
              onChange={(v) => {
                setStop(v.map((s) => s.value));
              }}
              classNames={{
                input: () => "no-ring-in-children",
              }}
            />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <label htmlFor="max_tokens" className={LABEL_CN}>
            Max Tokens
          </label>
          <div className="mt-2">
            <input
              name="max_tokens"
              type="number"
              className={INPUT_CN}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
    </>
  );
};
const LoadedGenerateComponent: FC<{
  uuid: string;
  data: GenerateNodeData;
}> = ({ uuid, data }) => {
  const setMeta = useContext(UpdateEditorMetaContext);

  const isOpenAll = useContext(OpenedContext);
  const isOpen = isOpenAll[uuid] ?? false;

  const openToggler = useContext(ToggleOpenedContext);

  const name = data.name;
  const [editableName, setEditableName] = useState(name);

  const [stop, setStop] = useState(data.stop);

  const [maxTokens, setMaxTokens] = useState(data.max_tokens);

  const setIsOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setMeta(uuid, "generate", (prev) => ({
        ...prev,
        name: editableName,
        stop: stop,
      }));
    }
    openToggler(uuid, isOpen);
  };
  return (
    <>
      <span
        className="p-1 rounded-md select-none cursor-pointer bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/25 dark:hover:bg-purple-800/25 transition-colors duration-100 ease-in-out"
        onClick={() => setIsOpen(true)}
      >
        <MegaphoneIcon className="h-4 w-4 inline mr-1" />
        {name}
        <PencilIcon className="h-4 w-4 inline ml-1" />
      </span>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <GenerateComponentModal
          name={editableName}
          setName={setEditableName}
          onClose={() => setIsOpen(false)}
          stop={stop}
          setStop={setStop}
          maxTokens={maxTokens}
          setMaxTokens={setMaxTokens}
        />
      </Modal>
    </>
  );
};
const GenerateComponent: FC<{
  uuid: string;
}> = ({ uuid }) => {
  const nodeGetter = useContext(EditorMetaContext);
  const node = nodeGetter(uuid, "generate");
  if (node == null) {
    return <span />;
  }
  return <LoadedGenerateComponent uuid={uuid} data={node} />;
};

export const Generate = createReactInlineContentSpec(
  {
    type: "generate",
    propSchema: {
      uuid: {
        default: "Unknown",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      return (
        <>
          <GenerateComponent uuid={props.inlineContent.props.uuid} />
        </>
      );
    },
  }
);
