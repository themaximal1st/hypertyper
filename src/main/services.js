import { dialog, shell } from "electron";
import Analytics from "./Analytics.js";
import fs from "fs";

export async function newFile(App) {
    Analytics.track("file.new");
    if (!(await promptBeforeErase(App))) return;

    App.hypertype.reset();
    App.browserWindow.reload();
}

export async function openFile(App) {
    Analytics.track("file.load");
    if (!(await promptBeforeErase(App))) return;

    const options = {
        title: "Load HyperType File",
        buttonLabel: "Open",
        accelerator: "CmdOrCtrl+O",
        filters: [
            { name: "hypertype", extensions: ["hypertype", "ht"] },
            { name: "csv", extensions: ["csv"] },
            { name: "text", extensions: ["txt"] },
        ],
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(
        App.browserWindow,
        options
    );

    if (canceled) return;

    const filePath = filePaths[0];
    if (!filePath) return;

    const contents = fs.readFileSync(filePath, "utf-8");
    App.hypertype.parse(contents);
    App.browserWindow.reload();
}

export function saveFile(App) {
    Analytics.track("file.save");
    const date = new Date();
    const filename = `~/Desktop/hypertype-${date.toISOString().replace(/:/g, "-")}.hypertype`;
    const options = {
        title: "Save HyperType File",
        accelerator: "CmdOrCtrl+S",
        defaultPath: filename,
        buttonLabel: "Save",
    };

    const filepath = dialog.showSaveDialogSync(App.browserWindow, options);

    const data = App.hypertype.export();
    fs.writeFileSync(filepath, data);

    shell.showItemInFolder(filepath);
}

async function promptBeforeErase(App) {
    if (App.hypertype.hyperedges.length === 0) return true;

    const { response } = await dialog.showMessageBox(App.browserWindow, {
        type: "question",
        title: "Confirmation",
        message:
            "Delete current HyperType file and start a new one? All unsaved changes will be lost.",
        buttons: ["No", "Yes"],
    });

    return response === 1;
}
