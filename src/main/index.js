import { ipcMain } from "electron";
import fs from "fs";

import App from "./app.js";

(async function () {
    const HyperType = (await import("@themaximalist/hypertype")).default;
    const hypertype = new HyperType();
    const app = await App.launch(hypertype);

    ipcMain.handle("forceGraph.graphData", (_, options) => {
        if (typeof options.interwingle !== "undefined") {
            hypertype.options.interwingle = options.interwingle;
        }
        return hypertype.graphData();
    });

    ipcMain.handle("hyperedges.add", (_, hyperedge, symbol) => {
        let edge = hypertype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = hypertype.add(...hyperedge, symbol);
        }

        return edge.id;
    });
})();
