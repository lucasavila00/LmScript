import { type Task } from "@lmscript/client/backends/abstract";
import { getRoleEnd, getRoleStart, ChatTemplate } from "@lmscript/client/chat-template";
import { MessageOfAuthor } from "./messages-of-author";
import { Author, NamedVariable } from "./types";
import { assertIsNever } from "./utils";

export const applyChatTemplate = (
  messages: MessageOfAuthor[],
  variables: NamedVariable[],
  template: ChatTemplate,
): Task[] => {
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
      ...message.tasks.map((it): Task => {
        switch (it.tag) {
          case "AddTextTask":
            return it;
          case "GenerateTask":
            return it;
          case "ExtendedSelectTask":
            return {
              tag: "SelectTask",
              name: it.name,
              choices: it.choices.map((choice) => {
                switch (choice.tag) {
                  case "variable": {
                    const item = variables.find((v) => v.uuid === choice.value);
                    if (item == null) {
                      // We just throw here and assume this was checked before.
                      throw new Error(`Variable ${choice.value} not found`);
                    }
                    return item.value;
                  }
                  case "typed": {
                    const val = choice.value;
                    if (val.startsWith("{") && val.endsWith("}")) {
                      const inner = val.slice(1, -1);
                      const foundVariable = variables.find((v) => v.name === inner);
                      if (foundVariable != null) {
                        return foundVariable.value;
                      }
                    }
                    return val;
                  }
                  default: {
                    return assertIsNever(choice);
                  }
                }
              }),
            };
          case "VariableSelectExtension":
            return {
              tag: "AddTextTask",
              text: it.data.value,
            };
          default: {
            return assertIsNever(it);
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
