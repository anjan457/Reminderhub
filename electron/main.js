const path = require("path");
const { app, BrowserWindow, shell, session } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, "..", "index.html"));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => {
    if (permission === "notifications") {
      cb(true);
      return;
    }
    cb(false);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
