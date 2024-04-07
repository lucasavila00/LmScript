import { test } from "vitest";
import { md } from "../../../../internal-packages/mdts/src";

test("client/generation", async () => {
  md`
    ---
    sidebar_position: 1
    ---

    # Generation

    TODO
  `;
});
