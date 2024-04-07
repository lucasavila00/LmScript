import { test, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { convertFileToMarkdowns } from "../from-tests";

const input = fs.readFileSync(path.join(__dirname, "./input.txt"), "utf8");

test("it works", () => {
  const out = convertFileToMarkdowns(input);
  for (const f of out) {
    fs.writeFileSync(path.join(__dirname, f.fileName), f.content);
  }
});

test("preserves comments", () => {
  const inputFileContent = `
  test('a', async () => {
    const a = 1; // comment
  });
  `;
  // const sourceFile = ts.createSourceFile(
  //   "someFileName.tsx",
  //   inputFileContent,
  //   ts.ScriptTarget.Latest,
  //   /*setParentNodes*/ false,
  //   ts.ScriptKind.TSX
  // );
  // const printer = ts.createPrinter({
  //   newLine: ts.NewLineKind.LineFeed,
  //   removeComments: false,
  //   omitTrailingSemicolon: false,
  // });
  // const printed = printer.printFile(sourceFile);
  // expect(printed).toMatchInlineSnapshot(`
  //   "test(\\"a\\", async () => {
  //       const a = 1; // comment
  //   });
  //   "
  // `);
  const out = convertFileToMarkdowns(inputFileContent);
  expect(out).toMatchInlineSnapshot(`
    [
      {
        "content": "\`\`\`ts
    const a = 1; // comment
    \`\`\`",
        "fileName": "a",
      },
    ]
  `);
});
