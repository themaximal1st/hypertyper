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
        if (!this.isStart) return null;

        const edge = this.hypergraph.edgeWithEndSymbol(this.symbol, this.hyperedge.id, data);
        if (!edge) return null;

        return edge.endNode();
    }

    // a node that connects 2+ middle nodes
    connectorGraphData() {
        const data = { nodes: {}, links: {} };
        if (this.hypergraph.isBridge) return data;
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
        const fusionNode = this.fusionNode(data);

        const node = fusionNode || this;

        // console.log("CREATE NODE");
        // console.log(`  SYMBOL=${node.symbol}`);
        // console.log(`  ID=${this.id}`);
        // if (fusionNode) {
        //     console.log(`  FUSION=${node.id}`);
        // }

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

        // console.log("GETTING");
        // console.log("  NODE", node.id);

        let source, target;

        // fusion nodes are invisible
        if (!fusionNode) {
            source = this.hyperedge.prevNode(this.index);
            target = node;
        }

        // if source is a fusion node, use that instead
        const sourceFusionNode = source.fusionNode(data);
        if (sourceFusionNode) {
            source = sourceFusionNode;
        }

        // if target is a fusion node, use that instead
        const targetFusionNode = target.fusionNode(data);
        if (targetFusionNode) {
            target = targetFusionNode;
        }

        /*
        if (this.isEnd && masqueradeNode) {
            source = this.hyperedge.prevNode(this.index);
            target = masqueradeNode;
        } else {
            source = node.hyperedge.prevNode(node.index);
            target = node;
        }
        */

        // console.log("LINK");
        // console.log(" SOURCE", source.id);
        // console.log(" TARGET", target.id);

        if (source && target) {
            const link = Node.link(source, target, data);
            data.links[link.id] = link;
        }

        /*
        if (this.isMiddle) {
            const connector = this.connectorGraphData();
            data = mergeGraphs([data, connector]);
            data.nodes[node.id].textHeight = 6;
        }
        */

        return data;
    }

    static link(parentNode, childNode, data = {}) {
        if (!parentNode) throw new Error("Missing parentNode");
        if (!childNode) throw new Error("Missing childNode");

        // console.log("LINK!!!");
        // console.log(parentNode.id);

        if (!data.nodes[parentNode.id])
            throw new Error(`Missing parent node ${parentNode.id} in link to ${childNode.id}`);
        if (!data.nodes[childNode.id])
            throw new Error(`Missing child node ${childNode.id} in link from ${parentNode.id}`);

        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: parentNode.hyperedge.color
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
