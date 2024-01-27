import { stringToColor } from "./utils";

import Node from "./Node";

export default class Hyperedge {
    constructor(symbols = [], hypergraph) {
        this.symbols = symbols;
        this.index = hypergraph._hyperedges.size;
        this.hypergraph = hypergraph;
        this.color = stringToColor(this.symbols[0]);
        this.nodes = symbols.map(this.createNode.bind(this));
        this.id = this.nodes.map((node) => node.symbol).join("->");

        if (this.hypergraph.isIsolated) {
            this.id = `${this.index}:${this.id}`;
        }
    }

    createNode(symbol, index) {
        return new Node(symbol, index, this);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
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
}

/*
import VisualNode from "./Node";

export default class VisualHyperedge {
    constructor(symbols = [], hypergraph) {
        this.symbols = symbols;
        this.hypergraph = hypergraph;
        this.nodes = symbols.map(this.createNode.bind(this));
    }

    createNode(symbol, index) {
        return new VisualNode(symbol, index, this);
    }

    get index() {
        return this.hypergraph.hyperedges.indexOf(this);
    }

    get id() {
    }

    updateGraphData() {
        for (const node of this.nodes) {
            node.updateGraphData();
        }
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

*/
