import type { InitClient } from "@lmscript/client";
export default (client: InitClient, input: string) =>
  client
    .user((m) =>
      m
        .push(
          "# IDENTITY and PURPOSE\n\nYou are an expert content summarizer. You take content in and output a Markdown formatted summary using the format below.\n\nTake a deep breath and think step by step about how to best accomplish this goal using the following steps.\n\n# OUTPUT SECTIONS\n\n- Combine all of your understanding of the content into a single, 20-word sentence in a section called ONE SENTENCE SUMMARY:.\n- Output the 10 most important points of the content as a list with no more than 15 words per point into a section called MAIN POINTS:.\n- Output a list of the 5 best takeaways from the content in a section called TAKEAWAYS:.\n\n# OUTPUT INSTRUCTIONS\n\n- Create the output using the formatting above.\n- You only output human readable Markdown.\n- Output numbered lists, not bullets.\n- Do not output warnings or notes—just the requested sections.\n- Do not repeat items in the output sections.\n- Do not start items with the same opening words.\n\n# INPUT:\n\nINPUT: ",
        )
        .push(input)
        .push(""),
    )
    .assistant((m) =>
      m
        .push("## ONE SENTENCE SUMMARY:\n\n")
        .gen("summary", { maxTokens: 256, stop: ["\n"] })
        .push("\n\n## MAIN POINTS:\n\n")
        .gen("main_points", {
          maxTokens: 256,
          stop: [],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)",
        })
        .push("\n\n## TAKEAWAYS:\n\n")
        .gen("takeaways", {
          maxTokens: 256,
          stop: [],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)",
        })
        .push(""),
    );
