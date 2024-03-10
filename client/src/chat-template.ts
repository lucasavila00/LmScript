import { ERROR_MESSAGES } from "./utils.ts";

/**
 * One of possible roles in a conversation.
 */
export type Role = "assistant" | "system" | "user";

/**
 * A special type that represents the end of a message.
 * Do not use this directly, use `client.eos()` instead.
 */
export type Eos =
  "%%%%%%%%%HACK_TYPE_FOR_EOS_DO_NOT_USE_THIS_STRING_DIRECTLY%%%%%%%%%%";
/**
 * Supported chat templates.
 */
export type ChatTemplate =
  | "llama-2-chat"
  | "default"
  | "claude"
  | "chatml"
  | "chatml-llava"
  | "vicuna_v1.1";
/**
 * The definition of a chat template.
 * There are a handful of commonly used templates, and each model uses a different one.
 * Read the documentation for the model to know which template to use.
 */
export type ChatTemplateDefinition = {
  assistant: [string, string];
  system: [string, string];
  user: [string, string];

  eos: string | null;
};
type AllChatTemplates = Record<ChatTemplate, ChatTemplateDefinition>;

const chatTemplates: AllChatTemplates = {
  default: {
    system: ["SYSTEM:", "\n"],
    user: ["USER:", "\n"],
    assistant: ["ASSISTANT:", "\n"],
    eos: null,
  },
  claude: {
    system: ["", ""],
    user: ["\n\nHuman: ", ""],
    assistant: ["\n\nAssistant:", ""],
    eos: null,
  },
  chatml: {
    system: ["<|im_start|>system\n", "<|im_end|>\n"],
    user: ["<|im_start|>user\n", "<|im_end|>\n"],
    assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
    eos: "<|im_end|>",
  },
  "chatml-llava": {
    system: ["<|im_start|>system\n", "<|im_end|>\n"],
    user: ["<|im_start|>user\n", "<|im_end|>\n"],
    assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
    eos: "<|im_end|>",
  },
  "vicuna_v1.1": {
    system: ["", " "],
    user: ["USER:", " "],
    assistant: ["ASSISTANT:", "</s>"],
    eos: "</s>",
  },
  "llama-2-chat": {
    system: ["<<SYS>>\n", "\n<</SYS>>\n\n"],
    user: ["[INST] ", " [/INST]"],
    assistant: ["", " </s><s>"],
    eos: "</s>",
  },
};

export const getRoleStart = (template: ChatTemplate, role: Role) =>
  chatTemplates[template][role][0];
export const getRoleEnd = (template: ChatTemplate, role: Role) =>
  chatTemplates[template][role][1];

export const getEos = (template: ChatTemplate): Eos => {
  const eos = chatTemplates[template].eos;
  if (eos === null) {
    throw new Error(ERROR_MESSAGES.missingEosInTemplateConfig);
  }
  return eos as Eos;
};
