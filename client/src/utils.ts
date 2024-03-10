export const assertIsNever = (x: never): never => {
  throw new Error(`Unexpected: ${x}`);
};
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const NOOP = () => {};

export const ERROR_MESSAGES = {
  missingTemplate: "Template is required.",
  missingEosInTemplateConfig: "The template does not support eos.",
} as const;
