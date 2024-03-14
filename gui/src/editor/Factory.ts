import { GenerateNodeData } from "./Context";
let unnamedCounter = 1;
const getUnnamedCount = () => unnamedCounter++;
const getUnnamed = () => "Unnamed " + getUnnamedCount();
export const newGenerate = (): GenerateNodeData => ({
  tag: "generate",
  name: getUnnamed(),
  stop: [],
  max_tokens: 128,
});
