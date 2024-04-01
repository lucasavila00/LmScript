import type { InitClient } from "@lmscript/client";
export default (client: InitClient) => client.system((m) => m.push(""));
