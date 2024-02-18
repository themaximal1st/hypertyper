import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import "ldrs/quantum";

import SpriteText from "three-spritetext";
import * as Three from "three";

import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Animation from "./Animation";

import * as Icons from "./Icons";

// TODO
// Save
// Load
// 1. We want to search / filter down hypergraph
// 5. UI for syncing data
// 4. pagerank node/text size...pagerank stress test large files

// TODO: click to filter down onto nodes/edges
// TODO: when creating...scope down context
// TODO: super sweet console!
// TODO: should have numerical zoom, plus and minus keys

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.consoleRef = React.createRef();
        this.graphRef = React.createRef();
        this.interwingleRef = React.createRef();
        this.nodeThreeObjectCache = {};
        this.animation = new Animation(this.graphRef);
        this.state = {
            width: window.innerWidth,
            controlType: "orbit",
            height: window.innerHeight,
            hideLabelsThreshold: 1000,
            hideLabels: true,
            showConsole: true,
            interwingle: 0,
            isAnimating: false,
            input: "",
            hyperedge: [],
            hyperedges: [],
            colors: [],

            data: { nodes: [], links: [] }
        };
    }

    reloadData(controlType = null, zoom = true) {
        return new Promise(async (resolve, reject) => {
            const start = Date.now();

            const options = { interwingle: this.state.interwingle };
            const data = await window.api.forceGraph.graphData(options);
            const hyperedges = await window.api.hyperedges.all();

            console.log(hyperedges);

            const state = {
                data,
                hyperedges,
                hideLabels: data.nodes.length >= this.state.hideLabelsThreshold
            };

            if (controlType) {
                state.controlType = controlType;
            }

            const elapsed = Date.now() - start;
            console.log(`reloaded data in ${elapsed}ms`);

            this.setState(state, () => {
                if (zoom) {
                    setTimeout(() => {
                        this.graphRef.current.zoomToFit(300, 100, (node) => {
                            return this.state.hyperedge.indexOf(node.name) > -1;
                        });
                        resolve();
                    }, 250);
                } else {
                    resolve();
                }
            });
        });
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

        // const planeGeometry = new Three.PlaneGeometry(10000, 10000, 1, 1);
        // const planeMaterial = new Three.MeshLambertMaterial({
        //     color: 0x030303,
        //     side: Three.DoubleSide
        // });

        // const mesh = new Three.Mesh(planeGeometry, planeMaterial);
        // mesh.position.set(-100, -200, -100);
        // mesh.rotation.set(0.5 * Math.PI, 0, 0);
        // this.graphRef.current.scene().add(mesh);

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        this.reloadData();
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

    get isFocusingInput() {
        return document.activeElement == this.inputRef.current;
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
        if (e.key === "Tab") {
            this.toggleInterwingle();
        } else if (e.key === "F1") {
            this.toggleLabels();
        } else if (e.key === "F2") {
            this.toggleCamera();
        } else if (e.key === "`") {
            if (!this.isFocusingInput) {
                this.setState({ showConsole: !this.state.showConsole });
            }
        } else if (e.key === "-") {
            if (!this.isFocusingInput) {
                this.zoom(30);
            }
        } else if (e.key === "=") {
            if (!this.isFocusingInput) {
                this.zoom(-30);
            }
        } else if (e.key === "ArrowLeft") {
            this.rotate(-10);
        } else if (e.key === "ArrowRight") {
            this.rotate(10);
        } else if (e.key === "Backspace") {
            if (this.state.input === "") {
                this.setState({ hyperedge: this.state.hyperedge.slice(0, -1) });
            }
        } else if (this.state.controlType === "fly") {
            return;
        } else {
            this.inputRef.current.focus();
        }
    }

    handleKeyUp(e) {
        this.animation.stopInteracting();
    }

    async handleAddInput(e) {
        e.preventDefault();

        if (this.state.input.trim().length === 0) {
            this.setState({
                input: "",
                hyperedge: []
            });
            return;
        }

        await window.api.hyperedges.add(this.state.hyperedge, this.state.input);

        this.setState(
            {
                input: "",
                hyperedge: [...this.state.hyperedge, this.state.input]
            },
            async () => {
                await this.reloadData();
            }
        );
    }

    handleClickNode(node) {
        console.log("NODE", node);
    }

    // this doesn't really work
    zoom(amount = 0) {
        const cameraPosition = this.graphRef.current.cameraPosition();
        this.graphRef.current.cameraPosition({ z: cameraPosition.z + amount });
    }

    // this doesn't really work
    rotate(angleDegrees) {
        const cameraPosition = this.graphRef.current.cameraPosition();

        const distance = Math.sqrt(cameraPosition.x ** 2 + cameraPosition.z ** 2);

        const initialAngle = Math.atan2(cameraPosition.x, cameraPosition.z);

        const rotationRadians = angleDegrees * (Math.PI / 180);
        const newAngle = initialAngle + rotationRadians;

        const x = distance * Math.sin(newAngle);
        const z = distance * Math.cos(newAngle);

        this.graphRef.current.cameraPosition({ x, y: cameraPosition.y, z }, null, 100);
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

    removeIndexFromHyperedge(index) {
        const hyperedge = this.state.hyperedge;
        hyperedge.splice(index, 1);
        this.setState({ hyperedge });
    }

    async removeHyperedge(hyperedge) {
        console.log("REMOVE HYPEREDGE", hyperedge);
        await window.api.hyperedges.remove(hyperedge);
        await this.reloadData();
    }

    render() {
        const forceGraph = (
            <ForceGraph3D
                ref={this.graphRef}
                width={this.state.width}
                controlType={this.state.controlType}
                backgroundColor="#000000"
                height={this.state.height}
                onNodeClick={this.handleClickNode.bind(this)}
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
                {this.state.showConsole && (
                    <div
                        id="console"
                        ref={this.consoleRef}
                        className="bg-white/10 text-white flex flex-col h-full w-full absolute z-20 max-h-[300px] overflow-y-scroll"
                    >
                        <div className="grow"></div>
                        <div>
                            <table className="w-auto">
                                <tbody>
                                    {this.state.hyperedges.map((edge, i) => {
                                        console.log(edge.join("->"), i);
                                        return (
                                            <tr key={`${edge.join("->")}-${i}}`}>
                                                {edge.map((node, j) => {
                                                    return (
                                                        <React.Fragment key={`${node}-${j}-group`}>
                                                            <td
                                                                key={`${node}-${j}`}
                                                                className="p-2"
                                                            >
                                                                <a
                                                                    onClick={(e) =>
                                                                        this.removeHyperedge(edge)
                                                                    }
                                                                    className="cursor-pointer"
                                                                >
                                                                    {node}
                                                                </a>
                                                            </td>
                                                            {j < edge.length - 1 && (
                                                                <td key={`${node}-${i}-sep`}>→</td>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
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
                        className="opacity-20 hover:opacity-100 transition-all cursor-pointer"
                    >
                        {!this.state.isAnimating && Icons.PauseIcon}
                        {this.state.isAnimating && Icons.RotateIcon}
                    </a>
                    <a
                        onClick={() => this.toggleCamera()}
                        className="opacity-20 hover:opacity-100 transition-all cursor-pointer"
                    >
                        {this.state.controlType === "orbit" && Icons.CameraIcon}
                        {this.state.controlType === "fly" && Icons.MouseIcon}
                    </a>
                </div>
                {!this.state.showConsole && (
                    <div className="flex text-white mt-8 text-sm gap-2 px-2 absolute z-20 w-full">
                        {this.state.hyperedge.map((symbol, i) => {
                            return (
                                <div className="flex gap-2 items-center" key={i}>
                                    <a
                                        onClick={(e) => this.removeIndexFromHyperedge(i)}
                                        className="cursor-pointer"
                                    >
                                        {symbol}
                                    </a>
                                    →
                                </div>
                            );
                        })}

                        <form onSubmit={this.handleAddInput.bind(this)} className="">
                            <input
                                type="text"
                                ref={this.inputRef}
                                className="bg-transparent outline-none text-4xl text-center absolute z-30 left-0 right-0 top-4 py-2"
                                value={this.state.input}
                                onChange={(e) => this.setState({ input: e.target.value })}
                            />
                        </form>
                    </div>
                )}
                {this.state.controlType === "fly" && forceGraph}
                {this.state.controlType === "orbit" && forceGraph}
            </>
        );
    }
}
