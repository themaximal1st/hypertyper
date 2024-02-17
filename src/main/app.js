import { app, BrowserWindow, Menu, MenuItem } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

// TODO: Make HyperType multi-window
export default class App {
    constructor(browserWindow, hypertype) {
        this.app = app;
        this.browserWindow = browserWindow;
        this.hypertype = hypertype;
    }

    async load() {
        const menu = Menu.getApplicationMenu();
        if (!menu) return;

        let fileMenu = menu.items.find((m) => m.label === "File");

        if (fileMenu) {
            // separator
            fileMenu.submenu.insert(
                0,
                new MenuItem({
                    type: "separator"
                })
            );

            fileMenu.submenu.insert(
                0,
                new MenuItem({
                    label: "New HyperType File",
                    click: () => {
                        this.hypertype.reset();
                        this.browserWindow.reload();
                    }
                })
            );

            Menu.setApplicationMenu(menu);
        }
    }

    static createWindow() {
        const browserWindow = new BrowserWindow({
            width: 900,
            height: 670,
            // frame: false,
            titleBarStyle: "hidden",
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: join(__dirname, "../preload/index.js"),
                sandbox: true
            }
        });

        browserWindow.webContents.setFrameRate(60);

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

    static async launch(hypertype) {
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

        const hyperTyper = new App(browserWindow, hypertype);
        await hyperTyper.load();
        return hyperTyper;
    }
}
