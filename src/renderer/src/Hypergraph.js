import Hyperedge from "./Hyperedge";

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,
        CONFLUENCE: 1,
        FUSION: 2,
        BRIDGE: 3
    };

    constructor(options = {}) {
        this.options = options;

        this._hyperedges = new Map();

        this.nodes = new Map();
        this.links = new Map();

        this.endSymbolIndex = new Map();
        this.symbolIndex = new Map();
        this.masqueradeIndex = new Map();
    }

    get isIsolated() {
        return this.options.interwingle === Hypergraph.INTERWINGLE.ISOLATED;
    }

    get isConfluence() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.CONFLUENCE;
    }

    get isFusion() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.FUSION;
    }

    get isBridge() {
        return this.options.interwingle >= Hypergraph.INTERWINGLE.BRIDGE;
    }

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    graphData() {
        return {
            nodes: Array.from(this.nodes.values()),
            links: Array.from(this.links.values())
        };
    }

    updateIndex(index, node) {
        if (!index.has(node.symbol)) {
            index.set(node.symbol, new Map());
        }

        index.get(node.symbol).set(node.id, node);
    }

    addNode(node) {
        this.updateIndex(this.symbolIndex, node);

        if (node.isEnd) {
            this.updateIndex(this.endSymbolIndex, node);
        }

        node.updateGraphData();

        /*
        if (data.nodes) {
            for (const node of data.nodes) {
                this.nodes.set(node.id, node);
            }
        }

        if (data.links) {
            for (const link of data.links) {
                this.links.set(link.id, link);
            }
        }
        */
    }

    addHyperedge(hyperedge) {
        const edge = new Hyperedge(hyperedge, this);
        this._hyperedges.set(edge.id, edge);
        for (const node of edge.nodes) {
            this.addNode(node);
        }
    }

    addHyperedges(hyperedges) {
        for (const hyperedge of hyperedges) {
            this.addHyperedge(hyperedge);
        }
    }
}

// const INTERWINGLE = {
// };

// export default class VisualHypergraph {
//     constructor(hyperedges = [], options = {}) {
//         this.options = options;

//         this.nodes = new Map();
//         this.links = new Map();

//         this.indexNodes = new Map();
//         this.indexLinks = new Map();

//         this._hyperedges = new Map();
//         for (const hyperedge of hyperedges) {
//             const edge = new VisualHyperedge(hyperedge, this);
//             this._hyperedges.set(edge.id, edge);
//             this.updateIndexes(edge);
//             edge.updateGraphData();
//             this.updateIndexes(edge); // hacky :(
//         }
//     }

//     get hyperedges() {
//         return Array.from(this._hyperedges.values());
//     }

//     get isIsolated() {
//         return this.options.interwingle === INTERWINGLE.ISOLATED;
//     }

//     get isConfluence() {
//         return this.options.interwingle >= INTERWINGLE.CONFLUENCE;
//     }

//     get isFusion() {
//         return this.options.interwingle >= INTERWINGLE.FUSION;
//     }

//     get isBridge() {
//         return this.options.interwingle >= INTERWINGLE.BRIDGE;
//     }

//     updateIndexes(hyperedge) {
//         for (let node of hyperedge.nodes) {
//             if (!this.indexNodes.has(node.symbol)) {
//                 this.indexNodes.set(node.symbol, new Set());
//             }

//             this.indexNodes.get(node.symbol).add(node.id);
//         }

//         for (const symbol of hyperedge.symbols) {
//             if (!this.indexLinks.has(symbol)) {
//                 this.indexLinks.set(symbol, new Set());
//             }

//             this.indexLinks.get(symbol).add(hyperedge.id);
//         }
//     }

//     graphData() {
//         return {
//             nodes: Array.from(this.nodes.values()),
//             links: Array.from(this.links.values())
//         };
//     }

//     edgesWithSymbol(symbol) {
//         const edges = [];
//         const linkIDs = this.indexLinks.get(symbol);
//         for (const linkID of linkIDs) {
//             if (this.links.has(linkID)) {
//                 edges.push(this._hyperedges.get(linkID));
//             }
//         }
//         return edges;
//     }

//     edgeWithEndSymbol(symbol, hyperedgeID) {
//         const edges = this.edgesWithSymbol(symbol);

//         for (const edge of edges) {
//             if (edge.id === hyperedgeID) continue;
//             if (edge.endNode().symbol !== symbol) continue;
//             console.log("FOUND EDGE", symbol, edge.id);
//             return edge;
//         }

//         return null;

//         // let key = null;
//         // for (const linkID of this.links.keys()) {
//         //     if (linkID !== hyperedgeID && linkID.endsWith(symbol)) {
//         //         key = linkID;
//         //         break;
//         //     }
//         // }

//         // if (!key) {
//         //     return null;
//         // }

//         // return this._hyperedges.get(this.links.get(key).hyperedgeID);
//     }

//     nodesWithSymbol(symbol, hyperedgeID) {
//         const matches = new Map();
//         for (const linkID of this.links.keys()) {
//             if (linkID.includes(symbol) && linkID !== hyperedgeID) {
//                 const linkData = this.links.get(linkID);
//                 if (linkData.bridge) continue;

//                 const hyperedge = this._hyperedges.get(linkData.hyperedgeID);

//                 for (const node of hyperedge.nodes) {
//                     if (node.symbol === symbol && this.nodes.has(node.id)) {
//                         matches.set(node.id, node);
//                     }
//                 }
//             }
//         }

//         return Array.from(matches.values());
//     }

//     _edgeSearch(edges = []) {
//         const matches = new Map();
//         for (const linkID of this.links.keys()) {
//             for (const edge of edges) {
//                 const edgeID = Array.isArray(edge) ? VisualHyperedge.id(edge) : edge;

//                 if (linkID.includes(edgeID)) {
//                     console.log(linkID, edgeID);
//                     const hyperedge = this._hyperedges.get(this.links.get(linkID).hyperedgeID);
//                     if (!hyperedge) continue;

//                     matches.set(hyperedge.id, hyperedge);
//                 }
//             }
//         }

//         return Array.from(matches.values());
//     }
// }

// VisualHypergraph.INTERWINGLE = INTERWINGLE;
