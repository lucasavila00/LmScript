import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";
import { getBackendInstance } from "@lmscript/editor-tools/get-lmscript-backend";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).getBackendInstance = getBackendInstance;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
