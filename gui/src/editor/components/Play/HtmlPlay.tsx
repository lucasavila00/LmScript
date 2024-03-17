import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { avatarLabel, avatarFullLabel } from "../../../editor/lib/avatar";
import {
  EditorState,
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
  | {
      tag: "captured";
      text: string;
    }
  | { tag: "loading" };

type ParagraphLike = {
  tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: SpanLike[];
};

type AuthorMsg = {
  author: string;
  parts: ParagraphLike[];
};
const getDataThrowing = (
  uiGenerationData: UiGenerationData,
  editorState: Pick<EditorState, "doc" | "variables">,
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
    if (last != null) {
      last.text.push(it);
    } else {
      throw new Error("Expected last to be defined");
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
          const variableName = content.attrs?.name;
          const fromVariables = editorState.variables.find(
            (v) => v.name === variableName,
          );
          if (fromVariables?.value == null) {
            throw new Error(`Variable not found: ${variableName}`);
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
            });
          }
          break;
        }
        default: {
          throw new Error(`Unexpected content type: ${content.type}`);
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
      default: {
        throw new Error(`Unexpected content type: ${content.type}`);
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
  editorState: Pick<EditorState, "doc" | "variables">,
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
      return <span className={GENERATED_CN}>{part.text}</span>;
    }
    default: {
      return assertIsNever(part);
    }
  }
};

const RenderParagraphLike: FC<{ part: ParagraphLike }> = ({ part }) => {
  const chd = part.text.map((part, idx) => (
    <RenderSpanLike key={idx} part={part} />
  ));
  return createElement(part.tag, {}, chd);
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
  editorState: Pick<EditorState, "doc" | "variables">;
}> = ({ uiGenerationData, editorState }) => {
  const acc = getData(uiGenerationData, editorState);
  return (
    <div className="ProseMirror">
      {acc.map((msg, idx) => {
        return <RenderAuthorMessage isFirst={idx === 0} key={idx} msg={msg} />;
      })}
    </div>
  );
};
