/**
 * This module contains the backend for the Runpod serverless API.
 * @module
 */

import { delay } from "../utils.ts";
import {
  AbstractBackend,
  GenerationThread,
  OnCapture,
  TasksOutput,
} from "./abstract.ts";

type RunpodStreamResponse =
  | RunpodCompletedResponse
  | RunpodInQueueResponse
  | RunpodInProgressResponse;

type FinishedStreamMessage = {
  tag: "Finished";
  text: string;
  captured: Record<string, string>;
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
  #url: string;
  #apiToken: string;
  constructor(url: string, apiToken: string) {
    this.#url = url;
    this.#apiToken = apiToken;
  }

  async #fetchNoRetry<T>(
    url: string,
    body?: string,
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiToken}`,
      },
      method: "POST",
      body,
    });
    if (!response.ok) {
      console.error((await response.text()).slice(0, 500));
      throw new Error("HTTP error " + response.status);
    }
    const out = await response.json();
    return out;
  }

  async #fetch<T>(
    url: string,
    body?: string,
  ): Promise<T> {
    let lastError: unknown;
    for (let i = 1; i < 5; i++) {
      try {
        return await this.#fetchNoRetry(url, body);
      } catch (e) {
        lastError = e;
        await delay(1000 * i * i);
      }
    }
    throw new Error(`HTTP request failed: ${lastError}`);
  }

  async #monitorProgress(
    id: string,
    retries: number,
    onCapture: OnCapture,
  ): Promise<TasksOutput> {
    await delay(1000 * retries * retries);
    const out = await this.#fetch<RunpodStreamResponse>(
      this.#url + "/stream/" + id,
    );
    return this.#handleRunpodStreamResponse(out, retries + 1, onCapture);
  }
  #handleStream(stream: OutputItems[], onCapture: OnCapture) {
    for (const message of stream) {
      if (message.tag === "Capture") {
        onCapture(message.name, message.value);
      }
    }
  }
  #handleRunpodStreamResponse(
    out: RunpodStreamResponse,
    retries: number,
    onCapture: OnCapture,
  ): Promise<TasksOutput> {
    this.#handleStream((out.stream ?? []).map((it) => it.output), onCapture);
    switch (out.status) {
      case "COMPLETED": {
        const finished = out.stream.find((x) => x.output.tag === "Finished")
          ?.output;
        if (finished == null || finished.tag != "Finished") {
          throw new Error("INTERNAL ERROR: no finished tag");
        }
        return Promise.resolve({
          captured: finished.captured,
          text: finished.text,
        });
      }
      case "IN_QUEUE":
      case "IN_PROGRESS": {
        return this.#monitorProgress(out.id, retries, onCapture);
      }
      default: {
        throw new Error("Runpod error: " + JSON.stringify(out));
      }
    }
  }

  async executeJSON(
    data: GenerationThread,
    onCapture: OnCapture,
  ): Promise<TasksOutput> {
    const out = await this.#fetch<
      RunSyncResponse
    >(
      this.#url + "/runsync",
      JSON.stringify({
        input: {
          endpoint: "generate_thread",
          parameters: data,
        },
      }),
    );
    if (out?.status === "COMPLETED") {
      this.#handleStream(out.output, onCapture);
      const finished = out.output.find((x) => x.tag === "Finished");
      if (finished == null || finished.tag != "Finished") {
        throw new Error("INTERNAL ERROR: no finished tag");
      }
      return Promise.resolve({
        captured: finished.captured,
        text: finished.text,
      });
    }
    return this.#monitorProgress(out.id, 1, onCapture);
  }
}
