import { contextBridge, ipcRenderer } from "electron";

const api = {
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
