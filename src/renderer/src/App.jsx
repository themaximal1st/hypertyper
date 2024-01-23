import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import * as Three from "three";

import Hypergraph from "./Hypergraph";
import Animation from "./Animation";

// TODO: [ ] Resize graph on window resize
// TODO: [ ] Add camera WASD controls, which disables animation

// TODO: [ ] get dynamic updates working well
// TODO: [ ] get integrated with backend
// TODO: [ ] implement pagerank for text size!

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.graphRef = React.createRef();
        this.animation = new Animation(this.graphRef);
        this.cameraPosition = { x: 0, y: 0, z: 0 };
        this.state = {
            depth: 3,
            input: "",
            hyperedge: [],
            hypergraph: [
                ["Ted Nelson", "invented", "HyperText"],
                ["Ted Nelson", "invented", "Xanadu"],
                ["Tim Berners-Lee", "invented", "WWW"],
                ["Vannevar Bush", "invented", "Memex"],

                ["Tim Berners-Lee", "author", "Weaving the Web"],
                ["Ted Nelson", "author", "Lib Machines"],
                ["Ted Nelson", "invented", "HyperMedia"],
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

        this.animation.pause();
        this.setState({ data: hypergraph.graphData() }, () => {
            setTimeout(() => {
                this.animation.resume();
            }, 1000);
        });
    }

    componentDidMount() {
        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        this.reloadData();

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));

        this.animation.start();
    }

    handleZoom() {
        this.animation.pause();
        this.animation.resume();
    }

    handleMouseDown(e) {
        this.animation.click();
    }

    handleMouseUp(e) {
        this.animation.unclick();
    }

    handleKeyDown(e) {
        if (e.key === "`") {
            this.toggleDepth();
        }
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
        let depth = this.state.depth + 1;
        if (depth > 3) {
            depth = 0;
        }

        this.setState({ depth }, () => {
            this.reloadData();
        });
    }

    handleChangeDepth(e) {
        const depth = parseInt(e.target.value) || 0;

        this.setState({ depth }, () => {
            this.reloadData();
        });
    }

    render() {
        return (
            <>
                {/* <div className="absolute flex gap-4 z-20">
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
                </div> */}
                <div className="absolute top-0 right-0 bottom-0 z-20 flex justify-center items-center w-10 h-full">
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={this.state.depth}
                        className="depth-slider"
                        onChange={this.handleChangeDepth.bind(this)}
                    />
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
