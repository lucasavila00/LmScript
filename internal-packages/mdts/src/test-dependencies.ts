import { ProgramService, buildServices } from "./dependencies";

export const buildTestServices = (
  it: Partial<ProgramService>
): ProgramService =>
  buildServices({
    logger: {
      log: () => {},
      debug: () => {},
    },
    ...it,
  });
