import { MessageOfAuthor } from "./messages-of-author";
import { NamedVariable } from "./types";
import { assertIsNever } from "./utils";

export const applyToSource = (messages: MessageOfAuthor[], variables: NamedVariable[]): string => {
  let usedVariables: NamedVariable[] = [];
  const actions = messages
    .map((message): string => {
      let acc = "";
      acc += "." + message.author + "(";
      acc += "m => m\n";

      const spaces = "   ";

      acc += message.tasks
        .map((task) => {
          switch (task.tag) {
            case "AddTextTask": {
              return `${spaces}.push(${JSON.stringify(task.text)})`;
            }
            case "GenerateTask": {
              const opts = JSON.stringify({
                maxTokens: task.max_tokens,
                stop: task.stop,
                regex: task.regex,
              });
              if (task.name == null) {
                return `${spaces}.gen(${opts})`;
              }
              return `${spaces}.gen(${JSON.stringify(task.name)}, ${opts})`;
            }
            case "ExtendedSelectTask": {
              const choices = task.choices
                .map((choice) => {
                  switch (choice.tag) {
                    case "variable": {
                      const item = variables.find((v) => v.uuid === choice.value);
                      if (item == null) {
                        // We just throw here and assume this was checked before.
                        throw new Error(`Variable ${choice.value} not found`);
                      }
                      usedVariables.push(item);
                      return item.name;
                    }
                    case "typed": {
                      const val = choice.value;
                      if (val.startsWith("{") && val.endsWith("}")) {
                        const inner = val.slice(1, -1);
                        const foundVariable = variables.find((v) => v.name === inner);
                        if (foundVariable != null) {
                          usedVariables.push(foundVariable);
                          return foundVariable.name;
                        }
                      }
                      return JSON.stringify(val);
                    }
                    default: {
                      return assertIsNever(choice);
                    }
                  }
                })
                .join(", ");
              if (task.name == null) {
                return `${spaces}.select({choices: [${choices}]})`;
              }
              return `${spaces}.select(${JSON.stringify(task.name)}, {choices: [${choices}]})`;
            }
            case "VariableSelectExtension": {
              usedVariables.push(task.data);
              return `${spaces}.push(${task.data.name})`;
            }
            default: {
              return assertIsNever(task);
            }
          }
        })
        .join("\n");
      acc += "\n)";
      return acc;
    })
    .join("\n");
  return `export default (client: InitClient, {${usedVariables.map((it) => it.name + " = " + JSON.stringify(it.value)).join(", ")}}) => client${actions}`;
};
