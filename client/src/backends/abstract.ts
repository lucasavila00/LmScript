/**
 * This module contains types for the multiple backends.
 * @module
 */

export type TasksOutput = { text: string; captured: Record<string, string> };

/**
 * Callback for capturing values from the AI model in real time.
 */
export type OnCapture = (args: { name: string; value: string }) => void;

export type ReportUsage = (args: { promptTokens: number; completionTokens: number }) => void;

export type ExecutionCallbacks = {
  onCapture: OnCapture;
};

/**
 * Interface for fetching from a SGL server.
 */
export type AbstractBackend = {
  executeJSON: (data: GenerationThread, callbacks: ExecutionCallbacks) => Promise<TasksOutput>;
};

export type AddTextTask = {
  tag: "AddTextTask";
  text: string;
};

export type GenerateTask = {
  tag: "GenerateTask";
  name: string | undefined;
  stop: string[];
  max_tokens: number;
  regex: string | undefined;
};

export type SelectTask = {
  tag: "SelectTask";
  name: string | undefined;
  choices: string[];
};
export type RepeatTask = {
  tag: "RepeatTask";
  variable: string;
};

export type MatchTask = {
  tag: "MatchTask";
  variable: string;
  choices: Record<string, Task[]>;
};

export type Task = AddTextTask | GenerateTask | SelectTask | RepeatTask | MatchTask;

export type FetcherSamplingParams = {
  temperature: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
};

export type GenerationThread = {
  sampling_params: FetcherSamplingParams;
  tasks: Task[];
  initial_state: ClientState;
};
export type ClientState = {
  text: string;
  captured: Record<string, string>;
};
