import { assertIsNever } from "../../lib/utils";
import { MessageOfAuthor } from "./playMessages";

export type LmGenerationJson = {
  uuid: string;
  name: string;
};
export const getGenerations = (messages: MessageOfAuthor[]): LmGenerationJson[] => {
  return messages.flatMap((it) =>
    it.parts.flatMap((it) => {
      switch (it.tag) {
        case "lmGenerate": {
          return [
            {
              uuid: it.nodeAttrs.id,
              name: it.nodeAttrs.name,
            },
          ];
        }
        case "text": {
          return [];
        }
        default: {
          return assertIsNever(it);
        }
      }
    }),
  );
};
