export const assertIsNever = <T>(x: never): T => {
  throw new Error(`Unexpected: ${x}`);
};
