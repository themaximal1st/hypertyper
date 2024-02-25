import { ipcMain } from "electron";

import App from "./app.js";
import HyperType from "@themaximalist/hypertype";

(async function () {
    const hypertype = new HyperType();
    const app = await App.launch(hypertype);

    ipcMain.handle("forceGraph.graphData", (_, filter = [], options = {}) => {
        console.log("forceGraph.graphData", filter, options);

        if (typeof options.interwingle !== "undefined") {
            hypertype.interwingle = options.interwingle;
        }

        if (typeof options.depth !== "undefined") {
            hypertype.depth = options.depth;
        }

        return hypertype.graphData(filter);
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

    ipcMain.handle("hyperedges.all", () => {
        const hyperedges = hypertype.hyperedges.map((hyperedge) => hyperedge.symbols);
        return hyperedges;
    });

    ipcMain.handle("hyperedges.remove", (_, hyperedge) => {
        hypertype.remove(...hyperedge);
    });
})();
