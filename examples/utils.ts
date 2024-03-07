export const assertIsNever = (x: never): never => {
  throw new Error(`Unexpected: ${x}`);
};
