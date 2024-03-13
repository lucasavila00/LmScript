import {
  createReactInlineContentSpec,
  useEditorChange,
} from "@blocknote/react";
import { MegaphoneIcon } from "@heroicons/react/16/solid";
import PencilIcon from "@heroicons/react/16/solid/PencilIcon";
import { FC, useContext, useState } from "react";
import { Modal } from "./Modal";
import { EditorMetaContext, UpdateEditorMetaContext } from "./Context";

const GenerateComponentModal: FC<{
  name: string;
  onClose: () => void;
  setName: (name: string) => void;
}> = ({ name, setName, onClose }) => {
  return (
    <>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Save as
        </label>
        <div className="mt-2">
          <input
            name="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="you@example.com"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 sm:mt-6">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onClose}
        >
          Go back to dashboard
        </button>
      </div>
    </>
  );
};
const GenerateComponent: FC<{
  uuid: string;
}> = ({ uuid }) => {
  const meta = useContext(EditorMetaContext);
  const name = meta[uuid];
  console.log({ name, meta, uuid });
  const [isOpen, setIsOpen_] = useState(false);
  const [editableName, setEditableName] = useState(name);
  const setMeta = useContext(UpdateEditorMetaContext);

  const setIsOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setMeta((prev) => ({ ...prev, [uuid]: editableName }));
    }
    setIsOpen_(isOpen);
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
        />
      </Modal>
    </>
  );
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
    render: (props) => (
      <>
        <GenerateComponent uuid={props.inlineContent.props.uuid} />
      </>
    ),
  }
);
