import { test } from "vitest";
import { md } from "../../../../internal-packages/mdts/src";

test("client/structured", async () => {
  md`
    ---
    sidebar_position: 4
    ---

    # JSON (Structured)

    TODO
  `;
});
