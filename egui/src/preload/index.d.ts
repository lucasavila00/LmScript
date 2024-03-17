import { ElectronAPI } from "@electron-toolkit/preload";
import { OnCapture } from "@lmscript/client/backends/abstract";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    capture: {
      onCapture: (callback: OnCapture) => void;
    };
  }
}
