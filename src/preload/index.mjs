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
        graphData: (filter = [], options = null) => {
            return ipcRenderer.invoke("forceGraph.graphData", filter, options);
        }
    }
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
