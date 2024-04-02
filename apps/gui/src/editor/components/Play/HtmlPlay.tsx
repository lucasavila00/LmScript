import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { avatarLabel, avatarFullLabel } from "../../../editor/lib/avatar";
import { LmEditorState, GenerationNodeAttrs, UiGenerationData } from "@lmscript/editor-tools/types";
import { assertIsNever } from "../../../lib/utils";
import { JSONContent } from "@tiptap/react";
import { FC, createElement, useEffect, useState } from "react";
import { Token, Tokens, lexer } from "marked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import React from "react";
import { CopyToClipboard } from "../../../components/copy-to-clipboard";

const levelMap: Record<number, "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
};
class LoadingSuspend {
  constructor(public arr: AuthorMsg[]) {}
}

type SpanText = { tag: "text"; text: string; capturedAs: string | undefined };
type SpanHardBreak = { tag: "hardBreak" };
type SpanLike = SpanText | SpanHardBreak | { tag: "loading" };

type ParagraphList = {
  tag: "list";
  ordered: boolean;
  listItems: Array<{
    content: SpanLike[];
  }>;
  capturedAs: string | undefined;
};
type ParagraphHr = { tag: "hr"; capturedAs: string | undefined };

type ParagraphHeadingOrP = {
  tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: SpanLike[];
  capturedAs: string | undefined;
};
type ParagraphLike = ParagraphHeadingOrP | ParagraphHr | ParagraphList;

type AuthorMsg = {
  author: string;
  parts: ParagraphLike[];
};

type ParsedGeneration =
  | SpanText
  | ParagraphList
  | SpanHardBreak
  | ParagraphHr
  | ParagraphHeadingOrP;

const handleParsedTokensSpanLike = (tokens: Token[], capturedAs: string | undefined): SpanText[] =>
  tokens.map((token) => ({ tag: "text", text: token.raw, capturedAs }));

const parseGeneration = (captured: string, capturedAs: string): ParsedGeneration[] => {
  let paragraphCount = 0;
  return lexer(captured).flatMap((parsed): ParsedGeneration[] => {
    switch (parsed.type) {
      case "paragraph": {
        paragraphCount++;
        if (paragraphCount == 1) {
          return handleParsedTokensSpanLike(parsed.tokens ?? [], capturedAs);
        }
        return [
          {
            tag: "p",
            text: handleParsedTokensSpanLike(parsed.tokens ?? [], undefined),
            capturedAs,
          },
        ];
      }
      case "list": {
        const items: Tokens.ListItem[] = parsed.items ?? [];
        return [
          {
            tag: "list",
            ordered: parsed.ordered,
            listItems: items.map((item) => ({
              content: handleParsedTokensSpanLike(item.tokens, undefined),
            })),
            capturedAs,
          },
        ];
      }
      case "heading": {
        return [
          {
            tag: levelMap[parsed.depth] ?? "h6",
            text: handleParsedTokensSpanLike(parsed.tokens ?? [], undefined),
            capturedAs,
          },
        ];
      }
      case "hr": {
        return [{ tag: "hr", capturedAs }];
      }
      case "space": {
        // treat \n or \n\n and so on as hardBreak
        if (parsed.raw.split("\n").every((it) => it === "")) {
          return [{ tag: "hardBreak" }];
        }

        return [{ tag: "text", text: parsed.raw, capturedAs }];
      }
      default: {
        return [{ tag: "text", text: parsed.raw, capturedAs }];
      }
    }
  });
};

const getDataThrowing = (
  uiGenerationData: UiGenerationData,
  editorState: Pick<LmEditorState, "doc" | "variables">,
) => {
  const authorMsgs: AuthorMsg[] = [];
  let paragraphLikes: ParagraphLike[] = [];
  const root = editorState.doc;
  if (root.type !== "doc") {
    throw new Error("Expected doc as root");
  }
  const first = root.content?.[0];
  if (first == null || first.type !== "authorSelect") {
    throw new Error("Expected authorSelect at first position");
  }

  let currentAuthor = first.attrs?.author;

  function handleAuthorSelect(content: JSONContent) {
    authorMsgs.push({
      author: currentAuthor,
      parts: paragraphLikes,
    });
    paragraphLikes = [];
    currentAuthor = content.attrs?.author;
  }

  function addToLastParagraphLike(it: SpanLike) {
    const last = paragraphLikes[paragraphLikes.length - 1];
    if (last == null) {
      throw new Error("Expected last to be defined");
    }
    switch (last.tag) {
      case "list": {
        const lastListItem = last.listItems[last.listItems.length - 1];
        if (lastListItem == null) {
          throw new Error("Expected lastListItem to be defined");
        }
        lastListItem.content.push(it);
        break;
      }
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "p": {
        last.text.push(it);
        break;
      }
      case "hr": {
        throw new Error("Unexpected adding text to hr");
      }
      default: {
        return assertIsNever(last);
      }
    }
  }

  function handleSecondLevel(arr: JSONContent[]) {
    return arr.map((content) => {
      switch (content.type) {
        case "text": {
          addToLastParagraphLike({
            tag: "text",
            text: content.text ?? "",
            capturedAs: undefined,
          });
          break;
        }
        case "variableSelect": {
          const variableUuid = content.attrs?.uuid;
          const fromVariables = editorState.variables.find((v) => v.uuid === variableUuid);
          if (fromVariables?.value == null) {
            throw new Error(`Variable not found: ${variableUuid}`);
          } else {
            addToLastParagraphLike({
              tag: "text",
              text: fromVariables.value,
              capturedAs: undefined,
            });
          }

          break;
        }
        case "lmGenerator": {
          const nodeAttrs = content.attrs as GenerationNodeAttrs;
          const captured = uiGenerationData.captures[nodeAttrs.id];
          if (captured == null) {
            addToLastParagraphLike({
              tag: "loading",
            });
            authorMsgs.push({
              author: currentAuthor,
              parts: paragraphLikes,
            });

            throw new LoadingSuspend(authorMsgs);
          } else {
            const parsedItems = parseGeneration(captured, nodeAttrs.name);
            for (const parsed of parsedItems) {
              switch (parsed.tag) {
                case "hardBreak":
                case "text": {
                  addToLastParagraphLike(parsed);
                  break;
                }
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                case "p":
                case "hr":
                case "list": {
                  paragraphLikes.push(parsed);
                  break;
                }
                default: {
                  assertIsNever(parsed);
                  break;
                }
              }
            }
          }
          break;
        }
        case "hardBreak": {
          addToLastParagraphLike({
            tag: "hardBreak",
          });
          break;
        }
        default: {
          throw new Error(`Unexpected second level content type: ${content.type}`);
        }
      }
    });
  }

  function handleHeading(content: JSONContent) {
    const level = Number(content.attrs?.level ?? 0);
    const tag = levelMap[level];
    if (tag == null) {
      throw new Error(`Unexpected level: ${level}`);
    }
    paragraphLikes.push({
      tag,
      text: [],
      capturedAs: undefined,
    });
    handleSecondLevel(content.content ?? []);
  }

  function handleParagraph(content: JSONContent) {
    paragraphLikes.push({
      tag: "p",
      text: [],
      capturedAs: undefined,
    });
    handleSecondLevel(content.content ?? []);
  }
  function handleList(content: JSONContent, numbered: boolean) {
    paragraphLikes.push({
      tag: "list",
      ordered: numbered,
      listItems: [],
      capturedAs: undefined,
    });
    const items = content.content ?? [];
    for (const item of items) {
      const last = paragraphLikes[paragraphLikes.length - 1];
      if (last.tag != "list") {
        throw new Error(`Unexpected list item type: ${last.tag}`);
      }
      last.listItems.push({
        content: [],
      });

      if (item.type !== "listItem") {
        throw new Error(`Unexpected list item type: ${item.type}`);
      }

      const itemContent = item.content ?? [];
      if (itemContent.length != 1 && itemContent[0].type != "paragraph") {
        throw new Error(`Unexpected list item content type: ${itemContent[0].type}`);
      }
      handleSecondLevel(itemContent[0].content ?? []);
    }
  }
  function handleHorizontalRule(_content: JSONContent) {
    paragraphLikes.push({
      tag: "hr",
      capturedAs: undefined,
    });
  }
  for (const content of (root.content ?? []).slice(1)) {
    switch (content.type) {
      case "authorSelect": {
        handleAuthorSelect(content);
        break;
      }
      case "heading": {
        handleHeading(content);
        break;
      }
      case "paragraph": {
        handleParagraph(content);
        break;
      }
      case "bulletList": {
        handleList(content, false);
        break;
      }
      case "orderedList": {
        handleList(content, true);
        break;
      }
      case "horizontalRule": {
        handleHorizontalRule(content);
        break;
      }
      default: {
        throw new Error(`Unexpected content html top level type: ${content.type}`);
      }
    }
  }

  authorMsgs.push({
    author: currentAuthor,
    parts: paragraphLikes,
  });

  return authorMsgs;
};

const getData = (
  uiGenerationData: UiGenerationData,
  editorState: Pick<LmEditorState, "doc" | "variables">,
): AuthorMsg[] => {
  try {
    return getDataThrowing(uiGenerationData, editorState);
  } catch (e) {
    if (e instanceof LoadingSuspend) {
      return e.arr;
    }
    throw e;
  }
};

const GENERATED_CN = `bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 p-1 rounded-md`;

const SpanLoading = () => {
  const [counter, setCounter] = useState(3);
  useEffect(() => {
    const id = setInterval(() => {
      setCounter((c) => (c + 1) % 4);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return <span className={GENERATED_CN}>Loading{".".repeat(counter)}</span>;
};

// TODO: remove removeStartingSpace when backends support token healing
const removeStartingSpace = (text: string) => {
  if (text.startsWith(" ")) {
    return text.slice(1);
  }
  return text;
};
const RenderSpanLike: FC<{ part: SpanLike }> = ({ part }) => {
  switch (part.tag) {
    case "text": {
      const className = part.capturedAs == null ? undefined : GENERATED_CN;
      const title = part.capturedAs == null ? undefined : part.capturedAs;

      return (
        <span className={className} title={title}>
          {part.capturedAs == null ? part.text : removeStartingSpace(part.text)}
        </span>
      );
    }
    case "loading": {
      return <SpanLoading />;
    }
    case "hardBreak": {
      return <br />;
    }
    default: {
      return assertIsNever(part);
    }
  }
};

const RenderParagraphLike: FC<{ part: ParagraphLike }> = ({ part }) => {
  const className = part.capturedAs == null ? undefined : GENERATED_CN;
  const title = part.capturedAs == null ? undefined : part.capturedAs;
  switch (part.tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
    case "p": {
      const chd = part.text.map((part, idx) => <RenderSpanLike key={idx} part={part} />);
      return createElement(part.tag, { title, className }, chd);
    }
    case "list": {
      const listItems = part.listItems.map((parts, idx) => {
        return (
          <li key={idx}>
            <p>
              {parts.content.map((part, idx2) => (
                <RenderSpanLike part={part} key={idx2} />
              ))}
            </p>
          </li>
        );
      });
      if (part.ordered) {
        return (
          <ol title={title} className={className}>
            {listItems}
          </ol>
        );
      }
      return (
        <ul title={title} className={className}>
          {listItems}
        </ul>
      );
    }
    case "hr": {
      return (
        <div title={title} className={className} data-type="horizontalRule">
          <hr />
        </div>
      );
    }
    default: {
      return assertIsNever(part);
    }
  }
};

const RenderAuthorMessage: FC<{ msg: AuthorMsg; isFirst: boolean }> = ({ msg, isFirst }) => {
  return (
    <div>
      <div
        style={{
          marginBottom: "3rem",
          marginTop: isFirst ? 0 : "3rem",
        }}
        className="select-none flex gap-2 items-center justify-center"
      >
        <Avatar>
          <AvatarFallback>{avatarLabel(msg.author)}</AvatarFallback>
        </Avatar>
        <div>
          <span>{avatarFullLabel(msg.author)}</span>
        </div>
      </div>
      <div>
        {msg.parts.map((part, idx) => (
          <RenderParagraphLike key={idx} part={part} />
        ))}
      </div>
    </div>
  );
};

const HtmlPlayNoErrorInState: FC<{
  uiGenerationData: UiGenerationData;
  editorState: Pick<LmEditorState, "doc" | "variables">;
}> = ({ uiGenerationData, editorState }) => {
  const acc = getData(uiGenerationData, editorState);
  const jsonText = JSON.stringify({ captures: uiGenerationData.captures }, null, 2);
  return (
    <Tabs defaultValue="rich">
      <div className="p-2 sticky top-0 z-10 bg-white dark:bg-black">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rich">Rich Text</TabsTrigger>
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="rich">
        <div className="ProseMirror">
          {acc.map((msg, idx) => {
            return <RenderAuthorMessage isFirst={idx === 0} key={idx} msg={msg} />;
          })}
        </div>
      </TabsContent>
      <TabsContent value="raw">
        {uiGenerationData.state == "loading" || uiGenerationData.state === "initialized" ? (
          <pre className="whitespace-pre-wrap p-4 max-w-2xl mx-auto">
            <>Loading...</>
          </pre>
        ) : (
          <>
            <div className="flex w-full justify-center">
              <CopyToClipboard className="mx-auto" text={uiGenerationData.finalText ?? ""} />
            </div>
            <pre className="whitespace-pre-wrap p-4 max-w-2xl mx-auto">
              {uiGenerationData.finalText ?? ""}
            </pre>
          </>
        )}
      </TabsContent>
      <TabsContent value="json">
        <div className="flex w-full justify-center">
          <CopyToClipboard text={jsonText} />
        </div>
        <div className="p-4">
          {uiGenerationData.state == "loading" || uiGenerationData.state === "initialized" ? (
            <>Loading...</>
          ) : (
            <></>
          )}
          <pre className="whitespace-pre-wrap">{jsonText}</pre>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const ErrorRenderer: FC<{
  error: unknown;
  onRetry: () => void;
  onOpenBackendConfig: () => void;
}> = ({ error, onRetry, onOpenBackendConfig }) => {
  return (
    <>
      <div className="flex items-center justify-center flex-col mt-12 gap-2">
        <div className="text-lg font-medium">An Error Ocurred</div>
        <div className="text-sm text-muted-foreground max-w-xl text-center">{String(error)}</div>
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>

        <div className="text-sm text-muted-foreground max-w-xl text-center mt-8">
          If the error persists, please check the backend configuration.
        </div>
        <Button className="mt-4" onClick={onOpenBackendConfig}>
          Open Backend Config
        </Button>
      </div>
    </>
  );
};
type ErrorBoundaryProps = {
  children: React.ReactNode;
  onRetry: () => void;
  onOpenBackendConfig: () => void;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { theError: null | unknown }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { theError: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { theError: error };
  }

  render() {
    if (this.state.theError != null) {
      return (
        <ErrorRenderer
          error={this.state.theError}
          onRetry={this.props.onRetry}
          onOpenBackendConfig={this.props.onOpenBackendConfig}
        />
      );
    }

    return this.props.children;
  }
}
export const HtmlPlay: FC<{
  uiGenerationData: UiGenerationData;
  editorState: Pick<LmEditorState, "doc" | "variables">;
  onRetry: () => void;
  onOpenBackendConfig: () => void;
}> = ({ onOpenBackendConfig, uiGenerationData, editorState, onRetry }) => {
  if (uiGenerationData.state == "error") {
    return (
      <ErrorRenderer
        error={uiGenerationData.error}
        onRetry={onRetry}
        onOpenBackendConfig={onOpenBackendConfig}
      />
    );
  }

  return (
    <ErrorBoundary onRetry={onRetry} onOpenBackendConfig={onOpenBackendConfig}>
      <HtmlPlayNoErrorInState uiGenerationData={uiGenerationData} editorState={editorState} />
    </ErrorBoundary>
  );
};
