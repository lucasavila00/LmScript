import { type Task } from "@lmscript/client/backends/abstract";
import { MessageOfAuthor } from "./playMessages";
export const messagesToTasks = (messages: MessageOfAuthor[]): Task[] => {
  return messages.flatMap((_message) => {
    return [];
  });
};
