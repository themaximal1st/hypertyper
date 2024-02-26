import { ipcMain } from "electron";
import HyperType from "@themaximalist/hypertype";
import Analytics from "./Analytics.js";

import App from "./app.js";

(async function () {
    Analytics.load();
    Analytics.track("app.init");

    const hypertype = new HyperType();
    const app = await App.launch(hypertype);

    ipcMain.handle("analytics.track", (_, event) => {
        Analytics.track(event);
    });

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

        Analytics.track("hyperedges.add");

        return edge.id;
    });

    ipcMain.handle("hyperedges.all", () => {
        const hyperedges = hypertype.hyperedges.map((hyperedge) => hyperedge.symbols);
        return hyperedges;
    });

    ipcMain.handle("hyperedges.remove", (_, hyperedge) => {
        Analytics.track("hyperedges.remove");
        hypertype.remove(...hyperedge);
    });
})();
