import { Editor } from "@tiptap/react";
import { AuthorSelect } from "../extensions/AuthorSelect/AuthorSelect";
import { LmGenerator } from "../extensions/LmGenerator/LmGenerator";
import { VariableSelect } from "../extensions/VariableSelect/VariableSelect";

export const isTableGripSelected = (node: HTMLElement) => {
  let container = node;

  while (container && !["TD", "TH"].includes(container.tagName)) {
    container = container.parentElement!;
  }

  const gripColumn =
    container &&
    container.querySelector &&
    container.querySelector("a.grip-column.selected");
  const gripRow =
    container &&
    container.querySelector &&
    container.querySelector("a.grip-row.selected");

  if (gripColumn || gripRow) {
    return true;
  }

  return false;
};

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    AuthorSelect.name,
    LmGenerator.name,
    VariableSelect.name,
  ];

  return (
    customNodes.some((type) => editor.isActive(type)) ||
    isTableGripSelected(node)
  );
};

export default isCustomNodeSelected;
