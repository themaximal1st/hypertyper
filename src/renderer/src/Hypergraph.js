import { mergeGraphs } from "./utils";

import Hyperedge from "./Hyperedge";

const INTERWINGLE = {
    ISOLATED: 0,
    CONFLUENCE: 1,
    FUSION: 2,
    BRIDGE: 3
};

export default class Hypergraph {
    constructor(hyperedges = [], options = {}) {
        this.options = options;
        this._hyperedges = new Map();
        for (const hyperedge of hyperedges) {
            const edge = new Hyperedge(hyperedge, this);
            this._hyperedges.set(edge.id, edge);
        }
    }

    get hyperedges() {
        return Array.from(this._hyperedges.values());
    }

    get isIsolated() {
        return this.options.interwingle === INTERWINGLE.ISOLATED;
    }

    get isConfluence() {
        return this.options.interwingle >= INTERWINGLE.CONFLUENCE;
    }

    get isFusion() {
        return this.options.interwingle >= INTERWINGLE.FUSION;
    }

    get isBridge() {
        return this.options.interwingle >= INTERWINGLE.BRIDGE;
    }

    graphData() {
        let data = { nodes: {}, links: {} };
        for (const hyperedge of this.hyperedges) {
            hyperedge.updateGraphData(data);
        }

        return {
            nodes: Object.values(data.nodes),
            links: Object.values(data.links)
        };
    }

    // TODO: bloom filter?
    edgeWithEndSymbol(symbol, hyperedgeID, data = { nodes: {}, links: {} }) {
        let key = null;
        for (const linkID in data.links) {
            return null;
            if (linkID !== hyperedgeID && linkID.endsWith(symbol)) {
                key = linkID;
                break;
            }
        }

        if (!key) return null;
        const hyperedge = data.links[key];
        if (!hyperedge) {
            console.log(this._hyperedges);
            console.log("KEY", key);
            console.log("edgeWithEndSymbol", hyperedge);
            throw "BLAMO";
        }
        return this._hyperedges.get();

        /*
        const edges = this.hyperedges.filter((hyperedge) => {
            const node = hyperedge.endNode();
            if (!node) return false;
            if (hyperedge.id === hyperedgeID) return false; // ignore self
            if (!data.nodes[node.id]) return false; // ignore nodes that don't exist
            if (node.symbol !== symbol) return false; // ignore nodes that don't match symbol
            return true;
        });

        if (edges.length === 0) return null;

        return edges[0];
        */
    }

    nodesWithSymbol(symbol, hyperedgeID, data = { nodes: [], links: [] }) {
        const nodes = [];
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                if (node.symbol !== symbol) continue; // ignore nodes that don't match symbol
                if (hyperedge.id === hyperedgeID) continue; // ignore self
                if (!data.nodes[node.id]) continue; // ignore nodes that don't exist
                nodes.push(node);
            }
        }
        return nodes;
    }
}

Hypergraph.INTERWINGLE = INTERWINGLE;
