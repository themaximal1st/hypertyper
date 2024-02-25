import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import "ldrs/quantum";

import SpriteText from "three-spritetext";
import * as Three from "three";

import React from "react";
import ForceGraph3D from "react-force-graph-3d";

import Animation from "./Animation";

import * as Icons from "./Icons";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.consoleRef = React.createRef();
        this.graphRef = React.createRef();
        this.depthRef = React.createRef();
        this.nodeThreeObjectCache = {};
        this.animation = new Animation(this.graphRef);
        this.state = {
            width: window.innerWidth,
            controlType: "orbit",
            height: window.innerHeight,
            hideLabelsThreshold: 1000,
            hideLabels: true,
            showConsole: false,
            interwingle: 0,
            isAnimating: false,
            input: "",
            hyperedge: [],
            hyperedges: [],
            filters: [],
            depth: 0,
            maxDepth: 0,
            colors: [],
            data: { nodes: [], links: [] }
        };
    }

    reloadData(controlType = null, zoom = true) {
        return new Promise(async (resolve, reject) => {
            const start = Date.now();

            const data = await window.api.forceGraph.graphData(this.state.filters, {
                interwingle: this.state.interwingle,
                depth: this.state.depth
            });

            let depth = this.state.depth;
            const maxDepth = data.maxDepth || 0;
            if (depth > maxDepth) depth = maxDepth;

            const hyperedges = await window.api.hyperedges.all();

            const state = {
                data,
                depth,
                maxDepth,
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
                        this.graphRef.current.zoomToFit(300, 100);
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
                this.setState({ showConsole: !this.state.showConsole }, () => {
                    this.consoleRef.current.scrollTop = this.consoleRef.current.scrollHeight;
                });
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
        } else if (e.key === "ArrowDown") {
            this.toggleDepth(this.state.depth - 1);
        } else if (e.key === "ArrowUp") {
            this.toggleDepth(this.state.depth + 1);
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

    handleClickNode(node, e) {
        const filters = this.state.filters;
        if (e.shiftKey) {
            if (filters.length === 0) {
                filters.push([]);
            }

            filters[filters.length - 1].push(node.name);
        } else {
            filters.push([node.name]);
        }

        console.log("FILTERS", filters);

        this.setState({ filters }, () => {
            this.reloadData();
        });
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
            this.reloadData();
        });
    }

    toggleDepth(depth) {
        if (typeof depth === "undefined") {
            depth = this.state.depth;
            depth++;
        }

        if (depth > this.state.maxDepth) depth = this.state.maxDepth;
        if (depth < 0) depth = 0;

        this.setState({ depth }, () => {
            setTimeout(() => {
                if (this.depthRef.current) {
                    this.depthRef.current.blur();
                }
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

    removeFilterSymbol(filter, symbol) {
        const filters = this.state.filters;
        const indexOf = filters.indexOf(filter);
        filter.splice(filter.indexOf(symbol), 1);
        if (filter.length === 0) {
            filters.splice(indexOf, 1);
        } else {
            filters[indexOf] = filter;
        }
        this.setState({ filters }, () => {
            this.reloadData();
        });
    }

    async removeHyperedge(hyperedge) {
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
                <div
                    id="console"
                    ref={this.consoleRef}
                    className={`bg-white/10 text-white h-full w-full absolute z-40 max-h-[300px] overflow-y-scroll ${this.state.showConsole ? "flex flex-col" : "hidden"}`}
                >
                    <div className="grow"></div>
                    <div>
                        <table className="w-auto">
                            <tbody>
                                {this.state.hyperedges.map((edge, i) => {
                                    return (
                                        <tr key={`${edge.join("->")}-${i}}`}>
                                            {edge.map((node, j) => {
                                                return (
                                                    <React.Fragment key={`${node}-${j}-group`}>
                                                        <td key={`${node}-${j}`} className="p-1">
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
                <div className="text-white absolute z-40 left-1 right-0 top-8 h-20 flex flex-col gap-1 p-2">
                    {this.state.filters.map((filter, i) => {
                        return (
                            <div key={`${filter}-${i}`} className="flex gap-2">
                                {filter.map((symbol, j) => {
                                    return (
                                        <a
                                            key={`${symbol}-${j}`}
                                            className="cursor-pointer text-sm opacity-50 hover:opacity-100 transition-all"
                                            onClick={(e) => this.removeFilterSymbol(filter, symbol)}
                                        >
                                            {symbol}
                                        </a>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                <div className="absolute top-0 left-1 bottom-0 z-20 flex justify-center items-center w-12 h-full flex-col gap-8 opacity-50 hover:opacity-100 transition-all">
                    <a
                        onClick={(e) => this.toggleInterwingle(3)}
                        className={`cursor-pointer ${this.state.interwingle == 3 ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all`}
                    >
                        <img src="src/assets/interwingle-3.png" className="w-7 h-7" />
                    </a>
                    <a
                        onClick={(e) => this.toggleInterwingle(2)}
                        className={`cursor-pointer ${this.state.interwingle == 2 ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all`}
                    >
                        <img src="src/assets/interwingle-2.png" className="w-7 h-7" />
                    </a>
                    <a
                        onClick={(e) => this.toggleInterwingle(1)}
                        className={`cursor-pointer ${this.state.interwingle == 1 ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all`}
                    >
                        <img src="src/assets/interwingle-1.png" className="w-7 h-7" />
                    </a>
                    <a
                        onClick={(e) => this.toggleInterwingle(0)}
                        className={`cursor-pointer ${this.state.interwingle == 0 ? "opacity-100" : "opacity-50"} hover:opacity-100 transition-all`}
                    >
                        <img src="src/assets/interwingle-0.png" className="w-7 h-7" />
                    </a>
                </div>
                {this.state.maxDepth > 0 && (
                    <div className="absolute top-0 right-0 bottom-0 z-20 flex justify-center items-center w-12 h-full text-white">
                        <input
                            type="range"
                            ref={this.depthRef}
                            min="0"
                            max={this.state.maxDepth}
                            step="1"
                            value={this.state.depth}
                            className="depth-slider"
                            onChange={(e) => this.toggleDepth(parseInt(e.target.value))}
                        />
                    </div>
                )}

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
