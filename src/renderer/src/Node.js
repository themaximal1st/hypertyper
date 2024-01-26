import SpriteText from "three-spritetext";
import * as Three from "three";

import { mergeGraphs } from "./utils";

export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
    }

    // A fusion node connects a start node to and end node
    //  ex: A.B.C && C.D.E become A.B.C.D.E
    fusionNode(data = {}) {
        if (!this.hypergraph.isFusion) return null;
        if (this.isMiddle) return null;

        const edge = this.hypergraph.edgeWithEndSymbol(this.symbol, this.hyperedge.id, data);
        if (!edge) return null;

        return edge.endNode();
    }

    // a node that bridges 2+ middle nodes
    updateBridgeGraphData(data = { nodes: {}, links: {} }) {
        if (!this.hypergraph.isBridge) return;
        if (!this.isMiddle) return;

        const nodes = this.hypergraph.nodesWithSymbol(this.symbol, this.id, data);
        if (nodes.length >= 2) {
            const bridgeNode = {
                id: `${this.symbol}#bridge`,
                color: this.hyperedge.color,
                bridge: true
            };

            data.nodes[bridgeNode.id] = bridgeNode;

            for (const node of nodes) {
                const link = Node.link(bridgeNode, node, data);
                link.length = 1;
                link.bridge = true;
                data.links[link.id] = link;
            }
        }
    }

    resolveFusionNode(data = {}) {
        const resolved = this.fusionNode(data);
        if (resolved) {
            return resolved;
        }

        return this;
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    updateGraphData(data = {}) {
        // TODO: check this
        const fusionNode = this.fusionNode(data);

        const node = fusionNode || this;

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

        let source = this.hyperedge.prevNode(this.index).resolveFusionNode(data);
        let target = node.resolveFusionNode(data);

        const link = Node.link(source, target, data);
        data.links[link.id] = link;

        if (this.isMiddle) {
            this.updateBridgeGraphData(data);
        }
    }

    static link(parentNode, childNode, data = {}) {
        if (!parentNode) throw new Error("Missing parentNode");
        if (!childNode) throw new Error("Missing childNode");

        if (!data.nodes[parentNode.id])
            throw new Error(`Missing parent node ${parentNode.id} in link to ${childNode.id}`);
        if (!data.nodes[childNode.id])
            throw new Error(`Missing child node ${childNode.id} in link from ${parentNode.id}`);

        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: parentNode.color || parentNode.hyperedge.color || "#000000"
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
        if (node.bridge) {
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
