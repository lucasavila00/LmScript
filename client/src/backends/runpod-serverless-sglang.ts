/**
 * This module contains the backend for the Runpod serverless API.
 * @module
 */

import { delay, NOOP } from "../utils.ts";
import { ExecutionCallbacks, ReportUsage } from "./abstract.ts";
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
  | {
      output: CaptureStreamMessage;
    }
  | {
      output: FinishedStreamMessage;
    }
>;
type RunpodCompletedResponse = {
  status: "COMPLETED";
  output: TasksOutput;
  stream: OutputStream;
};

type RunpodInQueueResponse = {
  status: "IN_QUEUE";
  stream?: OutputStream;
};

type RunpodInProgressResponse = {
  status: "IN_PROGRESS";
  stream?: OutputStream;
};
type RunSyncResponse =
  | {
      id: string;
      status: "string";
    }
  | {
      status: "COMPLETED";
      output: OutputItems[];
    };

class RunpodServerlessSingleExecutor {
  #url: string;
  #apiToken: string;
  #reportUsage: ReportUsage;
  #callbacks: ExecutionCallbacks;
  #stream: OutputItems[] = [];

  constructor(
    url: string,
    apiToken: string,
    callbacks: { reportUsage: ReportUsage } & ExecutionCallbacks,
  ) {
    this.#url = url;
    this.#apiToken = apiToken;
    this.#reportUsage = callbacks.reportUsage;
    this.#callbacks = callbacks;
  }

  async #fetch<T>(url: string, body?: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiToken}`,
      },
      method: "POST",
      body,
    });
    if (!response.ok) {
      console.log("request failed", url, body);
      console.error((await response.text()).slice(0, 500));
      throw new Error("HTTP error " + response.status);
    }
    const out = await response.json();
    return out;
  }

  async #monitorProgress(id: string, retries: number): Promise<TasksOutput> {
    await delay(1000 * retries * retries);
    const out = await this.#fetch<RunpodStreamResponse>(this.#url + "/stream/" + id);
    return this.#handleRunpodStreamResponse(id, out, retries + 1);
  }
  #handleStream(stream: OutputItems[]) {
    this.#stream.push(...stream);
    for (const message of stream) {
      if (message.tag === "Capture") {
        this.#callbacks.onCapture({ name: message.name, value: message.value });
      }
    }
  }
  #handleRunpodStreamResponse(
    id: string,
    out: RunpodStreamResponse,
    retries: number,
  ): Promise<TasksOutput> {
    this.#handleStream((out.stream ?? []).map((it) => it.output));
    switch (out.status) {
      case "COMPLETED": {
        const finished = this.#stream.find((x) => x.tag === "Finished");

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
        return this.#monitorProgress(id, retries);
      }
      default: {
        throw new Error("Runpod error: " + JSON.stringify(out));
      }
    }
  }

  async executeJSON(data: GenerationThread): Promise<TasksOutput> {
    const out = await this.#fetch<RunSyncResponse>(
      this.#url + "/run",
      JSON.stringify({
        input: {
          endpoint: "generate_thread",
          parameters: data,
        },
      }),
    );
    if (out?.status === "COMPLETED") {
      this.#handleStream(out.output);
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
    return this.#monitorProgress(out.id, 1);
  }
}

/**
 * Backend for the Runpod serverless API.
 */
export class RunpodServerlessBackend implements AbstractBackend {
  #url: string;
  #apiToken: string;
  #reportUsage: ReportUsage;
  constructor(url: string, apiToken: string, callbacks?: { reportUsage: ReportUsage }) {
    this.#url = url;
    this.#apiToken = apiToken;
    this.#reportUsage = callbacks?.reportUsage ?? NOOP;
  }

  async executeJSON(data: GenerationThread, callbacks: ExecutionCallbacks): Promise<TasksOutput> {
    const executor = new RunpodServerlessSingleExecutor(this.#url, this.#apiToken, {
      ...callbacks,
      reportUsage: this.#reportUsage,
    });

    let lastError: unknown = null;
    for (let i = 1; i < 5; i++) {
      try {
        if (lastError != null) {
          await delay(1000 * i * i);
        }
        return await executor.executeJSON(data);
      } catch (e) {
        lastError = e;
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }
}
