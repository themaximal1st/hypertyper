import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import * as Three from "three";

import Hypergraph from "./Hypergraph";

// TODO: [ ] Better depth UX
// TODO: [ ] Animation spinner (auto spin if no mouse movement for 5s?)
// TODO: [ ] get dynamic updates working well

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.graphRef = React.createRef();
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
        this.setState({ data: hypergraph.graphData() });
    }

    componentDidMount() {
        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        console.log("CURRENT", this.graphRef.current);

        this.reloadData();

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));

        this.startAnimation();
    }

    handleMouseDown(e) {
        if (this.mouseUpInterval) {
            clearTimeout(this.mouseUpInterval);
            this.mouseUpInterval = null;
        }

        this.isClicking = true;
        // this.stopAnimation();
    }

    handleMouseUp(e) {
        if (this.mouseUpInterval) return;

        this.mouseUpInterval = setTimeout(() => {
            this.isClicking = false;
        }, 1000);
    }

    startAnimation() {
        const initialPosition = this.graphRef.current.cameraPosition();
        this.distance = Math.sqrt(Math.pow(-5, 2) + Math.pow(-500, 2)); // Set the initial distance
        this.angle = Math.atan2(-5, -500); // Set the initial angle
        this.initialY = initialPosition.y; // Store the initial Y-coordinate

        const updateCameraPosition = () => {
            if (this.isClicking) {
                // Store the current position when starting to drag
                const currentPos = this.graphRef.current.cameraPosition();
                this.dragEndPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
                return;
            } else if (this.dragEndPosition) {
                // Recalculate the angle and distance based on the position when dragging stopped
                this.distance = Math.sqrt(
                    Math.pow(this.dragEndPosition.x, 2) + Math.pow(this.dragEndPosition.z, 2)
                );
                this.angle = Math.atan2(this.dragEndPosition.x, this.dragEndPosition.z);
                this.initialY = this.dragEndPosition.y; // Update the Y-coordinate
                this.dragEndPosition = null; // Reset the stored position
            }

            // Increment the angle for the animation
            this.angle += Math.PI / 1000;
            this.angle %= 2 * Math.PI; // Normalize the angle

            // Update camera position
            this.graphRef.current.cameraPosition({
                x: this.distance * Math.sin(this.angle),
                y: this.initialY, // Use the updated Y-coordinate
                z: this.distance * Math.cos(this.angle)
            });
        };

        this.animationInterval = setInterval(updateCameraPosition, 33); // About 30 FPS
    }

    /*
    startAnimation() {
        // const distance = 500;
        // this.graphRef.current.cameraPosition({ z: distance });
        // camera orbit
        let x = 1;
        this.interval = setInterval(() => {
            if (this.isClicking) return;
            this.graphRef.current.cameraPosition({
                x
                // z: distance * Math.cos(angle)
            });
            x++;
            // angle += Math.PI / 3000;
        }, 10);
    }
    */

    stopAnimation() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = null;
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
        let depth = this.state.depth;
        depth++;
        if (depth > 3) depth = 0;

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
                    onZoom={function () {
                        console.log("ZOOM");
                    }}
                    onNodeClick={(node) => {
                        console.log("CLICK");
                    }}
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
