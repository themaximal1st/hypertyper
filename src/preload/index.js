import { contextBridge, ipcRenderer } from "electron";

const api = {
    nodes: {
        add: (symbol) => {
            return ipcRenderer.invoke("nodes.add", symbol);
        },
        all: () => {
            return ipcRenderer.invoke("nodes.all");
        }
    },
    hyperedges: {
        all: () => {
            return ipcRenderer.invoke("hyperedges.all");
        }
    },
    hypergraph: {
        all: () => {
            return ipcRenderer.invoke("hypergraph.all");
        }
    }
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
