/**
 * This module contains the backend for the Runpod serverless API.
 * @module
 */

import { delay, NOOP } from "../utils.ts";
import {
  defaultPostJsonFetcher,
  ExecutionCallbacks,
  PostJsonFetcher,
  ReportUsage,
} from "./abstract.ts";
import { AbstractBackend, GenerationThread, TasksOutput } from "./abstract.ts";

type RunpodStreamResponse =
  | RunpodCompletedResponse
  | RunpodInQueueResponse
  | RunpodInProgressResponse;

type FinishedStreamMessage = {
  tag: "Finished";
  text: string;
  captured: Record<string, string>;
  completion_tokens: number;
  prompt_tokens: number;
};

type CaptureStreamMessage = {
  tag: "Capture";
  name: string;
  value: string;
};

type OutputItems = CaptureStreamMessage | FinishedStreamMessage;

type OutputStream = Array<
  {
    output: CaptureStreamMessage;
  } | {
    output: FinishedStreamMessage;
  }
>;
type RunpodCompletedResponse = {
  status: "COMPLETED";
  output: TasksOutput;
  id: string;
  stream: OutputStream;
};

type RunpodInQueueResponse = {
  status: "IN_QUEUE";
  id: string;
  stream?: OutputStream;
};

type RunpodInProgressResponse = {
  status: "IN_PROGRESS";
  id: string;
  stream?: OutputStream;
};
type RunSyncResponse = {
  id: string;
  status: "string";
} | {
  status: "COMPLETED";
  output: OutputItems[];
};

/**
 * Backend for the Runpod serverless API.
 */
export class RunpodServerlessBackend implements AbstractBackend {
  readonly #url: string;
  readonly #apiToken: string;
  readonly #reportUsage: ReportUsage;
  readonly #fetcher: PostJsonFetcher;
  constructor(
    url: string,
    apiToken: string,
    options?: {
      reportUsage: ReportUsage;
      fetcher?: PostJsonFetcher;
    },
  ) {
    this.#url = url;
    this.#apiToken = apiToken;
    this.#reportUsage = options?.reportUsage ?? NOOP;
    this.#fetcher = options?.fetcher ?? defaultPostJsonFetcher;
  }

  async #fetch<T>(
    url: string,
    body?: object,
  ): Promise<T> {
    let lastError: unknown = null;
    for (let i = 1; i < 5; i++) {
      try {
        if (lastError != null) {
          await delay(1000 * i * i);
        }
        return await this.#fetcher(url, {
          "Authorization": "Bearer " + this.#apiToken,
        }, body);
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }

  async #monitorProgress(
    id: string,
    retries: number,
    callbacks: ExecutionCallbacks,
  ): Promise<TasksOutput> {
    await delay(1000 * retries * retries);
    const out = await this.#fetch<RunpodStreamResponse>(
      this.#url + "/stream/" + id,
    );
    return this.#handleRunpodStreamResponse(out, retries + 1, callbacks);
  }
  #handleStream(stream: OutputItems[], callbacks: ExecutionCallbacks) {
    for (const message of stream) {
      if (message.tag === "Capture") {
        callbacks.onCapture({ name: message.name, value: message.value });
      }
    }
  }
  #handleRunpodStreamResponse(
    out: RunpodStreamResponse,
    retries: number,
    callbacks: ExecutionCallbacks,
  ): Promise<TasksOutput> {
    this.#handleStream((out.stream ?? []).map((it) => it.output), callbacks);
    switch (out.status) {
      case "COMPLETED": {
        const finished = out.stream.find((x) => x.output.tag === "Finished")
          ?.output;
        if (finished == null || finished.tag != "Finished") {
          throw new Error("INTERNAL ERROR: no finished tag");
        }
        this.#reportUsage({
          promptTokens: finished.prompt_tokens,
          completionTokens: finished.completion_tokens,
        });
        return Promise.resolve({
          captured: finished.captured,
          text: finished.text,
        });
      }
      case "IN_QUEUE":
      case "IN_PROGRESS": {
        return this.#monitorProgress(out.id, retries, callbacks);
      }
      default: {
        throw new Error("Runpod error: " + JSON.stringify(out));
      }
    }
  }

  async executeJSON(
    data: GenerationThread,
    callbacks: ExecutionCallbacks,
  ): Promise<TasksOutput> {
    const out = await this.#fetch<
      RunSyncResponse
    >(
      this.#url + "/runsync",
      {
        input: {
          endpoint: "generate_thread",
          parameters: data,
        },
      },
    );
    if (out?.status === "COMPLETED") {
      this.#handleStream(out.output, callbacks);
      const finished = out.output.find((x) => x.tag === "Finished");
      if (finished == null || finished.tag != "Finished") {
        throw new Error("INTERNAL ERROR: no finished tag");
      }
      this.#reportUsage({
        promptTokens: finished.prompt_tokens,
        completionTokens: finished.completion_tokens,
      });
      return Promise.resolve({
        captured: finished.captured,
        text: finished.text,
      });
    }
    return this.#monitorProgress(out.id, 1, callbacks);
  }
}
