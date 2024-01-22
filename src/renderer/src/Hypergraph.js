import { mergeGraphs } from "./utils";

import Hyperedge from "./Hyperedge";

export default class Hypergraph {
    constructor(hyperedges = []) {
        this.hyperedges = hyperedges.map((hyperedge) => new Hyperedge(hyperedge, this));
    }

    get data() {
        return mergeGraphs(this.hyperedges.map((hyperedge) => hyperedge.data));
    }
}
