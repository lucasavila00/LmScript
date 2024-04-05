import { InitClient, LmScript } from "@lmscript/client";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { createInterface } from "node:readline";

class InfiniteChat {
  readonly #client: InitClient;
  #ai: InitClient;
  constructor(client: InitClient) {
    this.#client = client;
    this.#ai = this.#client;
  }

  async #summarize(ai: InitClient) {
    const {
      captured: { summary },
    } = await ai
      .user((c) => c.push("Summarize the conversation."))
      .assistant((c) =>
        c.gen("summary", {
          maxTokens: 512,
        }),
      )
      .run();
    console.log(`[DEBUG SUMMARY]: ${summary.trim()}`);
    return summary.trim();
  }

  async #setHistory(history: string, ai: InitClient) {
    if (history.length > 1000) {
      const summary = await this.#summarize(ai);
      this.#ai = this.#client.system((t) =>
        t.push(
          `You are participating of a conversation which was summarized by the AI Model as "${summary}".\n Continue the conversation.`,
        ),
      );
    } else {
      this.#ai = ai;
    }
  }

  async loop() {
    const msg = await new Promise<string | null>((rs) => {
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      return readline.question("User:", (msg) => {
        rs(msg);
        readline.close();
      });
    });

    if (msg == null) {
      return;
    }

    const {
      captured: { response },
      rawText: history,
      state: ai,
    } = await this.#ai
      .user((t) => t.push(msg))
      .assistant((t) =>
        t.gen("response", {
          maxTokens: 512,
        }),
      )
      .run();
    console.log(`Assistant: ${response.trim()}`);
    await this.#setHistory(history, ai);
    await this.loop();
  }
}

const main = async () => {
  const backend = new SGLangBackend({
    url: `http://localhost:30004`,
    template: "mistral",
  });
  const client = new LmScript(backend, {
    temperature: 0.1,
  });
  const chat = new InfiniteChat(client);
  await chat.loop();
};

main();
