import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RecoilRoot } from "recoil";
import { GetBackendInstance, AbstractBackend } from "gui/src/lib/get-lmscript-backend";
import { OnCapture } from "@lmscript/client/backends/abstract";

let onCaptureListeners: OnCapture[] = [];

window.capture.onCapture((data) => {
  onCaptureListeners.forEach((listener) => listener(data));
});
const GetBackendInstanceElectron: GetBackendInstance = (backendConfig) => {
  const backend: AbstractBackend = {
    executeJSON: async (data, callbacks) => {
      onCaptureListeners.push(callbacks.onCapture);
      const out = await window.electron.ipcRenderer.invoke("executeJSON", backendConfig, data);
      onCaptureListeners = onCaptureListeners.filter(
        (listener) => listener !== callbacks.onCapture,
      );
      return out;
    },
  };
  return backend;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).getBackendInstance = GetBackendInstanceElectron;

import "gui/out/tailwind.css";

import "cal-sans";

import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
