import "ldrs/quantum";

import SpriteText from "three-spritetext";
import * as Three from "three";

import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Hypergraph from "./Hypergraph";
import Node from "./Node";
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
        this.interwingleRef = React.createRef();
        this.nodeThreeObjectCache = {};
        this.animation = new Animation(this.graphRef);
        this.cameraPosition = { x: 0, y: 0, z: 0 };
        this.state = {
            width: window.innerWidth,
            controlType: "fly",
            height: window.innerHeight,
            hideLabelsThreshold: 10000,
            hideLabels: true,
            showHistory: false,
            interwingle: 1,
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

    reloadData(controlType = null) {
        // TODO: Loading screen

        console.log("RELOAD DATA");
        window.api.hypergraph.all().then((hyperedges) => {
            console.log("GOT DATA");
            const hypergraph = new Hypergraph({
                interwingle: this.state.interwingle
            });

            hypergraph.addHyperedges(hyperedges);
            console.log("ADDED HYPERGRAPH");

            const data = hypergraph.graphData();
            console.log("GOT DATA");

            const state = {
                hypergraph: hyperedges,
                data,
                hideLabels: data.nodes.length >= this.state.hideLabelsThreshold
            };

            if (controlType) {
                state.controlType = controlType;
            }

            this.setState(state);
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

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        this.reloadData();

        // setInterval(() => {
        //     this.toggleCamera();
        // }, 5000);

        // his.animation.start();
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
        // console.log(e.key);
        if (e.key === "Tab") {
            this.toggleInterwingle();
        } else if (e.key === "F1") {
            this.toggleLabels();
        } else if (e.key === "F2") {
            this.toggleCamera();
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

    toggleLabels() {
        this.setState({ hideLabels: !this.state.hideLabels }, () => {
            this.graphRef.current.refresh();
        });
    }

    toggleCamera() {
        const controlType = this.state.controlType === "orbit" ? "fly" : "orbit";
        this.reloadData(controlType);
    }

    toggleInterwingle(interwingle) {
        if (typeof interwingle === "undefined") {
            interwingle = this.state.interwingle;
            interwingle++;
        }

        if (interwingle > 3) interwingle = 0;

        this.setState({ interwingle }, () => {
            setTimeout(() => {
                this.interwingleRef.current.blur();
            }, 50);

            this.reloadData();
        });
    }

    nodeThreeObject(node) {
        // if (this.nodeThreeObjectCache[node.id]) {
        //     return this.nodeThreeObjectCache[node.id];
        // }

        if (node.bridge) {
            const mesh = new Three.Mesh(
                new Three.SphereGeometry(1),
                new Three.MeshLambertMaterial({
                    color: "#000000",
                    transparent: true,
                    opacity: 0.25
                })
            );
            // this.nodeThreeObjectCache[node.id] = mesh;
            return mesh;
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

        // this.nodeThreeObjectCache[node.id] = sprite;

        return sprite;
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
                        ref={this.interwingleRef}
                        min="0"
                        max="3"
                        step="1"
                        value={this.state.interwingle}
                        className="interwingle-slider"
                        onChange={(e) => this.toggleInterwingle(parseInt(e.target.value))}
                    />
                </div>
                <div className="absolute text-white bottom-2 right-6 z-20 flex gap-4">
                    <a
                        onClick={() => this.toggleCamera()}
                        className="opacity-50 hover:opacity-100 transition-all"
                    >
                        {this.state.controlType === "orbit" && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                />
                            </svg>
                        )}

                        {this.state.controlType === "fly" && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                                />
                            </svg>
                        )}
                    </a>
                </div>
                {this.state.controlType === "fly" && (
                    <ForceGraph3D
                        ref={this.graphRef}
                        width={this.state.width}
                        controlType="fly"
                        height={this.state.height}
                        graphData={this.state.data}
                        showNavInfo={false}
                        linkColor={(link) => {
                            return link.color || "#333333";
                        }}
                        nodeThreeObject={(node) => {
                            if (this.state.hideLabels) {
                                return null;
                            }
                            return this.nodeThreeObject(node);
                        }}
                        linkDirectionalArrowLength={(link) => {
                            return 5;
                        }}
                        linkDirectionalArrowRelPos={1}
                        linkWidth={2}
                    />
                )}
                {this.state.controlType === "orbit" && (
                    <ForceGraph3D
                        ref={this.graphRef}
                        width={this.state.width}
                        controlType="orbit"
                        height={this.state.height}
                        graphData={this.state.data}
                        showNavInfo={false}
                        linkColor={(link) => {
                            return link.color || "#333333";
                        }}
                        nodeThreeObject={(node) => {
                            if (this.state.hideLabels) {
                                return null;
                            }
                            return this.nodeThreeObject(node);
                        }}
                        linkDirectionalArrowLength={(link) => {
                            return 5;
                        }}
                        linkDirectionalArrowRelPos={1}
                        linkWidth={2}
                    />
                )}
            </>
        );
    }
}
