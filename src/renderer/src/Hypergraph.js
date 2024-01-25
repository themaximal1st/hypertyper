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
        this.hyperedges = hyperedges.map((hyperedge) => new Hyperedge(hyperedge, this));
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
            data = mergeGraphs([data, hyperedge.graphData(data)]);
        }

        console.log(data);

        return {
            nodes: Object.values(data.nodes),
            links: Object.values(data.links)
        };
    }

    edgeWithEndSymbol(symbol, hyperedgeID, data = {}) {
        const edges = this.hyperedges.filter((hyperedge) => {
            const node = hyperedge.endNode();
            if (!node) return false;
            if (hyperedge.id === hyperedgeID) return false; // ignore self
            if (!data.nodes[node.id]) return false; // ignore nodes that don't exist
            if (node.symbol !== symbol) return false; // ignore nodes that don't match symbol
            return true;
        });

        return edges[0];
    }

    /*
    nodesWithSymbol(symbol, hyperedgeID) {
        const nodes = [];
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                if (
                    !node.isMasqueradeNode &&
                    node.symbol === symbol &&
                    hyperedge.id !== hyperedgeID
                ) {
                    nodes.push(node);
                }
            }
        }
        return nodes;
    }
    */
}
