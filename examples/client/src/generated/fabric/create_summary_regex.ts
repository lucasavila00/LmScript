import type { InitClient } from "@lmscript/client";
export default (
  client: InitClient,
  {
    input = 'A Turing machine is a mathematical model of computation describing an abstract machine[1] that manipulates symbols on a strip of tape according to a table of rules.[2] Despite the model\'s simplicity, it is capable of implementing any computer algorithm.[3]\n\nThe machine operates on an infinite[4] memory tape divided into discrete cells,[5] each of which can hold a single symbol drawn from a finite set of symbols called the alphabet of the machine. It has a "head" that, at any point in the machine\'s operation, is positioned over one of these cells, and a "state" selected from a finite set of states. At each step of its operation, the head reads the symbol in its cell. Then, based on the symbol and the machine\'s own present state, the machine writes a symbol into the same cell, and moves the head one step to the left or the right,[6] or halts the computation. The choice of which replacement symbol to write, which direction to move the head, and whether to halt is based on a finite table that specifies what to do for each combination of the current state and the symbol that is read. Like a real computer program, it is possible for a Turing machine to go into an infinite loop which will never halt.\n\nThe Turing machine was invented in 1936 by Alan Turing,[7][8] who called it an "a-machine" (automatic machine).[9] It was Turing\'s doctoral advisor, Alonzo Church, who later coined the term "Turing machine" in a review.[10] With this model, Turing was able to answer two questions in the negative:\n\n    Does a machine exist that can determine whether any arbitrary machine on its tape is "circular" (e.g., freezes, or fails to continue its computational task)?\n    Does a machine exist that can determine whether any arbitrary machine on its tape ever prints a given symbol?[11][12]\n\nThus by providing a mathematical description of a very simple device capable of arbitrary computations, he was able to prove properties of computation in general—and in particular, the uncomputability of the Entscheidungsproblem (\'decision problem\').[13]\n\nTuring machines proved the existence of fundamental limitations on the power of mechanical computation.[14] While they can express arbitrary computations, their minimalist design makes them too slow for computation in practice: real-world computers are based on different designs that, unlike Turing machines, use random-access memory.\n\nTuring completeness is the ability for a computational model or a system of instructions to simulate a Turing machine. A programming language that is Turing complete is theoretically capable of expressing all tasks accomplishable by computers; nearly all programming languages are Turing complete if the limitations of finite memory are ignored.',
  },
) =>
  client
    .user((m) =>
      m
        .push(
          "# IDENTITY and PURPOSE\n\nYou are an expert content summarizer. You take content in and output a Markdown formatted summary using the format below.\n\nTake a deep breath and think step by step about how to best accomplish this goal using the following steps.\n\n# OUTPUT SECTIONS\n\n- Combine all of your understanding of the content into a single, 20-word sentence in a section called ONE SENTENCE SUMMARY:.\n- Output the 10 most important points of the content as a list with no more than 15 words per point into a section called MAIN POINTS:.\n- Output a list of the 5 best takeaways from the content in a section called TAKEAWAYS:.\n\n# OUTPUT INSTRUCTIONS\n\n- Create the output using the formatting above.\n- You only output human readable Markdown.\n- Output numbered lists, not bullets.\n- Do not output warnings or notes—just the requested sections.\n- Do not repeat items in the output sections.\n- Do not start items with the same opening words.\n- Answer each block per message.\n\n# INPUT:\n\nINPUT: ",
        )
        .push(input)
        .push('\n\nNow, first generate the "One sentence summary".'),
    )
    .assistant((m) =>
      m
        .push("## ONE SENTENCE SUMMARY:\n\n")
        .gen("summary", { maxTokens: 256, stop: ["\n"] })
        .push("\n\n## MAIN POINTS:\n\n")
        .gen("main_points", {
          maxTokens: 512,
          stop: ["\n\n"],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)(\n\n)?",
        })
        .push("\n\n## TAKEAWAYS:\n\n")
        .gen("takeaways", {
          maxTokens: 512,
          stop: ["\n\n"],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)(\n\n)?",
        })
        .push(""),
    );
