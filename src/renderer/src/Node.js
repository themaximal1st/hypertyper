import { stringToColor } from "./utils";

export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    get data() {
        const graphData = { nodes: [], links: [] };
        graphData.nodes.push({
            id: this.id,
            name: this.symbol,
            color: this.hyperedge.color,
            textHeight: 12
        });

        if (this.isStart) {
            return graphData;
        }

        const parentNode = this.hyperedge.prevNode(this.index);
        graphData.links.push(parentNode.link(this));

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
