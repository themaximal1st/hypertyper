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
        const nodes = new Map();
        const links = new Map();
        for (const hyperedge of this.hyperedges) {
            hyperedge.updateGraphData(nodes, links);
        }

        // TODO: Maybe even more efficient to pass maps back fully?
        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values())
        };
    }

    edgeWithEndSymbol(symbol, hyperedgeID, nodes, links) {
        let key = null;
        for (const linkID of links.keys()) {
            if (linkID !== hyperedgeID && linkID.endsWith(symbol)) {
                key = linkID;
                break;
            }
        }

        if (!key) {
            return null;
        }

        return this._hyperedges.get(links.get(key).hyperedgeID);
    }

    nodesWithSymbol(symbol, hyperedgeID, nodes, links) {
        const matches = [];
        for (const linkID of links.keys()) {
            if (linkID.includes(symbol) && linkID !== hyperedgeID) {
                const linkData = links.get(linkID);
                if (linkData.bridge) continue;

                const hyperedge = this._hyperedges.get(linkData.hyperedgeID);

                for (const node of hyperedge.nodes) {
                    if (node.symbol === symbol && nodes.has(node.id)) {
                        matches.push(node);
                    }
                }
            }
        }

        return matches;
    }
}

Hypergraph.INTERWINGLE = INTERWINGLE;
