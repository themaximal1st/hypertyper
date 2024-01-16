import { ipcMain } from "electron";

import App from "./app.js";
import HyperType from "./hypertype.js";

(async function () {
    const app = await App.launch();
    const hypertype = await HyperType.load();

    ipcMain.handle("nodes.all", () => hypertype.nodes);
    ipcMain.handle("hyperedges.all", () => hypertype.hyperedges);
    ipcMain.handle("hypergraph.all", () => hypertype.all);
    ipcMain.handle("hypergraph.add", (_, obj) => hypertype.add(obj));
})();
