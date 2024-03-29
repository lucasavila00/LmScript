import { ERROR_MESSAGES } from "./utils";

/**
 * One of possible roles in a conversation.
 */
export type Role = "assistant" | "system" | "user";

/**
 * A special type that represents the end of a message.
 * Do not use this directly, use `client.eos()` instead.
 */
export type Eos = "%%%%%%%%%HACK_TYPE_FOR_EOS_DO_NOT_USE_THIS_STRING_DIRECTLY%%%%%%%%%%";

/**
 * List of all supported chat templates.
 */
export const ALL_CHAT_TEMPLATES = [
  // "mistral",
  // "default",
  // "claude",
  // "chatml",
  // "chatml-llava",
  // "vicuna_v1.1",
  "mistral",
] as const;
/**
 * Supported chat templates.
 */
export type ChatTemplate = (typeof ALL_CHAT_TEMPLATES)[number];
/**
 * The definition of a chat template.
 * There are a handful of commonly used templates, and each model uses a different one.
 * Read the documentation for the model to know which template to use.
 */
export type ChatTemplateDefinition = {
  assistant: [string, string];
  system: [string | null, string | null];
  user: [string, string];
  eos: string | null;
  bos: string | null;
};
type AllChatTemplates = Record<ChatTemplate, ChatTemplateDefinition>;

const chatTemplates: AllChatTemplates = {
  // default: {
  //   system: ["SYSTEM:", "\n"],
  //   user: ["USER:", "\n"],
  //   assistant: ["ASSISTANT:", "\n"],
  //   eos: null,
  //   bos: null,
  // },
  // claude: {
  //   system: ["", ""],
  //   user: ["\n\nHuman: ", ""],
  //   assistant: ["\n\nAssistant:", ""],
  //   eos: null,
  //   bos: null,
  // },
  // chatml: {
  //   system: ["<|im_start|>system\n", "<|im_end|>\n"],
  //   user: ["<|im_start|>user\n", "<|im_end|>\n"],
  //   assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
  //   eos: "<|im_end|>",
  //   bos: null,
  // },
  // "chatml-llava": {
  //   system: ["<|im_start|>system\n", "<|im_end|>\n"],
  //   user: ["<|im_start|>user\n", "<|im_end|>\n"],
  //   assistant: ["<|im_start|>assistant\n", "<|im_end|>\n"],
  //   eos: "<|im_end|>",
  //   bos: null,
  // },
  // "vicuna_v1.1": {
  //   system: ["", " "],
  //   user: ["USER:", " "],
  //   assistant: ["ASSISTANT:", "</s>"],
  //   eos: "</s>",
  //   bos: null,
  // },
  // "mistral": {
  //   system: ["<<SYS>>\n", "\n<</SYS>>\n\n"],
  //   user: ["[INST] ", " [/INST]"],
  //   assistant: ["", " </s><s>"],
  //   eos: "</s>",
  //   bos: null,
  // },
  mistral: {
    system: [null, null],
    user: ["[INST] ", " [/INST]"],
    assistant: ["", "</s>"],
    eos: "</s>",
    bos: "<s>",
  },
};

export const isFirstMessage = (countOfRoles: Record<Role, number>): boolean => {
  return countOfRoles.assistant + countOfRoles.system + countOfRoles.user === 0;
};
export const getRoleStart = (
  template: ChatTemplate,
  role: Role,
  countOfRoles: Record<Role, number>,
): string => {
  let prefix = "";
  if (isFirstMessage(countOfRoles)) {
    const bos = chatTemplates[template].bos;
    if (bos === null) {
      throw new Error(ERROR_MESSAGES.missingBosInTemplateConfig(template));
    }

    prefix = bos;
  }

  const str = chatTemplates[template][role][0];
  if (str === null) {
    throw new Error(ERROR_MESSAGES.missingRoleStartInTemplateConfig(template, role));
  }
  return prefix + str;
};
export const getRoleEnd = (
  template: ChatTemplate,
  role: Role,
  _countOfRoles: Record<Role, number>,
): string => {
  const str = chatTemplates[template][role][1];
  if (str === null) {
    throw new Error(ERROR_MESSAGES.missingRoleStartInTemplateConfig(template, role));
  }
  return str;
};

export const getEos = (template: ChatTemplate): Eos => {
  const eos = chatTemplates[template].eos;
  if (eos === null) {
    throw new Error(ERROR_MESSAGES.missingEosInTemplateConfig(template));
  }
  return eos as Eos;
};
