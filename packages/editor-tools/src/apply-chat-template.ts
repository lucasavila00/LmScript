import { type Task } from "@lmscript/client/backends/abstract";
import { getRoleEnd, getRoleStart, ChatTemplate } from "@lmscript/client/chat-template";
import { MessageOfAuthor } from "./messages-of-author";
import { Author } from "./types";
import { assertIsNever } from "./utils";

// exported for testing
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
      ...message.parts.flatMap((part): Task => {
        switch (part.tag) {
          case "text": {
            return {
              tag: "AddTextTask",
              text: part.text,
            };
          }
          case "lmGenerate": {
            return part.task;
          }
          default: {
            return assertIsNever(part);
          }
        }
      }),
      {
        tag: "AddTextTask",
        text: getRoleEnd(template, message.author, countOfRoles),
      },
    ];
    countOfRoles[message.author] += 1;
    return item;
  });
};
