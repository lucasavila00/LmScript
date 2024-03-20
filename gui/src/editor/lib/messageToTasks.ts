import { type Task } from "@lmscript/client/backends/abstract";
import {
  getRoleEnd,
  getRoleStart,
  ChatTemplate,
} from "@lmscript/client/chat-template";
import { MessageOfAuthor, MessagePart } from "./playMessages";
import { assertIsNever } from "../../lib/utils";
import { NamedVariable } from "./types";

// exported for testing
export const messagePartToTasks = (
  part: MessagePart,
  variables: NamedVariable[],
): Task => {
  switch (part.tag) {
    case "text": {
      return {
        tag: "AddTextTask",
        text: part.text,
      };
    }
    case "lmGenerate": {
      switch (part.nodeAttrs.type) {
        case "generation": {
          return {
            tag: "GenerateTask",
            name: part.nodeAttrs.id,
            stop: part.nodeAttrs.stop,
            max_tokens: part.nodeAttrs.max_tokens,
            regex: undefined,
          };
        }
        case "regex": {
          return {
            tag: "GenerateTask",
            name: part.nodeAttrs.id,
            stop: [],
            max_tokens: 256,
            regex: part.nodeAttrs.regex,
          };
        }
        case "selection": {
          return {
            tag: "SelectTask",
            name: part.nodeAttrs.id,
            choices: part.nodeAttrs.choices.map((choice) => {
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
                    const foundVariable = variables.find(
                      (v) => v.name === inner,
                    );
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
        }
        default: {
          return assertIsNever(part.nodeAttrs.type);
        }
      }
    }
    default: {
      return assertIsNever(part);
    }
  }
};
export const messagesToTasks = (
  messages: MessageOfAuthor[],
  template: ChatTemplate,
  variables: NamedVariable[],
): Task[] => {
  return messages.flatMap((message): Task[] => {
    return [
      {
        tag: "AddTextTask",
        text: getRoleStart(template, message.author),
      },
      ...message.parts.flatMap((part) => messagePartToTasks(part, variables)),
      {
        tag: "AddTextTask",
        text: getRoleEnd(template, message.author),
      },
    ];
  });
};
