import { app, BrowserWindow } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

export default class App {
    constructor(browserWindow) {
        this.app = app;
        this.browserWindow = browserWindow;
    }

    static createWindow() {
        const browserWindow = new BrowserWindow({
            width: 900,
            height: 670,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: join(__dirname, "../preload/index.js"),
                sandbox: true
            }
        });

        browserWindow.on("ready-to-show", () => {
            browserWindow.show();
        });

        // browserWindow.webContents.setWindowOpenHandler((details) => {
        //   shell.openExternal(details.url)
        //   return { action: 'deny' }
        // })

        // HMR for renderer base on electron-vite cli.
        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
            browserWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        } else {
            browserWindow.loadFile(join(__dirname, "../renderer/index.html"));
        }

        return browserWindow;
    }

    static async launch() {
        await app.whenReady();

        electronApp.setAppUserModelId(app.name);

        // Default open or close DevTools by F12 in development and ignore CommandOrControl + R in production.
        app.on("browser-window-created", (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });

        const browserWindow = App.createWindow();

        // app.on('activate', function () {
        //   if (BrowserWindow.getAllWindows().length === 0) App.createWindow();
        // })

        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        return new App(browserWindow);
    }
}
