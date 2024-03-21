import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { avatarLabel, avatarFullLabel } from "../../../editor/lib/avatar";
import {
  LmEditorState,
  GenerationNodeAttrs,
  UiGenerationData,
} from "../../../editor/lib/types";
import { assertIsNever } from "../../../lib/utils";
import { JSONContent } from "@tiptap/react";
import { FC, createElement, useEffect, useState } from "react";

const levelMap: Record<
  number,
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined
> = {
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

type SpanLike =
  | { tag: "text"; text: string }
  | { tag: "hardBreak" }
  | {
      tag: "captured";
      text: string;
      capturedAs: string;
    }
  | { tag: "loading" };

type ParagraphLike =
  | {
      tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      text: SpanLike[];
    }
  | { tag: "hr" }
  | {
      tag: "list";
      ordered: boolean;
      listItems: Array<{
        content: SpanLike[];
      }>;
    };

type AuthorMsg = {
  author: string;
  parts: ParagraphLike[];
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
          });
          break;
        }
        case "variableSelect": {
          const variableUuid = content.attrs?.uuid;
          const fromVariables = editorState.variables.find(
            (v) => v.uuid === variableUuid,
          );
          if (fromVariables?.value == null) {
            throw new Error(`Variable not found: ${variableUuid}`);
          } else {
            addToLastParagraphLike({
              tag: "text",
              text: fromVariables.value,
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
            addToLastParagraphLike({
              tag: "captured",
              text: captured,
              capturedAs: nodeAttrs.name,
            });
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
          throw new Error(
            `Unexpected second level content type: ${content.type}`,
          );
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
    });
    handleSecondLevel(content.content ?? []);
  }

  function handleParagraph(content: JSONContent) {
    paragraphLikes.push({
      tag: "p",
      text: [],
    });
    handleSecondLevel(content.content ?? []);
  }
  function handleList(content: JSONContent, numbered: boolean) {
    paragraphLikes.push({
      tag: "list",
      ordered: numbered,
      listItems: [],
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
        throw new Error(
          `Unexpected list item content type: ${itemContent[0].type}`,
        );
      }
      handleSecondLevel(itemContent[0].content ?? []);
    }
  }
  function handleHorizontalRule(_content: JSONContent) {
    paragraphLikes.push({
      tag: "hr",
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
        throw new Error(
          `Unexpected content html top level type: ${content.type}`,
        );
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

const RenderSpanLike: FC<{ part: SpanLike }> = ({ part }) => {
  switch (part.tag) {
    case "text": {
      return <span>{part.text}</span>;
    }
    case "loading": {
      return <SpanLoading />;
    }
    case "captured": {
      return (
        <span title={part.capturedAs} className={GENERATED_CN}>
          {part.text}
        </span>
      );
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
  switch (part.tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
    case "p": {
      const chd = part.text.map((part, idx) => (
        <RenderSpanLike key={idx} part={part} />
      ));
      return createElement(part.tag, {}, chd);
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
        return <ol>{listItems}</ol>;
      }
      return <ul>{listItems}</ul>;
    }
    case "hr": {
      return (
        <div data-type="horizontalRule">
          <hr />
        </div>
      );
    }
    default: {
      return assertIsNever(part);
    }
  }
};

const RenderAuthorMessage: FC<{ msg: AuthorMsg; isFirst: boolean }> = ({
  msg,
  isFirst,
}) => {
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

export const HtmlPlay: FC<{
  uiGenerationData: UiGenerationData;
  editorState: Pick<LmEditorState, "doc" | "variables">;
  onRetry: () => void;
}> = ({ uiGenerationData, editorState, onRetry }) => {
  if (uiGenerationData.state == "error") {
    return (
      <>
        <div className="flex items-center justify-center flex-col mt-8 gap-2">
          <div className="text-lg font-medium">An Error Ocurred</div>
          <div className="text-sm text-muted-foreground max-w-xl text-center">
            {String(uiGenerationData.error)}
          </div>
          <Button className="mt-4" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </>
    );
  }

  const acc = getData(uiGenerationData, editorState);
  return (
    <div className="ProseMirror">
      {acc.map((msg, idx) => {
        return <RenderAuthorMessage isFirst={idx === 0} key={idx} msg={msg} />;
      })}
    </div>
  );
};
