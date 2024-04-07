import * as fs from "node:fs/promises";
import { BuiltBy, Flue, Service } from "flue-ts";

export interface ProgramService {
  fs: typeof fs;
  logger: {
    log: typeof console.log;
    debug: typeof console.debug;
  };
}
export const ProgramService = Service<ProgramService>();

export const AppFlue = Flue.depends(ProgramService);
export type AppFlue<A> = BuiltBy<typeof AppFlue, A>;

export const buildServices = (it: Partial<ProgramService>): ProgramService => ({
  fs,
  logger: {
    log: console.log,
    debug: () => {},
    // debug: console.debug,
  },
  ...it,
});
