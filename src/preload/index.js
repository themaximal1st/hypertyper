import { contextBridge, ipcRenderer } from "electron";

const api = {
    hyperedges: {
        add: (hyperedge, symbol) => {
            return ipcRenderer.invoke("hyperedges.add", hyperedge, symbol);
        },
        remove: (hyperedge) => {
            return ipcRenderer.invoke("hyperedges.remove", hyperedge);
        },
        all: () => {
            return ipcRenderer.invoke("hyperedges.all");
        }
    },
    forceGraph: {
        graphData: (options = {}) => {
            return ipcRenderer.invoke("forceGraph.graphData", options);
        }
    }
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
