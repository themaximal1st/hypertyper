import { ipcMain } from "electron";
import Analytics from "./Analytics.js";
import * as settings from "./settings";
import License from "./License.js";

export default class Bridge {
    constructor(hypertype) {
        this.hypertype = hypertype;
        ipcMain.handle("analytics.track", this.trackAnalytics.bind(this));
        ipcMain.handle("forceGraph.graphData", this.graphData.bind(this));
        ipcMain.handle("hyperedges.add", this.addHyperedges.bind(this));
        ipcMain.handle("hyperedges.all", this.allHyperedges.bind(this));
        ipcMain.handle("hyperedges.remove", this.removeHyperedges.bind(this));
        ipcMain.handle("settings.get", this.getSetting.bind(this));
        ipcMain.handle("settings.set", this.setSetting.bind(this));
        ipcMain.handle("license.validate", this.validateLicense.bind(this));
        ipcMain.handle(
            "license.trialDurationRemaining",
            this.trialDurationRemaining.bind(this)
        );
    }

    trackAnalytics(_, event) {
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

    addHyperedges(_, hyperedge, symbol) {
        let edge = this.hypertype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = this.hypertype.add(...hyperedge, symbol);
        }

        Analytics.track("hyperedges.add");

        return edge.id;
    }

    allHyperedges() {
        const hyperedges = this.hypertype.hyperedges.map(
            (hyperedge) => hyperedge.symbols
        );
        return hyperedges;
    }

    removeHyperedges(_, hyperedge) {
        Analytics.track("hyperedges.remove");
        this.hypertype.remove(...hyperedge);
    }

    getSetting(_, key) {
        return settings.get(key);
    }

    setSetting(_, key, value) {
        return settings.set(key, value);
    }

    async validateLicense(_, license) {
        return await License.check(license);
    }

    async trialDurationRemaining() {
        return License.trialDurationRemaining;
    }

    static async load(hypertype) {
        return new Bridge(hypertype);
    }
}
