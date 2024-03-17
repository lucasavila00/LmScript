export const avatarLabel = (author: string) => {
  switch (author) {
    case "system":
      return "Sys";
    case "user":
      return "Usr";
    case "assistant":
      return "Ast";
    default:
      return "Unk";
  }
};
export const avatarFullLabel = (author: string) => {
  switch (author) {
    case "system":
      return "System";
    case "user":
      return "User";
    case "assistant":
      return "Assistant";
    default:
      return "Unknown";
  }
};
