export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
    }

    // we can simplify the graph by removing the masquerade nodes and connecting their children to other graphs that make sense
    masqueradeID() {
        if (!this.hypergraph.options.isConnected) return null;

        if (this.isStart) {
            const edges = this.hypergraph.edgesWithEndSymbol(this.symbol);
            if (edges.length > 0) {
                return edges[0].id;
            }
        }

        return null;
    }

    get id() {
        const masqueradeID = this.masqueradeID();
        if (masqueradeID) {
            return masqueradeID;
        }
        return this.hyperedge.nodeId(this.index);
    }

    get data() {
        const graphData = { nodes: {}, links: {} };

        if (this.isStart) {
            const masqueradeID = this.masqueradeID();
            if (masqueradeID) {
                return graphData;
            }
        }

        console.log("DATA()");
        console.log(" - SYMBOL", this.symbol);
        console.log(" - ID", this.id);

        graphData.nodes[this.id] = {
            id: this.id,
            name: this.symbol,
            color: this.hyperedge.color,
            textHeight: 12
        };

        if (this.isStart) {
            return graphData;
        }

        const parentNode = this.hyperedge.prevNode(this.index);
        console.log(" - PARENT SYMBOL", parentNode.symbol);
        console.log(" - PARENT ID", parentNode.id);
        const link = parentNode.link(this);
        graphData.links[link.id] = link;

        return graphData;
    }

    link(childNode) {
        return {
            id: `${this.id}-${childNode.id}-link`,
            source: this.id,
            target: childNode.id,
            color: this.hyperedge.color
        };
    }

    get isStart() {
        return this.index === 0;
    }

    get isEnd() {
        return this.index === this.hyperedge.length - 1;
    }

    get isMiddle() {
        return !this.isStart && !this.isEnd;
    }
}
