import { type Task } from "@lmscript/client/backends/abstract";
import { getRoleEnd, getRoleStart, ChatTemplate } from "@lmscript/client/chat-template";
import { MessageOfAuthor } from "./messages-of-author";
import { Author } from "./types";

export const applyChatTemplate = (messages: MessageOfAuthor[], template: ChatTemplate): Task[] => {
  const countOfRoles: Record<Author, number> = {
    system: 0,
    user: 0,
    assistant: 0,
  };
  return messages.flatMap((message): Task[] => {
    const item: Task[] = [
      {
        tag: "AddTextTask",
        text: getRoleStart(template, message.author, countOfRoles),
      },
      ...message.tasks,
      {
        tag: "AddTextTask",
        text: getRoleEnd(template, message.author, countOfRoles),
      },
    ];
    countOfRoles[message.author] += 1;
    return item;
  });
};
