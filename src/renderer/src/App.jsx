import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

import Hypergraph from "./Hypergraph";

// -1 = no depth
// 0 = default depth
// 1 = start and end connected
// 2 = middle connected

// TODO: [ ] Animation spinner (auto spin if no mouse movement for 5s?)
// TODO: [X] Start nodes
// TODO: [X] End Nodes
// TODO: [ ] Middle Nodes
// TODO: get dynamic updates working well

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.graphRef = React.createRef();
        this.state = {
            depth: 0,
            input: "",
            hyperedge: [],
            hypergraph: [
                ["Ted Nelson", "invented", "HyperText"],
                ["Tim Berners-Lee", "invented", "WWW"],
                ["Vannevar Bush", "invented", "Memex"],

                ["Tim Berners-Lee", "author", "Weaving the Web"],
                ["Ted Nelson", "author", "Lib Machines"],
                ["Ted Nelson", "invented", "HyperMedia"],
                ["Ted Nelson", "invented", "Xanadu"],
                ["Ted Nelson", "invented", "ZigZag"],
                ["Vannevar Bush", "author", "As We May Think"],
                ["HyperText", "influenced", "WWW"]
            ],
            colors: [],

            data: { nodes: [], links: [] }
        };
    }

    reloadData() {
        const hypergraph = new Hypergraph(this.state.hypergraph, {
            depth: this.state.depth
        });
        this.setState({ data: hypergraph.graphData() });
    }

    componentDidMount() {
        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        this.reloadData();
    }

    handleAddInput(e) {
        e.preventDefault();
        const input = this.state.input;
        const hyperedge = [...this.state.hyperedge, input];
        const hypergraph = this.state.hypergraph.filter((edge) => edge !== this.state.hyperedge);
        hypergraph.push(hyperedge);
        const data = this.hypergraphToForceGraph(hypergraph);
        this.setState({
            hyperedge,
            hypergraph,
            data,
            input: ""
        });
    }

    toggleDepth() {
        let depth = this.state.depth;
        depth++;
        if (depth > 2) depth = -1;

        this.setState({ depth }, () => {
            this.reloadData();
        });
    }

    render() {
        return (
            <>
                <div className="absolute flex gap-4 z-20">
                    {this.state.hyperedge.map((symbol, i) => {
                        return (
                            <div key={i} className="bg-gray-50 p-2 rounded-sm">
                                {symbol}
                            </div>
                        );
                    })}
                    <form onSubmit={this.handleAddInput.bind(this)}>
                        <input
                            autoFocus
                            className="absolute z-20 bg-gray-50 p-2 rounded-sm outline-none"
                            value={this.state.input}
                            onChange={(e) => this.setState({ input: e.target.value })}
                        ></input>
                    </form>
                </div>
                <div className="absolute top-0 right-0 p-2 flex gap-4 z-20">
                    <a
                        onClick={this.toggleDepth.bind(this)}
                        className="cursor-pointer opacity-50 hover:opacity-100 transition-all bg-gray-50 rounded-sm"
                    >
                        {this.state.depth}
                    </a>
                </div>
                <ForceGraph3D
                    ref={this.graphRef}
                    graphData={this.state.data}
                    showNavInfo={false}
                    backgroundColor="#ffffff"
                    linkColor={(link) => {
                        return link.color || "#333333";
                    }}
                    nodeThreeObject={(node) => {
                        const sprite = new SpriteText(node.name);
                        sprite.color = node.color;
                        sprite.textHeight = node.textHeight || 8;
                        return sprite;
                    }}
                    linkDirectionalArrowLength={(link) => {
                        if (link.length < 0) {
                            return 0;
                        }
                        return 5;
                    }}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={1}
                    linkCurvature={0.25}
                />
            </>
        );
    }
}
