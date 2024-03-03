import { MenuItem, dialog, shell } from "electron";
import * as services from "./services.js";

export function NewMenuItem(App) {
    return new MenuItem({
        label: "New HyperTyper",
        accelerator: "CmdOrCtrl+N",
        click: services.newFile.bind(null, App),
    });
}

export function SaveMenuItem(App) {
    return new MenuItem({
        label: "Save HyperTyper",
        click: services.saveFile.bind(null, App),
    });
}

export function LoadMenuItem(App) {
    return new MenuItem({
        label: "Load HyperType File",
        click: services.openFile.bind(null, App),
    });
}

export function LicenseMenuItem(App) {
    return new MenuItem({
        label: "License",
        click: () => {
            App.browserWindow.webContents.send(
                "message-from-main",
                "show-license-info"
            );
        },
    });
}
