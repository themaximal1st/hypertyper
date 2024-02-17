import { contextBridge, ipcRenderer } from "electron";

const api = {
    hyperedges: {
        add: (hyperedge, symbol) => {
            return ipcRenderer.invoke("hyperedges.add", hyperedge, symbol);
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
