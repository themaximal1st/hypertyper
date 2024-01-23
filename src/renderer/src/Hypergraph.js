import { mergeGraphs } from "./utils";

import Hyperedge from "./Hyperedge";

export default class Hypergraph {
    constructor(hyperedges = [], options = {}) {
        this.options = options;
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
            return hyperedge.id !== hyperedgeID && hyperedge.endNode().symbol === symbol;
        });
    }
}
