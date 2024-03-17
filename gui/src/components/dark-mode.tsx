import { FC } from "react";
import { Surface } from "./ui/Surface";
import { ToolbarButton } from "./ui/Toolbar";
import { Icon } from "./ui/Icon";
import { useDarkmode } from "../lib/use-dark-mode";

export const RenderDarkModeSwitcher: FC<{
  hook: ReturnType<typeof useDarkmode>;
}> = ({ hook }) => {
  const { isDarkMode, darkMode, lightMode } = hook;
  return (
    <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
      <ToolbarButton onClick={lightMode} active={!isDarkMode}>
        <Icon name="Sun" />
      </ToolbarButton>
      <ToolbarButton onClick={darkMode} active={isDarkMode}>
        <Icon name="Moon" />
      </ToolbarButton>
    </Surface>
  );
};
