export const assertIsNever = (x: never): never => {
  throw new Error(`Unexpected: ${x}`);
};
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
