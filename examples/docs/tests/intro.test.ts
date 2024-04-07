import { test, expect } from "vitest";
import { md } from "mdts";

test("intro", async () => {
  md`
    ---
    sidebar_position: 1
    ---

    # Tutorial Intro

    Let's discover **Docusaurus in less than 5 minutes**.

    ## Getting Started

    Get started by **creating a new site**.

    Or **try Docusaurus immediately** with **[docusaurus.new](https://docusaurus.new)**.
  `;

  expect(1).toMatchInlineSnapshot(`1`);
});
