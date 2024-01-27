import SpriteText from "three-spritetext";
import * as Three from "three";

export default class Node {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
        this.id = this.hyperedge.nodeId(this.index);
        this.color = this.hyperedge.color;
        this.textHeight = 8;
    }

    updateMasqueradeNode() {
        if (!this.hypergraph.isFusion) return null;
        if (this.isMiddle) return null;

        const nodes = this.hypergraph.endSymbolIndex.get(this.symbol);
        if (!nodes || nodes.size === 0) return null;

        const node = nodes.values().next().value;
        this.hypergraph.masqueradeIndex.set(this.id, node);
    }

    resolvedNode() {
        let node = this;
        while (true) {
            const nextNode = node.hypergraph.masqueradeIndex.get(node.id);
            if (!nextNode) break;
            if (node.id === nextNode.id) break;
            node = nextNode;
        }

        return node;
    }

    nodeData(node) {
        return {
            id: node.id,
            name: node.symbol,
            color: node.color,
            textHeight: node.textHeight
        };
    }

    graphData() {
        this.updateMasqueradeNode();

        return {
            node: this.nodeData(this.resolvedNode()),
            link: this.linkData(this)
        };
    }

    linkData(node) {
        console.log("LINK DATA", node.id);

        if (node.isStart) return null;

        let parentNode = node.hyperedge.prevNode(node.index).resolvedNode();
        if (!parentNode) throw new Error("Missing parentNode");

        const childNode = node.resolvedNode();
        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: parentNode.color || parentNode.hyperedge.color || "#000000",
            hyperedgeID: parentNode.bridge ? null : parentNode.hyperedge.id
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

        let name = node.name || "";
        if (name.length > 30) {
            name = `${name.substring(0, 27)}...`;
        }
        if (!name) {
            return null;
        }

        const sprite = new SpriteText(name);
        sprite.color = node.color;
        sprite.textHeight = node.textHeight || 8;

        return sprite;
    }
}

/*
export default class VisualNode {
    constructor(symbol, index, hyperedge) {
        this.symbol = symbol;
        this.index = index;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
    }

    // A fusion node connects a start node to and end node
    //  ex: A.B.C && C.D.E become A.B.C.D.E
    fusionNode() {
        if (!this.hypergraph.isFusion) return null;
        if (this.isMiddle) return null;

        const edge = this.hypergraph.edgeWithEndSymbol(this.symbol, this.hyperedge.id);

        if (!edge) return null;

        return edge.endNode();
    }

    // a node that bridges 2+ middle nodes
    updateBridgeGraphData() {
        if (!this.hypergraph.isBridge) return;
        if (!this.isMiddle) return;

        const matches = this.hypergraph.nodesWithSymbol(this.symbol, this.id);
        if (matches.length >= 2) {
            const bridgeNode = {
                id: `${this.symbol}#bridge`,
                color: this.hyperedge.color,
                bridge: true
            };

            this.hypergraph.nodes.set(bridgeNode.id, bridgeNode);

            for (const node of matches) {
                const link = VisualNode.link(
                    bridgeNode,
                    node,
                    this.hypergraph.nodes,
                    this.hypergraph.links
                );
                link.length = 1;
                link.bridge = true;
                this.hypergraph.links.set(link.id, link);
            }
        }
    }

    resolveFusionNode() {
        if (this._fusionNode) {
            return this._fusionNode;
        }

        const node = this.fusionNode() || this;
        this._fusionNode = node;
        return node;
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    updateGraphData() {
        const fusionNode = this.fusionNode();

        const node = fusionNode || this;

        const nodeData = {
            id: node.id,
            name: node.symbol,
            color: node.hyperedge.color,
            textHeight: node.textHeight
        };

        this.hypergraph.nodes.set(nodeData.id, nodeData);

        // start nodes don't need to be linked
        if (this.isStart) {
            return;
        }

        let source = this.hyperedge.prevNode(this.index).resolveFusionNode();
        let target = node.resolveFusionNode();

        const link = source.link(target);
        this.hypergraph.links.set(link.id, link);

        if (this.isMiddle) {
            this.updateBridgeGraphData();
        }
    }

    link(childNode) {
        return VisualNode.link(this, childNode, this.hypergraph.nodes, this.hypergraph.links);
    }

    static link(parentNode, childNode, nodes, links) {
        if (!parentNode) throw new Error("Missing parentNode");
        if (!childNode) throw new Error("Missing childNode");

        if (!nodes.has(parentNode.id))
            throw new Error(`Missing parent node ${parentNode.id} in link to ${childNode.id}`);
        if (!nodes.has(childNode.id)) {
            throw new Error(`Missing child node ${childNode.id} in link from ${parentNode.id}`);
        }

        return {
            id: `${parentNode.id}->${childNode.id}`,
            source: parentNode.id,
            target: childNode.id,
            color: parentNode.color || parentNode.hyperedge.color || "#000000",
            hyperedgeID: parentNode.bridge ? null : parentNode.hyperedge.id
        };
    }



}
*/
