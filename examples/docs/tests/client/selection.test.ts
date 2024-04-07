import { test } from "vitest";
import { md } from "../../../../internal-packages/mdts/src";

test("client/selection", async () => {
  md`
    ---
    sidebar_position: 2
    ---

    # Selection

    TODO
  `;
});
