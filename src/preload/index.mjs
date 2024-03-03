import { contextBridge, ipcRenderer } from "electron";

const api = {
    settings: {
        get: (key) => {
            return ipcRenderer.invoke("settings.get", key);
        },
        set: (key, value) => {
            return ipcRenderer.invoke("settings.set", key, value);
        },
    },
    analytics: {
        track: (event) => {
            return ipcRenderer.invoke("analytics.track", event);
        },
    },
    hyperedges: {
        add: (hyperedge, symbol) => {
            return ipcRenderer.invoke("hyperedges.add", hyperedge, symbol);
        },
        remove: (hyperedge) => {
            return ipcRenderer.invoke("hyperedges.remove", hyperedge);
        },
        all: () => {
            return ipcRenderer.invoke("hyperedges.all");
        },
    },
    forceGraph: {
        graphData: (filter = [], options = null) => {
            return ipcRenderer.invoke("forceGraph.graphData", filter, options);
        },
    },
    licenses: {
        validate: (license) => {
            return ipcRenderer.invoke("license.validate", license);
        },
        trialDurationRemaining: () => {
            return ipcRenderer.invoke("license.trialDurationRemaining");
        },
    },
    messages: {
        receive: (channel, func) => {
            const validChannels = ["message-from-main"];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
    },
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
