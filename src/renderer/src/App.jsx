import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Hypergraph from "./Hypergraph";
import Node from "./Node";
import Animation from "./Animation";

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
            width: window.innerWidth,
            height: window.innerHeight,
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
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        this.animation.start();
    }

    componentWillUnmount() {
        this.animation.stop();
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
        document.removeEventListener("keyup", this.handleKeyUp.bind(this));
        document.removeEventListener("mousedown", this.handleMouseDown.bind(this));
        document.removeEventListener("mouseup", this.handleMouseUp.bind(this));
        document.removeEventListener("wheel", this.handleZoom.bind(this));
        window.removeEventListener("resize", this.handleResize.bind(this));
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight
        });
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
        this.animation.click();
        if (e.key === "`") {
            this.toggleDepth();
        }
    }

    handleKeyUp(e) {
        this.animation.unclick();
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

    toggleDepth(depth = null) {
        if (!depth) {
            depth = this.state.depth + 1;
        }

        if (depth > 3) {
            depth = 0;
        }

        this.setState({ depth }, this.reloadData.bind(this));
    }

    render() {
        return (
            <>
                <div className="absolute top-0 right-0 bottom-0 z-20 flex justify-center items-center w-10 h-full">
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={this.state.depth}
                        className="depth-slider"
                        onChange={(e) => this.toggleDepth(parseInt(e.target.value))}
                    />
                </div>
                <ForceGraph3D
                    ref={this.graphRef}
                    width={this.state.width}
                    height={this.state.height}
                    graphData={this.state.data}
                    showNavInfo={false}
                    backgroundColor="#ffffff"
                    linkColor={(link) => {
                        return link.color || "#333333";
                    }}
                    nodeThreeObject={Node.nodeThreeObject}
                    linkDirectionalArrowLength={(link) => {
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
