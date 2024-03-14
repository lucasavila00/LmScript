import {
  BlockNoteSchema,
  PartialBlock,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { Generate } from "./Generate";

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    generate: Generate,
  },
});
export type BSchema = (typeof schema)["blockSchema"];
export type ISchema = (typeof schema)["inlineContentSchema"];
export type SSchema = (typeof schema)["styleSchema"];

export type TypedBlock = PartialBlock<BSchema, ISchema, SSchema>;
