import { contextBridge, ipcRenderer } from "electron";

const api = {
    nodes: {
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
        },
        add: (obj) => {
            return ipcRenderer.invoke("hypergraph.add", obj);
        }
    }
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
