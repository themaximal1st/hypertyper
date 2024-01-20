import React from "react";
import ForceGraph3D from "react-force-graph-3d";
// import ForceGraph2D from "react-force-graph-2d";
import SpriteText from "three-spritetext";

function genRandomTree(N = 5, reverse = false) {
    return {
        nodes: [
            { id: 1, name: "Ted Nelson", color: "blue" },
            { id: 2, name: "invented", color: "blue" },
            { id: 3, name: "HyperText", color: "blue" },
            { id: 4, name: "Tim Berners-Lee", color: "red" },
            { id: 5, name: "invented", color: "red" },
            { id: 6, name: "WWW", color: "red" },

            { id: 7, name: "Steve Jobs", color: "green" },
            { id: 8, name: "invented", color: "green" },
            { id: 9, name: "iPhone", color: "green" },
            { id: 10, name: "", color: "red" }
        ],
        links: [
            { source: 1, target: 2, color: "blue" },
            { source: 2, target: 3, color: "blue" },
            { source: 4, target: 5, color: "red" },
            { source: 5, target: 6, color: "red" },
            { source: 7, target: 8, color: "green" },
            { source: 8, target: 9, color: "green" },
            { source: 10, target: 2, color: "black" },
            { source: 10, target: 5, color: "black" },
            { source: 10, target: 8, color: "black" },
            { source: 1, target: 4, color: "black" }
        ]
    };
}

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            colors: [],
            hypergraph: [
                ["Ted Nelson", "invented", "HyperText"],
                ["Tim Berners-Lee", "invented", "WWW"]
            ]
        };
    }

    get data() {
        return genRandomTree();
        const graphData = { nodes: [], links: [] };
        for (const hyperedge of this.state.hypergraph) {
            const edge = [];
            let lastId = null;
            const color = this.getColorForSymbol(hyperedge[0]);
            for (const node of hyperedge) {
                edge.push(node);
                const id = edge.join("-");

                graphData.nodes.push({
                    id,
                    name: node,
                    color
                });

                if (edge.length > 1) {
                    graphData.links.push({
                        source: lastId,
                        target: id,
                        color
                    });
                }

                lastId = id;
            }
        }

        // connect nodes by name that have different ids
        for (const node of graphData.nodes) {
            const otherNodes = graphData.nodes.filter(
                (n) => n.name === node.name && n.id !== node.id
            );
            for (const otherNode of otherNodes) {
                graphData.links.push({
                    source: node.id,
                    target: otherNode.id,
                    color: "black"
                });
            }
        }

        return graphData;
    }

    getColorForSymbol(symbol) {
        const available = ["blue", "red", "green", "purple", "orange", "brown", "black"];

        // random
        return available[Math.floor(Math.random() * available.length)];
    }

    render() {
        return (
            <>
                <input className="absolute z-20"></input>
                <ForceGraph3D
                    graphData={this.data}
                    backgroundColor="#ffffff"
                    linkColor={(link) => {
                        return link.color || "black";
                    }}
                    nodeThreeObject={(node) => {
                        const sprite = new SpriteText(node.name);
                        sprite.color = node.color;
                        sprite.textHeight = 8;
                        return sprite;
                    }}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}
                />
            </>
        );
    }
}
