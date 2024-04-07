import { test } from "vitest";
import { md } from "mdts";

test("client/generation", async () => {
  md`
    ---
    sidebar_position: 1
    ---

    # Generation

    TODO
  `;
});
