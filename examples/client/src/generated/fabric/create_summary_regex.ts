import type { InitClient } from "@lmscript/client";
export default (
  client: InitClient,
  {
    input = "Felix of Burgundy (died 647 or 648) was a saint and the first bishop of the kingdom of the East Angles. He is widely credited as the man who introduced Christianity to the kingdom. Felix came from the Frankish kingdom of Burgundy, and may have been a priest at one of the monasteries in Francia founded by the Irish missionary Columbanus—Felix may have been Bishop of Châlons, before being forced to seek refuge elsewhere. Felix travelled from Burgundy to Canterbury before being sent by Archbishop Honorius of Canterbury to the kingdom of Sigeberht of East Anglia in about 630. Upon Felix's arrival in East Anglia, Sigeberht gave him a see at Dommoc, possibly in Suffolk, either at Walton, near Felixstowe, or at Dunwich. According to Bede, Felix helped Sigeberht to establish a school in his kingdom. Felix died on 8 March 647 or 648, having been bishop for 17 years. His relics were translated from Dommoc to Soham Abbey and then to the abbey at Ramsey. Several English churches are dedicated to him. ",
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
        .push(""),
    )
    .user((m) => m.push('Now generate the "main points".'))
    .assistant((m) =>
      m
        .push("## MAIN POINTS:\n\n")
        .gen("main_points", {
          maxTokens: 1024,
          stop: [],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)",
        })
        .push(""),
    )
    .user((m) => m.push('Now generate the "takeaways".'))
    .assistant((m) =>
      m
        .push("## TAKEAWAYS:\n\n")
        .gen("takeaways", {
          maxTokens: 512,
          stop: [],
          regex: "([0-9]+\\. [^\n]*\n)+([0-9]+\\. [^\n]*)",
        })
        .push(""),
    );
