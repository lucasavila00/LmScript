import { FC } from "react";
import { Button } from "./ui/button";

export const CopyToClipboard: FC<{ text: string; className?: string }> = ({ text, className }) => {
  return (
    <Button className={className} onClick={() => navigator.clipboard.writeText(text)}>
      Copy to Clipboard
    </Button>
  );
};
