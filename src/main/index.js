import { ipcMain } from "electron";
import fs from "fs";

import App from "./app.js";

(async function () {
    const app = await App.launch();
    const HyperType = (await import("@themaximalist/hypertype")).default;

    const hypertype = new HyperType();

    ipcMain.handle("forceGraph.graphData", (_, options) => {
        if (typeof options.interwingle !== "undefined") {
            hypertype.options.interwingle = options.interwingle;
        }
        return hypertype.graphData();
    });
})();
