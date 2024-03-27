export const assertIsNever = (x: never): never => {
  throw new Error(`Unexpected: ${x}`);
};
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const NOOP = () => {};

export const ERROR_MESSAGES = {
  missingTemplate: "Template is required.",
  missingEosInTemplateConfig: (template: string): string =>
    `The template '${template}' does not support eos.`,
  cannotNestRoles: "Nesting roles is not supported.",
  missingRoleStartInTemplateConfig: (template: string, role: string): string =>
    `The template '${template}' does not support role '${role}'.`,
  missingBosInTemplateConfig: (template: string): string =>
    `The template '${template}' does not support bos.`,
} as const;
