export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
    }

    // we can simplify the graph by removing the masquerade nodes and connecting their children to other graphs that make sense
    masqueradeNode() {
        if (!this.hypergraph.options.isConnected) return null;

        if (this.isStart) {
            const edges = this.hypergraph.edgesWithEndSymbol(this.symbol, this.hyperedge.id);
            if (edges.length > 0) {
                const nodes = edges[0].nodes;
                return nodes[nodes.length - 1];
            }
        } else if (this.isEnd) {
            const edges = this.hypergraph.edgesWithEndSymbol(this.symbol, this.hyperedge.id);
            if (edges.length > 0) {
                const nodes = edges[edges.length - 1].nodes;
                return nodes[nodes.length - 1];
            }
        }
        return null;
    }

    get id() {
        const masqueradeNode = this.masqueradeNode();
        if (masqueradeNode) return masqueradeNode.hyperedge.nodeId(masqueradeNode.index);

        return this.hyperedge.nodeId(this.index);
    }

    graphData(data = {}) {
        let masqueradeNode = this.masqueradeNode();
        console.log("graphData()");
        console.log(`  ${this.symbol}`);

        // if we're masquerading as another node, but that other node doesn't exist
        // ...this is now the masquerade node and the other node will masqurade as this node
        if (masqueradeNode && !data.nodes[masqueradeNode.id]) {
            masqueradeNode = null;
        }

        const node = masqueradeNode || this;

        data.nodes[node.id] = {
            id: node.id,
            name: node.symbol,
            color: node.hyperedge.color,
            textHeight: 12
        };

        // start nodes don't need to be linked
        if (this.isStart) {
            return data;
        }

        let source = node.hyperedge.prevNode(node.index);
        let target = node;

        if (this.isEnd && masqueradeNode) {
            source = this.hyperedge.prevNode(this.index);
            target = masqueradeNode;
        }

        const link = source.link(target);
        data.links[link.id] = link;
        return data;
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
        return this.index === this.hyperedge.nodes.length - 1;
    }

    get isMiddle() {
        return !this.isStart && !this.isEnd;
    }
}
