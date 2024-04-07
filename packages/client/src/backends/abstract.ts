/**
 * This module contains types for the multiple backends.
 * @module
 */

import { Role } from "../chat-template";
import { SchemaData } from "../schema";

/**
 * Callback for capturing values from the AI model in real time.
 */
export type OnCapture = (args: { name: string; value: unknown }) => void;

/**
 * Notifies about the resource usage of the AI model.
 */
export type ReportUsage = (args: { promptTokens: number; completionTokens: number }) => void;

/**
 * Callbacks for the execution of the AI model.
 */
export type ExecutionCallbacks = {
  onCapture: OnCapture;
};

/**
 * Interface for fetching from a SGL server.
 */
export type AbstractBackend = {
  executeJSON: (data: GenerationThread, callbacks: ExecutionCallbacks) => Promise<ClientState>;
};

/**
 * Task that just adds text to the current state.
 */
export type AddTextTask = {
  tag: "AddTextTask";
  text: string;
};

/**
 * Task that generates text from the AI model.
 */
export type GenerateTask = {
  tag: "GenerateTask";
  name: string | undefined;
  stop: string[];
  max_tokens: number;
  regex: string | undefined;
};

/**
 * Task that selects a choice from a list.
 */
export type SelectTask = {
  tag: "SelectTask";
  name: string | undefined;
  choices: string[];
};

/**
 * Task that repeats previous captured text.
 */
export type RepeatTask = {
  tag: "RepeatTask";
  variable: string;
};

/**
 * Task that matches a variable to a list of tasks.
 */
export type MatchTask = {
  tag: "MatchTask";
  variable: string;
  choices: Record<string, Task[]>;
};

/**
 * Task that generates structured data from the AI model.
 */
export type XmlTask = {
  tag: "XmlTask";
  name: string;
  schemaKey: string | undefined;
  schema: SchemaData;
};

/**
 * Task that starts a role, and finishes the previous one.
 */
export type StartRoleTask = {
  tag: "StartRoleTask";
  role: Role;
};

/**
 * List of all possible tasks supported by the AbstractBackend.
 */
export type Task =
  | StartRoleTask
  | AddTextTask
  | GenerateTask
  | SelectTask
  | RepeatTask
  | MatchTask
  | XmlTask;

/**
 * Parameters for sampling from the AI model.
 */
export type FetcherSamplingParams = {
  temperature: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
};

/**
 * Thread for generating text from the AI model.
 */
export type GenerationThread = {
  sampling_params: FetcherSamplingParams;
  tasks: Task[];
  initial_state: ClientState;
};

/**
 * Output of the AbstractBackend executeJSON method.
 */
export type ClientState = {
  text: string;
  captured: Record<string, unknown>;
};
