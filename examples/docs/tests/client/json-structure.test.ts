import { test } from "vitest";
import { md } from "mdts";

test("client/structured", async () => {
  md`
    ---
    sidebar_position: 4
    ---

    # JSON (Structured)

    TODO
  `;
});
