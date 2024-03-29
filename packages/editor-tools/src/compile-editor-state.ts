import { type Task } from "@lmscript/client/backends/abstract";
import { LmEditorState } from "./types";
import { MessageOfAuthorGetter, printCustomError } from "./messages-of-author";
import { applyChatTemplate } from "./apply-chat-template";
import { ChatTemplate } from "@lmscript/client/chat-template";

export const compileEditorState = (
  editorState: LmEditorState,
  template: ChatTemplate,
  variableOverrides?: Record<string, string>,
): Task[] => {
  const overrides = variableOverrides ?? {};

  const newVariables = editorState.variables.map((variable) => {
    if (variable.name in overrides) {
      return {
        ...variable,
        value: overrides[variable.name],
      };
    }
    return variable;
  });

  const state = new MessageOfAuthorGetter({ ...editorState, variables: newVariables });

  const errors = state.getErrors();
  if (errors.length > 0) {
    throw new Error(errors.map(printCustomError).join("\n"));
  }
  const messages = state.getAcc();

  return applyChatTemplate(messages, template);
};
