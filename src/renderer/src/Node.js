import SpriteText from "three-spritetext";
import * as Three from "three";

import { mergeGraphs } from "./utils";

export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
        this.isMasqueradeNode = false;
    }

    // we can simplify the graph by removing the masquerade nodes and connecting their children to other graphs that make sense
    // BUG: masquerade nodes are returning any node that can be a masquerade node. not the node that is a masquerade node
    masqueradeNode() {
        if (this.hypergraph.options.depth < 2) return null;

        // TODO: simplify
        if (this.isStart) {
            const edges = this.hypergraph.edgesWithEndSymbol(this.symbol, this.hyperedge.id);
            if (edges.length > 0) {
                const nodes = edges[0].nodes;
                console.log("EDGE", edges[0]);
                return nodes[nodes.length - 1];
            }
        } else if (this.isEnd) {
            const nodes = this.hypergraph.nodesWithSymbol(this.symbol, this.hyperedge.id);
            if (nodes.length > 0) {
                console.log("END", nodes[0]);
                return nodes[0];
            }
        }
        return null;
    }

    // a node that connects 2+ middle nodes
    connectorGraphData() {
        const data = { nodes: {}, links: {} };
        if (this.hypergraph.options.depth < 3) return data;
        if (!this.isMiddle) return data;

        const nodes = this.hypergraph.nodesWithSymbol(this.symbol, this._id);

        if (nodes.length >= 2) {
            const id = `${this.symbol}-connector`;
            data.nodes[id] = {
                id,
                color: this.hyperedge.color,
                connector: true
            };

            for (const node of nodes) {
                const link = node.linkParent(data.nodes[id]);
                link.length = 1;
                link.connector = true;
                data.links[link.id] = link;
            }
        }

        return data;
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    graphData(data = {}) {
        let masqueradeNode = this.masqueradeNode();
        if (masqueradeNode && !data.nodes[masqueradeNode.id]) {
            masqueradeNode = null;
        }

        const node = masqueradeNode || this;

        if (masqueradeNode) {
            this.isMasqueradeNode = true;
        }

        console.log("CREATE NODE");
        console.log(`  ID=${node.id}`);
        console.log(`  SYMBOL=${node.symbol}`);

        data.nodes[node.id] = {
            id: node.id,
            name: node.symbol,
            color: node.hyperedge.color,
            textHeight: node.textHeight
        };

        // start nodes don't need to be linked
        if (this.isStart) {
            return data;
        }

        let source, target;

        if (this.isEnd && masqueradeNode) {
            source = this.hyperedge.prevNode(this.index);
            target = masqueradeNode;
        } else {
            source = node.hyperedge.prevNode(node.index);
            target = node;
        }

        // TODO: This creates an infinite loop... isMasqueradeNode is always false
        let i = 0;
        while (i++ < 10) {
            const sourceMasqueradeNode = source.masqueradeNode();
            if (!sourceMasqueradeNode) {
                break;
            }
            source = sourceMasqueradeNode;
        }

        i = 0;
        while (i++ < 10) {
            const targetMasqueradeNode = target.masqueradeNode();
            if (!targetMasqueradeNode) {
                break;
            }
            console.log("TARGET");
            console.log(`  ID=${target.id}`);
            console.log(`  ID=${targetMasqueradeNode.id}`);
            console.log(`  ID=${targetMasqueradeNode.isMasqueradeNode}`);

            target = targetMasqueradeNode;
        }

        console.log("CREATE LINK");
        console.log(`  SOURCE=${source.id}`);
        console.log(`  TARGET=${target.id}`);

        const link = Node.link(source, target);
        data.links[link.id] = link;

        if (this.isMiddle) {
            const connector = this.connectorGraphData();
            data = mergeGraphs([data, connector]);
            data.nodes[node.id].textHeight = 6;
        }

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

    static link(parentNode, childNode) {
        return {
            id: `${parentNode.id}-${childNode.id}-link`,
            source: parentNode.id,
            target: childNode.id,
            color: parentNode.hyperedge.color
        };
    }

    linkParent(parentNode) {
        return {
            id: `${parentNode.id}-${this.id}-link`,
            source: parentNode.id,
            target: this.id,
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

    get textHeight() {
        return this.isStart ? 12 : 8;
    }

    static nodeThreeObject(node) {
        if (node.connector) {
            return new Three.Mesh(
                new Three.SphereGeometry(1),
                new Three.MeshLambertMaterial({
                    color: "#000000",
                    transparent: true,
                    opacity: 0.25
                })
            );
        }

        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        sprite.textHeight = node.textHeight || 8;
        return sprite;
    }
}
