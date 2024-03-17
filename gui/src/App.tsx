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
import { useDarkmode } from "./lib/use-dark-mode";
import { RenderDarkModeSwitcher } from "./components/dark-mode";

export default function App() {
  const darkModeHook = useDarkmode();

  const DarkModeSwitcher = createPortal(
    <RenderDarkModeSwitcher hook={darkModeHook} />,
    document.body,
  );

  return (
    <>
      {DarkModeSwitcher}
      <BlockEditor />
    </>
  );
}
