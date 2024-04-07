import { ProgramService, buildServices } from "../dependencies";
import { parseArgs } from "node:util";
import * as chokidar from "chokidar";
import { convertFile, convertFolder } from "../programs/from-test/from-tests";

const startWatcher = async (
  deps: ProgramService,
  folderName: string,
  outputFolder: string
) => {
  // watch only markdown files
  const w = chokidar
    .watch(folderName + "/**/*.test.ts")
    .on("all", (event, path) => {
      if (event == "add" || event == "change") {
        console.log("Reload: " + path);
        convertFile(path, outputFolder).execute(deps).catch(console.error);
      }
    });

  return new Promise((_rs, rj) => {
    w.on("error", rj);
  });
};

const getInputOutputFolderNames = (positionals: string[]): [string, string] => {
  if (positionals.length != 2) {
    throw new Error("Expected two positional arguments");
  }
  const [a, b] = positionals;
  return [a, b];
};

export const main = async () => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      run: {
        type: "boolean",
      },
    },
  });

  const services = buildServices({});
  const [i, o] = getInputOutputFolderNames(positionals);
  await convertFolder(i, o).execute(services);
  if (!values.run) {
    await startWatcher(services, i, o);
  }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
