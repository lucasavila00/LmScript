import { FC } from "react";
import { GenerationInput } from "../lib/types";
import { UiGenerationData, generateAsyncAtom } from "../lib/generation-atom";
import { useRecoilValueLoadable } from "recoil";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assertIsNever } from "../lib/utils";
import useDimensions from "@/lib/use-element-dimensions";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import CodeMirror, { EditorView, Decoration, StateEffect, StateField } from "@uiw/react-codemirror";

type GetMarkdownResult = {
  text: string;
  generationRanges: [number, number][];
};

class CaptureNotFoundError {
  constructor(public accumulator: GetMarkdownResult) {}
}

const getMarkdownContentThrowing = (
  input: GenerationInput,
  generationData: UiGenerationData,
): GetMarkdownResult => {
  const state: GetMarkdownResult = {
    text: "",
    generationRanges: [],
  };

  const handleCapture = (uuid: string) => {
    const start = state.text.length;
    const capture = generationData.captures[uuid];
    if (capture == null) {
      throw new CaptureNotFoundError(state);
    }
    state.text += capture;
    state.generationRanges.push([start, state.text.length]);
  };

  for (const block of input.parsedMd) {
    switch (block.tag) {
      case "heading": {
        state.text += "#".repeat(block.level);
        handleCapture(block.uuid);
        state.text += "\n\n";
        break;
      }
      case "list":
      case "paragraph": {
        handleCapture(block.uuid);
        break;
      }
      case "error": {
        state.text += block.original;
        break;
      }
      default: {
        return assertIsNever(block);
      }
    }
  }
  return state;
};
const getMarkdownContent = (
  input: GenerationInput,
  generationData: UiGenerationData,
): GetMarkdownResult => {
  try {
    return getMarkdownContentThrowing(input, generationData);
  } catch (e) {
    if (e instanceof CaptureNotFoundError) {
      return e.accumulator;
    }
    throw e;
  }
};

const setHighlights = StateEffect.define<[number, number]>();
const highlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = value.map(tr.changes);

    for (const e of tr.effects) {
      if (e.is(setHighlights)) {
        const [from, to] = e.value;
        const mark = Decoration.mark({
          attributes: { class: "bg-emerald-100" },
        }).range(from, to);

        value = value.update({ add: [mark] });
      }
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const HighlightedOutput: FC<{
  markdownContent: string;
  generationRanges: [number, number][];
  height: number;
  width: number;
}> = ({ markdownContent, generationRanges, height, width }) => {
  return (
    <CodeMirror
      ref={(r) => {
        setTimeout(() => {
          const editorLength = r?.view?.state.doc.length;
          if (editorLength == null || editorLength == 0) {
            return;
          }
          const filtered = generationRanges.filter(([_start, end]) => end <= editorLength);
          const dispatch = () => {
            r?.view?.dispatch({
              effects: filtered.map((range) => setHighlights.of(range)),
            });
          };
          dispatch();
        }, 0);
      }}
      placeholder={"Type your markdown here."}
      value={markdownContent}
      height={String(height) + "px"}
      width={String(width) + "px"}
      extensions={[markdown({ base: markdownLanguage }), EditorView.lineWrapping, highlightField]}
      readOnly={true}
    />
  );
};

const GeneratorInProgress: FC<{ input: GenerationInput; generationData: UiGenerationData }> = ({
  input,
  generationData,
}) => {
  const [{ height, width }, wrapperRef] = useDimensions();
  const { text: markdownContent, generationRanges } = getMarkdownContent(input, generationData);

  return (
    <Tabs defaultValue="markdown" className="w-full mt-2 overflow-hidden flex flex-col h-full">
      <TabsList className="w-full">
        <TabsTrigger value="markdown" className="w-1/2">
          Output
        </TabsTrigger>
        <TabsTrigger value="raw" className="w-1/2">
          Raw Conversation
        </TabsTrigger>
      </TabsList>
      <TabsContent value="markdown" className="grow relative" ref={wrapperRef}>
        <div className="absolute top-0 left-0">
          <HighlightedOutput
            markdownContent={markdownContent}
            generationRanges={generationRanges}
            height={height}
            width={width}
          />
        </div>
      </TabsContent>
      <TabsContent value="raw" className="overflow-auto">
        {generationData.finalText == null ? (
          <>Loading</>
        ) : (
          <pre className="whitespace-pre-wrap">{generationData.finalText}</pre>
        )}
      </TabsContent>
    </Tabs>
  );
};

export const Generator: FC<{ input: GenerationInput }> = ({ input }) => {
  const data = useRecoilValueLoadable(
    generateAsyncAtom({
      input,
      cacheBuster: 0,
    }),
  );

  if (data.state === "hasValue") {
    return <GeneratorInProgress input={input} generationData={data.contents} />;
  }

  if (data.state === "hasError") {
    return <div>Error: {data.contents.message}</div>;
  }
  // should never happen, we use an effect that sets loading and error on another data structure
  return <></>;
};
