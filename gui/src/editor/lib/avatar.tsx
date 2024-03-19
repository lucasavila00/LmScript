import { ReactNode } from "react";
import { BotIcon, SparkleIcon, UserIcon } from "lucide-react";

const AVATAR_CN = "aspect-square h-full w-full m-2";
export const avatarLabel = (author: string): ReactNode => {
  switch (author) {
    case "system":
      return <SparkleIcon className={AVATAR_CN} />;
    case "user":
      return <UserIcon className={AVATAR_CN} />;
    case "assistant":
      return <BotIcon className={AVATAR_CN} />;
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
