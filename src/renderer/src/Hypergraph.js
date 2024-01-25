import { mergeGraphs } from "./utils";

import Hyperedge from "./Hyperedge";

export default class Hypergraph {
    constructor(hyperedges = [], options = {}) {
        this.options = options;
        this.interwingle = typeof options.interwingle === "number" ? options.interwingle : 1;
        this.hyperedges = hyperedges.map((hyperedge) => new Hyperedge(hyperedge, this));
    }

    graphData() {
        let data = { nodes: {}, links: {} };
        for (const hyperedge of this.hyperedges) {
            data = mergeGraphs([data, hyperedge.graphData(data)]);
        }

        return {
            nodes: Object.values(data.nodes),
            links: Object.values(data.links)
        };
    }

    edgesWithEndSymbol(symbol, hyperedgeID) {
        return this.hyperedges.filter((hyperedge) => {
            const node = hyperedge.endNode();
            return hyperedge.id !== hyperedgeID && !node.isMasqueradeNode && node.symbol === symbol;
        });
    }

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
}
