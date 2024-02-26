import { ipcMain } from "electron";
import Analytics from "./Analytics.js";

export default class Bridge {
    constructor(hypertype) {
        this.hypertype = hypertype;
        ipcMain.handle("analytics.track", this.track.bind(this));
        ipcMain.handle("forceGraph.graphData", this.graphData.bind(this));
        ipcMain.handle("hyperedges.add", this.add.bind(this));
        ipcMain.handle("hyperedges.all", this.all.bind(this));
        ipcMain.handle("hyperedges.remove", this.remove.bind(this));
    }

    track(_, event) {
        Analytics.track(event);
    }

    graphData(_, filter = [], options = {}) {
        if (typeof options.interwingle !== "undefined") {
            this.hypertype.interwingle = options.interwingle;
        }

        if (typeof options.depth !== "undefined") {
            this.hypertype.depth = options.depth;
        }

        return this.hypertype.graphData(filter);
    }

    add(_, hyperedge, symbol) {
        let edge = this.hypertype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = this.hypertype.add(...hyperedge, symbol);
        }

        Analytics.track("hyperedges.add");

        return edge.id;
    }

    all() {
        const hyperedges = this.hypertype.hyperedges.map((hyperedge) => hyperedge.symbols);
        return hyperedges;
    }

    remove(_, hyperedge) {
        Analytics.track("hyperedges.remove");
        this.hypertype.remove(...hyperedge);
    }

    static async load(hypertype) {
        return new Bridge(hypertype);
    }
}
