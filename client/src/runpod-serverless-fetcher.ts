import { GenerationThread, SglFetcher, TasksOutput } from "./sgl-fetcher.ts";

export class RunpodFetcher implements SglFetcher {
  #url: string;
  #apiToken: string;
  constructor(url: string, apiToken: string) {
    this.#url = url;
    this.#apiToken = apiToken;
  }
  #monitorProgress<T>(_id: string): Promise<T> {
    throw new Error("IN_PROGRESS Not implemented");
  }
  async runThread(data: GenerationThread): Promise<TasksOutput> {
    // console.log(`[${new Date().toISOString()}] Sending request to Runpod`);
    const response = await fetch(this.#url + "/runsync", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.#apiToken}`,
      },
      method: "POST",
      body: JSON.stringify({
        input: {
          endpoint: "generate_thread",
          parameters: data,
        },
      }),
    });
    if (!response.ok) {
      console.error((await response.text()).slice(0, 500));
      throw new Error("HTTP error " + response.status);
    }

    const out = await response.json();
    if (out.status == "COMPLETED") {
      return out.output;
    }
    if (out.status == "IN_PROGRESS") {
      console.log(out);
      return this.#monitorProgress(out.id);
    }
    if (out.status == "IN_QUEUE") {
      console.log(out);
      return this.#monitorProgress(out.id);
    }
    throw new Error("Runpod error: " + JSON.stringify(out));
  }
}
