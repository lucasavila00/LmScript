import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { SGLangBackend } from "@lmscript/client/backends/sglang";
import { AbstractBackend } from "@lmscript/client/backends/abstract";
import { VllmBackend } from "@lmscript/client/backends/vllm";
import { RunpodServerlessBackend } from "@lmscript/client/backends/runpod-serverless-sglang";
import type { Backend } from "@lmscript/gui/src/editor/hooks/useBackendConfig";
import fs from "node:fs";

const assertIsNever = (x: never): never => {
  throw new Error(`Unexpected: ${x}`);
};

// MAKE SURE ELECTRON COPY MATCHES
const getBackendInstance = (backend: Backend): AbstractBackend => {
  switch (backend.tag) {
    case "runpod-serverless-sglang": {
      return new RunpodServerlessBackend(backend.url, backend.token);
    }
    case "runpod-serverless-vllm": {
      return new VllmBackend({
        url: backend.url,
        auth: backend.token,
        model: backend.model,
      });
    }
    case "sglang": {
      return new SGLangBackend(backend.url);
    }
    default: {
      return assertIsNever(backend);
    }
  }
};

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  // ipcMain.on("ping", () => console.log("pong"));

  const mainWindow = createWindow();

  ipcMain.handle("saveFileAs", async (_, content) => {
    // use dialog to save file
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: "Untitled.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (filePath != null && filePath != "") {
      await fs.promises.writeFile(filePath, content, "utf-8");
      return filePath;
    }
    return null;
  });
  ipcMain.handle("saveFile", async (_, content, filePath) =>
    fs.promises.writeFile(filePath, content, "utf-8"),
  );

  ipcMain.handle("openFile", async (_) => {
    // use dialog to get file path
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    const filePath = filePaths[0];
    if (filePath != null) {
      const stringifiedContent = await fs.promises.readFile(filePath, "utf-8");

      return { stringifiedContent, filePath };
    }
    return undefined;
  });
  ipcMain.handle("executeJSON", async (_, config, data) => {
    const backend = getBackendInstance(config);
    return backend.executeJSON(data, {
      onCapture: (captured) => {
        mainWindow.webContents.send("onCapture", captured);
      },
    });
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
