import { ipcMain } from "electron";
import fs from "fs";

import App from "./app.js";

(async function () {
    const app = await App.launch();
    const HyperType = (await import("@themaximalist/hypertype")).default;

    const file = "/Users/brad/Projects/loom/data/data";
    const contents = fs.readFileSync(file, "utf8").trim();

    const options = {
        parse: {
            delimiter: " -> "
        }
    };

    const hypertype = HyperType.parse(contents, options);

    ipcMain.handle("forceGraph.graphData", (_, options) => {
        hypertype.options = options;
        return hypertype.graphData();
    });
})();
