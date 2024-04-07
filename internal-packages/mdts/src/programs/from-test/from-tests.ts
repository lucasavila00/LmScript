import * as ts from "typescript";
import dedent from "dedent";
import { AppFlue } from "../../dependencies";
import { writeFileAndParentFolder, getAllTestFilesOfFolder } from "../fs";
import { Variant, impl, matchExhaustive } from "@practical-fp/union-types";
import { FlueEither } from "flue-ts";

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
  omitTrailingSemicolon: false,
});

const printFile = (it: ts.SourceFile): string => printer.printFile(it);

const getFileNameFromTestArguments = (
  args: ts.NodeArray<ts.Expression>
): string => {
  const firstArg = args[0];
  if (firstArg == null) {
    throw new Error("First argument of test must be a string literal");
  }
  if (ts.isStringLiteral(firstArg)) {
    return firstArg.text;
  }
  throw new Error("First argument of test must be a string literal");
};
const getFunctionBody = (it: ts.Expression): ts.NodeArray<ts.Statement> => {
  if (ts.isArrowFunction(it)) {
    if (ts.isBlock(it.body)) {
      return it.body.statements;
    }
  }
  if (ts.isFunctionExpression(it)) {
    return it.body.statements;
  }
  throw new Error("Expected function expression");
};

const getStringFromSnapshotResult = (
  result: ts.Expression | undefined
): string => {
  if (result == null) {
    throw new Error("Expected result");
  }
  if (ts.isStringLiteral(result)) {
    return result.text;
  }
  if (ts.isNoSubstitutionTemplateLiteral(result)) {
    return result.text;
  }
  throw new Error("Expected string literal");
};

type StringifiedStatement =
  | Variant<"MarkdownSt", { content: string }>
  | Variant<"TypescriptSt", { statements: ts.Statement[] }>
  | Variant<"SnapshotSt", { result: string }>;

const { MarkdownSt, TypescriptSt, SnapshotSt } = impl<StringifiedStatement>();

const extractStringifiedStatements = (
  st: ts.Statement
): StringifiedStatement[] => {
  // check for tagged template expression with md tag
  if (
    ts.isExpressionStatement(st) &&
    ts.isTaggedTemplateExpression(st.expression) &&
    ts.isIdentifier(st.expression.tag) &&
    st.expression.tag.text === "md"
  ) {
    const template = st.expression.template;
    if (ts.isNoSubstitutionTemplateLiteral(template)) {
      return [
        MarkdownSt({
          content: template.text,
        }),
      ];
    } else {
      throw new Error("Expected no substitution template literal");
    }
  }

  // check for expect inline snapshot
  if (
    ts.isExpressionStatement(st) &&
    ts.isCallExpression(st.expression) &&
    ts.isPropertyAccessExpression(st.expression.expression) &&
    st.expression.expression.name.text === "toMatchInlineSnapshot"
  ) {
    const result = getStringFromSnapshotResult(st.expression.arguments[0]);
    const prop = st.expression.expression.expression;

    if (
      ts.isCallExpression(prop) &&
      ts.isIdentifier(prop.expression) &&
      prop.expression.text === "expect"
    ) {
      const expected = prop.arguments[0];
      return [
        TypescriptSt({
          statements: [
            ts.factory.createExpressionStatement(
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("console"),
                  ts.factory.createIdentifier("log")
                ),
                undefined,
                [expected]
              )
            ),
          ],
        }),
        SnapshotSt({
          result,
        }),
      ];
    } else {
      throw new Error("Expected expect call");
    }
  }

  return [
    TypescriptSt({
      statements: [st],
    }),
  ];
};

const mergeStringifiedStatements = (
  statements: StringifiedStatement[]
): StringifiedStatement[] => {
  const acc: StringifiedStatement[] = [];
  for (const st of statements) {
    if (st.tag === "TypescriptSt") {
      // check if last statement is ts
      const last = acc[acc.length - 1];
      if (last != null && last.tag === "TypescriptSt") {
        // merge
        acc[acc.length - 1] = TypescriptSt({
          statements: [...last.value.statements, ...st.value.statements],
        });
      } else {
        acc.push(st);
      }
    } else {
      acc.push(st);
    }
  }
  return acc;
};

const printStatement = (
  it: StringifiedStatement,
  sourceFile: ts.SourceFile
): string =>
  matchExhaustive(it, {
    MarkdownSt: (it) => dedent(it.content),
    TypescriptSt: (it) => {
      let printed = "";
      for (const st of it.statements) {
        const p = printFile(
          ts.factory.updateSourceFile(sourceFile, [st])
        ).trim();

        if (p.length > 0) {
          printed += p + "\n\n";
        }
      }

      printed = printed.trim();

      return `\`\`\`ts\n${printed}\n\`\`\``;
    },
    SnapshotSt: (it) => {
      const trimmed = dedent(it.result).trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        const withoutQuotes = trimmed.slice(1, -1);
        return `\`\`\`\n\`${withoutQuotes}\`\n\`\`\``;
      }
      let tag = "js";

      try {
        JSON.parse(it.result);
        tag = "json";
      } catch (e) {}
      return `\`\`\`${tag}\n${dedent(it.result)}\n\`\`\``;
    },
  });

const getMarkdownFromTestArguments = (
  sourceFile: ts.SourceFile,
  args: ts.NodeArray<ts.Expression>
): string =>
  FlueEither.right(args[1])
    .tap((it) => {
      if (it == null) {
        throw new Error("Second argument of test must be a markdown template");
      }
    })
    .try(getFunctionBody)
    .try((it) => it.flatMap(extractStringifiedStatements))
    .try(mergeStringifiedStatements)
    .try((it) => it.map((st) => printStatement(st, sourceFile)))
    .try((it) => it.join("\n\n").trim())
    .unwrap();

type MarkdownResult = {
  fileName: string;
  content: string;
};
export const convertFileToMarkdowns = (
  inputFileContent: string
): MarkdownResult[] => {
  const sourceFile = ts.createSourceFile(
    "someFileName.tsx",
    inputFileContent,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TSX
  );

  return sourceFile.statements.flatMap((st) => {
    if (
      ts.isExpressionStatement(st) &&
      ts.isCallExpression(st.expression) &&
      ts.isIdentifier(st.expression.expression) &&
      st.expression.expression.text === "test"
    ) {
      const fileName = getFileNameFromTestArguments(st.expression.arguments);
      const markdown = getMarkdownFromTestArguments(
        sourceFile,
        st.expression.arguments
      );

      return [
        {
          fileName,
          content: markdown,
        },
      ];
    }
    return [];
  });
};

export const convertFile = (
  inputPath: string,
  outputFolder: string
): AppFlue<void> =>
  AppFlue.try((d) => d.fs.readFile(inputPath, "utf8"))
    .try(convertFileToMarkdowns)
    .flatMap((output) =>
      AppFlue.all(
        output.map((it) =>
          writeFileAndParentFolder(
            outputFolder + "/" + it.fileName + ".md",
            it.content
          )
        )
      )
    )
    .try(() => void 0);

export const convertFolder = (
  inputPath: string,
  outputFolder: string
): AppFlue<void> =>
  getAllTestFilesOfFolder(inputPath)
    .flatMap((files) =>
      AppFlue.all(files.map((it) => convertFile(it, outputFolder)))
    )
    .try(() => void 0);
