import { mergeGraphs } from "./utils";

import Hyperedge from "./Hyperedge";

export default class Hypergraph {
    constructor(hyperedges = [], options = {}) {
        this.options = options;
        this.hyperedges = hyperedges.map((hyperedge) => new Hyperedge(hyperedge, this));
    }

    get data() {
        const graphs = mergeGraphs(this.hyperedges.map((hyperedge) => hyperedge.data));
        return { nodes: Object.values(graphs.nodes), links: Object.values(graphs.links) };
    }
}
