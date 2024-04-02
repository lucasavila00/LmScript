import { InitClient } from "@lmscript/client";
import { s } from "@lmscript/client/schema";

const ProfileData = s.object({
  name: s.string(),
  email: s.string(),
  // type: s.union([s.literal("user"), s.literal("admin"), s.literal("super")]),
  // intersection: s.intersection([s.object({ a: s.string() }), s.object({ b: s.number() })]),
});

export default (client: InitClient) =>
  client
    .user((m) =>
      m
        .push("Write the profile data as JSON.")
        .push("\n")
        .push("The name is John Doe and the email is john@doe.com"),
    )
    .assistant((m) => m.push("```json\n").json("profile", ProfileData).push("\n```\n"));
