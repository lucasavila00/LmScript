import { type Task } from "@lmscript/client/backends/abstract";
import { LmEditorState } from "./types";
import { MessageOfAuthorGetter } from "./messages-of-author";
import { messagesToTasks } from "./message-to-tasks";
import { ChatTemplate } from "@lmscript/client/chat-template";

export const compileEditorState = (editorState: LmEditorState, template: ChatTemplate): Task[] => {
  const state = new MessageOfAuthorGetter(editorState);

  const errors = state.getErrors();
  if (errors.length > 0) {
    // TODO: serialize errors
    throw new Error(JSON.stringify(errors));
  }
  const messages = state.getAcc();

  return messagesToTasks(messages, template, editorState.variables);
};
