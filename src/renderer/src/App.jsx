import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import VisualHypergraph from "./Hypergraph";
import VisualNode from "./Node";
import Animation from "./Animation";

// BIG THINGS TO DO TODAY
// 1. We want to search / filter down hypergraph
// 2. We want to add / create new
// 3. We want the console looking good
// 4. pagerank node/text size...pagerank stress test large files

// TODO: Whole hypergraph is obviously overhwleming...so click to filter down onto nodes/edges
// TODO: when creating scope down context
// TODO: super sweet console!

// TODO: [ ] get dynamic updates working well
// TODO: [ ] get integrated with backend
// TODO: [ ] implement pagerank for node and text size!
// TODO: animations on big graphs is annoying
// TODO: allow camera fly through...regenerate graph if you have to
// TODO: long text nodes should be truncated
// TODO: should have numerical zoom, plus and minus keys

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.graphRef = React.createRef();
        this.animation = new Animation(this.graphRef);
        this.cameraPosition = { x: 0, y: 0, z: 0 };
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
            showHistory: false,
            interwingle: 3,
            input: "",
            hyperedge: [],
            hypergraph: [],
            // hypergraph: [
            //     ["Ted Nelson", "invented", "HyperText"],
            //     ["Ted Nelson", "invented", "Xanadu"],
            //     ["Ted Nelson", "invented", "HyperMedia"],
            //     ["Ted Nelson", "invented", "ZigZag"],
            //     ["Ted Nelson", "author", "Lib Machines"],

            //     ["Tim Berners-Lee", "invented", "WWW"],
            //     ["Tim Berners-Lee", "author", "Weaving the Web"],

            //     ["HyperText", "influenced", "WWW"],

            //     ["Vannevar Bush", "invented", "Memex"],
            //     ["Vannevar Bush", "author", "As We May Think"],
            //     ["As We May Think", "influenced", "HyperText"]
            // ],
            colors: [],

            data: { nodes: [], links: [] }
        };
    }

    reloadData() {
        // TODO: Loading screen

        window.api.hypergraph.all().then((hyperedges) => {
            const hypergraph = new VisualHypergraph(hyperedges, {
                interwingle: this.state.interwingle
            });

            const edges = hypergraph.edgeSearch(["Aleister"]).map((edge) => edge.symbols);
            console.log("EDGES", edges);

            const hypergraph1 = new VisualHypergraph(edges, {
                interwingle: this.state.interwingle
            });

            const data = hypergraph1.graphData();

            this.setState({ hypergraph: edges, data });
        });
        /*

        this.animation.pause();
        this.setState({ data: hypergraph.graphData() }, () => {
            setTimeout(() => {
                this.animation.resume();
            }, 1000);
        });
        */
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

        // this.animation.start();
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
        if (e.key === "Tab") {
            this.toggleInterwingle();
        } else if (e.key === "`") {
            this.setState({ showHistory: !this.state.showHistory });
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

    toggleInterwingle(interwingle) {
        if (typeof interwingle === "undefined") {
            interwingle = this.state.interwingle;
            interwingle++;
        }

        if (interwingle > 3) interwingle = 0;

        this.setState({ interwingle }, this.reloadData.bind(this));
    }

    render() {
        return (
            <>
                <a id="titlebar">HyperTyper</a>
                {this.state.showHistory && (
                    <div className="absolute top-0 left-0 right-0 z-20 text-sm p-2 bg-white/50 max-h-[200px] overflow-y-scroll">
                        {this.state.hypergraph.map((edge, i) => {
                            return (
                                <div className="flex gap-3" key={`${edge.join("->")}-${i}}`}>
                                    {edge
                                        .map((node, j) => {
                                            return (
                                                <div key={`${node}-${j}`} className="w-36 truncate">
                                                    {node}
                                                </div>
                                            );
                                        })
                                        .reduce((prev, curr) => [prev, " → ", curr])}
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="absolute top-0 right-0 bottom-0 z-20 flex justify-center items-center w-10 h-full">
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={this.state.interwingle}
                        className="interwingle-slider"
                        onChange={(e) => this.toggleInterwingle(parseInt(e.target.value))}
                    />
                </div>
                <ForceGraph3D
                    ref={this.graphRef}
                    width={this.state.width}
                    height={this.state.height}
                    graphData={this.state.data}
                    showNavInfo={false}
                    // backgroundColor="#ffffff"
                    linkColor={(link) => {
                        return link.color || "#333333";
                    }}
                    nodeThreeObject={VisualNode.nodeThreeObject}
                    linkDirectionalArrowLength={(link) => {
                        return 5;
                    }}
                    linkDirectionalArrowRelPos={1}
                    linkWidth={2}
                />
            </>
        );
    }
}
