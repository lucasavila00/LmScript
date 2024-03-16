import "./globals.css";

import "cal-sans";

import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import { createPortal } from "react-dom";
import { BlockEditor } from "./editor/BlockEditor";
import { useState, useEffect, useCallback } from "react";
import { Icon } from "./components/ui/Icon";
import { Surface } from "./components/ui/Surface";
import { ToolbarButton } from "./components/ui/Toolbar";

const useDarkmode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(
    () => setIsDarkMode((isDark) => !isDark),
    [],
  );
  const lightMode = useCallback(() => setIsDarkMode(false), []);
  const darkMode = useCallback(() => setIsDarkMode(true), []);

  return {
    isDarkMode,
    toggleDarkMode,
    lightMode,
    darkMode,
  };
};
export default function App() {
  const { isDarkMode, darkMode, lightMode } = useDarkmode();

  const DarkModeSwitcher = createPortal(
    <Surface className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1">
      <ToolbarButton onClick={lightMode} active={!isDarkMode}>
        <Icon name="Sun" />
      </ToolbarButton>
      <ToolbarButton onClick={darkMode} active={isDarkMode}>
        <Icon name="Moon" />
      </ToolbarButton>
    </Surface>,
    document.body,
  );

  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor />
    </>
  );
}
