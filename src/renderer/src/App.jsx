import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Hypergraph from "./Hypergraph";
import Node from "./Node";
import Animation from "./Animation";

// TODO: [ ] get dynamic updates working well
// TODO: [ ] get integrated with backend
// TODO: [ ] implement pagerank for node and text size!
// TODO: animations on big graphs is annoying
// TODO: allow camera fly through...regenerate graph if you have to
// TODO: performance optimizations...run through them in tests and see what can be made faster or if any dump stuff is happening
// TODO: long text nodes should be truncated
// TODO: should have numerical zoom, plus and minus keys
// TODO: Look into returning raw symbols/arrays rather than objects. maybe electron bridge is slow?

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

        console.log("RELOAD DATA");
        window.api.hypergraph.all().then((hyperedges) => {
            console.log("GOT ALL");
            const hypergraph = new Hypergraph(hyperedges, {
                interwingle: this.state.interwingle
            });

            console.log(hypergraph);

            console.log("INIT HYPERGRAPH");

            // const data = hypergraph.graphData();
            // console.log("INIT DATA");

            /*
            this.setState({ hypergraph: hyperedges, data }, () => {
                console.log("SET STATE");
                // console.log(hypergraph);
            });
            */

            // this.update(hyperedges);
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
