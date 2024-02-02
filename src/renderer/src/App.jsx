import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import "ldrs/quantum";

import SpriteText from "three-spritetext";
import * as Three from "three";

import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Hypergraph from "./Hypergraph";
import Node from "./Node";
import Animation from "./Animation";

import * as Icons from "./Icons";

// TODO
// 1. We want to search / filter down hypergraph
// 2. We want to add / create new
// 3. We want the console looking good
// 5. UI for syncing data
// 4. pagerank node/text size...pagerank stress test large files

// TODO: click to filter down onto nodes/edges
// TODO: when creating...scope down context
// TODO: super sweet console!
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
            controlType: "orbit",
            height: window.innerHeight,
            hideLabelsThreshold: 10000,
            hideLabels: true,
            showHistory: false,
            interwingle: 1,
            isLoaded: false,
            isLoading: true,
            isAnimating: false,
            input: "",
            hyperedge: [],
            hypergraph: [],
            colors: [],

            data: { nodes: [], links: [] }
        };
    }

    reloadData(controlType = null) {
        // TODO: Loading screen

        const hyperedges = [
            ["Ted Nelson", "invented", "HyperText"],
            ["Ted Nelson", "invented", "Xanadu"],
            ["Ted Nelson", "invented", "HyperMedia"],
            ["Ted Nelson", "invented", "ZigZag"],
            ["Ted Nelson", "author", "Computer Lib/Dream Machines"],
            ["Tim Berners-Lee", "invented", "WWW"],
            ["Tim Berners-Lee", "author", "Weaving the Web"],
            ["HyperText", "influenced", "WWW"],
            ["Vannevar Bush", "invented", "Memex"],
            ["Vannevar Bush", "author", "As We May Think"],
            ["As We May Think", "influenced", "HyperText"]
        ];

        console.log("RELOAD DATA");
        // window.api.hypergraph.all().then((hyperedges) => {
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
        // });
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

        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        this.graphRef.current.postProcessingComposer().addPass(bloomPass);

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        this.reloadData();

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
        this.animation.interact();
    }

    handleMouseUp(e) {
        this.animation.stopInteracting();
    }

    handleKeyDown(e) {
        this.animation.interact();
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
        this.animation.stopInteracting();
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

    toggleAnimation() {
        if (this.state.isAnimating) {
            this.animation.stop();
        } else {
            this.animation.start();
        }

        this.setState({ isAnimating: !this.state.isAnimating });
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
        // console.log("NODE THREE OBJECT");

        if (node.bridge) {
            const mesh = new Three.Mesh(
                new Three.SphereGeometry(1),
                new Three.MeshLambertMaterial({
                    color: "#000000",
                    transparent: true,
                    opacity: 0.25
                })
            );
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

        return sprite;
    }

    handleTick() {
        if (!this.state.isLoading) return false;
        this.setState({ isLoading: false });
        console.log("TICK");
    }

    render() {
        const forceGraph = (
            <ForceGraph3D
                ref={this.graphRef}
                onEngineTick={this.handleTick.bind(this)}
                width={this.state.width}
                controlType={this.state.controlType}
                backgroundColor="#000000"
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
        );
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
                        onClick={() => this.toggleAnimation()}
                        className="opacity-50 hover:opacity-100 transition-all cursor-pointer"
                    >
                        {!this.state.isAnimating && Icons.PauseIcon}
                        {this.state.isAnimating && Icons.RotateIcon}
                    </a>
                    <a
                        onClick={() => this.toggleCamera()}
                        className="opacity-50 hover:opacity-100 transition-all cursor-pointer"
                    >
                        {this.state.controlType === "orbit" && Icons.CameraIcon}
                        {this.state.controlType === "fly" && Icons.MouseIcon}
                    </a>
                </div>
                {this.state.controlType === "fly" && forceGraph}
                {this.state.controlType === "orbit" && forceGraph}
            </>
        );
    }
}
