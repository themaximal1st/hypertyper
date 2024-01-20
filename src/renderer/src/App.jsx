import React from "react";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";

function genRandomTree(N = 5, reverse = false) {
    return {
        nodes: [
            { id: 1, name: "Ted Nelson", color: "blue" },
            { id: 2, name: "invented", color: "blue" },
            { id: 3, name: "HyperText", color: "blue" },
            { id: 4, name: "Tim Berners-Lee", color: "red" },
            { id: 5, name: "invented", color: "red" },
            { id: 6, name: "WWW", color: "red" }
        ],
        links: [
            { source: 1, target: 2, color: "blue" },
            { source: 2, target: 3, color: "blue" },
            { source: 4, target: 5, color: "red" },
            { source: 5, target: 6, color: "red" },
            { source: 2, target: 5, color: "black" },
            { source: 5, target: 2, color: "black" }
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

        return graphData;
    }

    getColorForSymbol(symbol) {
        const available = [
            "blue",
            "red",
            "green",
            "yellow",
            "purple",
            "orange",
            "pink",
            "brown",
            "black"
        ];

        // random
        return available[Math.floor(Math.random() * available.length)];
    }

    componentDidMount() {
        this.createGraph();
    }

    componentWillUnmount() {
        // Clean up the graph to avoid memory leaks
        if (this.graph) {
            this.graph._destructor();
        }
    }

    createGraph = () => {
        const data = this.data;
        const a1 = new ForceGraph3D();
        console.log("A1");
        console.log(a1);
        const a2 = a1(this.graphContainer, { backgroundColor: "#ffffff" });
        console.log("A2");
        console.log(a2);

        this.graph = a2
            .backgroundColor("#ffffff")
            .linkColor((link) => {
                return link.color || "black";
            })
            // .nodeVisibility(true)
            .nodeThreeObject((node) => {
                console.log("NODE THREE");
                const sprite = new SpriteText(node.name);
                sprite.color = node.color;
                sprite.textHeight = 8;
                return sprite;
            })
            .linkDirectionalArrowLength(3.5)
            .linkDirectionalArrowRelPos(1)
            .linkCurvature(0.25)
            .graphData(data);
    };

    render() {
        return (
            <>
                <input className="absolute z-20"></input>
                <div
                    className="w-full h-screen"
                    ref={(el) => {
                        this.graphContainer = el;
                    }} // Reference to the container div
                />
            </>
        );
    }
}
