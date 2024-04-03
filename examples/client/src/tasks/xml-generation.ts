import { InitClient } from "@lmscript/client";
import { s } from "@lmscript/client/schema";
// import { s } from "@lmscript/client/schema";

// export default (client: InitClient) =>
//   client
//     .user((m) =>
//       m
//         .push("Write the profile data as XML.")
//         .push("\n")
//         .push(
//           `Use the following format:
// <profile>
// <name type="string">The name</name>
// <email type="string">email@abc.com</email>
// <age type="number">55</age>
// </profile>`,
//         ),
//     )
//     .assistant(
//       (m) =>
//         m
//           // .push("```xml\n")
//           .push("<profile>")
//           .push("\n")
//           .push('<name type="string">')
//           .gen("name", { maxTokens: 32, stop: "</" })
//           .push("</name>")
//           .push("\n")
//           .push('<email type="string">')
//           .gen("email", { maxTokens: 32, stop: "</" })
//           .push("</email>")
//           .push("\n")
//           .push('<age type="number">')
//           .gen("age", { maxTokens: 32, stop: "</" })
//           .push("</age>")
//           .push("\n")
//           .push("</profile>"),
//       // .push("\n```\n"),
//     );

const schema = s.object("profile", {
  name: s.string(),
  email: s.string(),
  interactions: s.object("interactions", {
    likes: s.number(),
  }),
  age: s.number(),
  online: s.boolean(),
  friends: s.array(s.string()),
  access: s.discriminatedUnion([
    s.object("admin", {
      level: s.number(),
    }),
    s.object("user", {
      role: s.string(),
    }),
  ]),
});

export default (client: InitClient) =>
  client
    .user((m) => m.push("Write the profile data as XML.").push("\n"))
    .assistant((m) => m.xml("profile", schema));
