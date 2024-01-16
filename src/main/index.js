import { ipcMain } from "electron";

import App from "./app.js";
import HyperType from "./hypertype.js";

(async function () {
    const app = await App.launch();
    const hypertype = await HyperType.load();

    ipcMain.handle("nodes.add", (_, symbol) => hypertype.add(symbol));
    ipcMain.handle("nodes.all", () => hypertype.nodes);
    ipcMain.handle("hyperedges.all", () => hypertype.hyperedges);
    ipcMain.handle("hypergraph.all", () => hypertype.all);
})();
