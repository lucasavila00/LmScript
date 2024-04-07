import * as path from "node:path";
import { ProgramService, AppFlue } from "../dependencies";

async function traverseDir(
  dir: string,
  deps: ProgramService
): Promise<string[]> {
  const acc: string[] = [];
  const fs = await deps.fs.readdir(dir);

  for (const file of fs) {
    const fullPath = path.join(dir, file);
    if ((await deps.fs.lstat(fullPath)).isDirectory()) {
      acc.push(...(await traverseDir(fullPath, deps)));
    } else {
      acc.push(fullPath);
    }
  }

  return acc;
}

const getAllFiles = (path: string): AppFlue<string[]> =>
  AppFlue.try((d) => traverseDir(path, d));

export const getAllTestFilesOfFolder = (
  folderPath: string
): AppFlue<string[]> =>
  getAllFiles(folderPath).try((files) =>
    files.filter((it) => it.endsWith(".test.ts"))
  );
export const maybeDeleteFile = (filename: string): AppFlue<void> =>
  AppFlue.try(async (deps) => {
    try {
      await deps.fs.unlink(filename);
    } catch (e) {}
  });

export const writeFileAndParentFolder = (
  testFileName: string,
  content: string
): AppFlue<void> =>
  AppFlue.resolve({})
    .tryKv("createFolder", (_acc, d) =>
      d.fs.mkdir(path.parse(testFileName).dir, { recursive: true })
    )
    .tryKv("writeFile", (_acc, d) => d.fs.writeFile(testFileName, content))
    .try(() => void 0);
