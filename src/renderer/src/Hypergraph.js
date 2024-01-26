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

        this.nodes = new Map();
        this.links = new Map();

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
        this.nodes = new Map();
        this.links = new Map();
        for (const hyperedge of this.hyperedges) {
            hyperedge.updateGraphData();
        }

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
        const matches = [];
        for (const linkID of this.links.keys()) {
            if (linkID.includes(symbol) && linkID !== hyperedgeID) {
                const linkData = this.links.get(linkID);
                if (linkData.bridge) continue;

                const hyperedge = this._hyperedges.get(linkData.hyperedgeID);

                for (const node of hyperedge.nodes) {
                    if (node.symbol === symbol && this.nodes.has(node.id)) {
                        matches.push(node);
                    }
                }
            }
        }

        return matches;
    }
}

Hypergraph.INTERWINGLE = INTERWINGLE;
