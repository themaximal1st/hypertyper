import { stringToColor } from "./utils";
import ForceNode from "./Node";

export default class ForceHyperedge {
    constructor(symbols = [], hypergraph) {
        this.symbols = symbols;
        this.hypergraph = hypergraph;
        this.nodes = symbols.map(this.createNode.bind(this));
    }

    createNode(symbol, index) {
        return new ForceNode(symbol, index, this);
    }

    get index() {
        return this.hypergraph.hyperedges.indexOf(this);
    }

    get id() {
        const id = this.nodes.map((node) => node.symbol).join("->");
        if (this.hypergraph.isIsolated) {
            return `${this.index}-${id}`;
        }

        return id;
    }

    // TODO: is this right?
    static id(symbols) {
        const nodeIds = [];
        const edge = [];
        for (const symbol of symbols) {
            edge.push(symbol);
            nodeIds.push(edge.join("."));
        }

        return nodeIds.join("->");
    }

    updateGraphData() {
        for (const node of this.nodes) {
            node.updateGraphData();
        }
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    get color() {
        return stringToColor(this.symbols[0]);
    }

    prevNode(index) {
        if (index === 0) {
            return null;
        }

        return this.nodes[index - 1];
    }

    nextNode(index) {
        if (index === this.length - 1) {
            return null;
        }

        return this.nodes[index + 1];
    }

    startNode() {
        return this.nodes[0];
    }

    endNode() {
        return this.nodes[this.nodes.length - 1];
    }

    containsSymbol(symbol) {
        return this.symbols.includes(symbol);
    }
}
