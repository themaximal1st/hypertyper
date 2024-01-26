import ForceHyperedge from "./Hyperedge";

const INTERWINGLE = {
    ISOLATED: 0,
    CONFLUENCE: 1,
    FUSION: 2,
    BRIDGE: 3
};

export default class ForceHypergraph {
    constructor(hyperedges = [], options = {}) {
        this.options = options;

        this.nodes = new Map();
        this.links = new Map();

        this._hyperedges = new Map();
        for (const hyperedge of hyperedges) {
            const edge = new ForceHyperedge(hyperedge, this);
            this._hyperedges.set(edge.id, edge);
            edge.updateGraphData();
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
        return {
            nodes: Array.from(this.nodes.values()),
            links: Array.from(this.links.values())
        };
    }

    edgeWithEndSymbol(symbol, hyperedgeID) {
        let key = null;
        for (const linkID of this.links.keys()) {
            if (linkID !== hyperedgeID && linkID.endsWith(symbol)) {
                key = linkID;
                break;
            }
        }

        if (!key) {
            return null;
        }

        return this._hyperedges.get(this.links.get(key).hyperedgeID);
    }

    nodesWithSymbol(symbol, hyperedgeID) {
        const matches = new Map();
        for (const linkID of this.links.keys()) {
            if (linkID.includes(symbol) && linkID !== hyperedgeID) {
                const linkData = this.links.get(linkID);
                if (linkData.bridge) continue;

                const hyperedge = this._hyperedges.get(linkData.hyperedgeID);

                for (const node of hyperedge.nodes) {
                    if (node.symbol === symbol && this.nodes.has(node.id)) {
                        matches.set(node.id, node);
                    }
                }
            }
        }

        return Array.from(matches.values());
    }

    edgeSearch(edges = []) {
        const matches = new Map();
        for (const linkID of this.links.keys()) {
            for (const edge of edges) {
                const edgeID = Array.isArray(edge) ? ForceHyperedge.id(edge) : edge;

                if (linkID.includes(edgeID)) {
                    console.log(linkID, edgeID);
                    const hyperedge = this._hyperedges.get(this.links.get(linkID).hyperedgeID);
                    if (!hyperedge) continue;

                    matches.set(hyperedge.id, hyperedge);
                }
            }
        }

        return Array.from(matches.values());
    }
}

// TODO: do we need some kind of reverse index of nodes and links? we're regenerating these all over the place
// TODO: also need to think how to get data from the hypergraph into the force graph...should force graph be doing the filtering or hypertype?

ForceHypergraph.INTERWINGLE = INTERWINGLE;
