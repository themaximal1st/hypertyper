import React from "react";

import Animation from "./Animation";
import License from "./components/License";
import Console from "./components/Console";
import Filters from "./components/Filters";
import Splash from "./components/Splash";
import Typer from "./components/Typer";
import Interwingle from "./components/Interwingle";

import Depth from "./components/Depth";
import Footer from "./components/Footer";
import ForceGraph from "./components/ForceGraph";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.consoleRef = React.createRef();
        this.graphRef = React.createRef();
        this.depthRef = React.createRef();
        this.animation = new Animation(this.graphRef);
        this.state = {
            loaded: false,
            error: null,

            showConsole: false,
            showLicense: false,

            licenseKey: "",
            licenseValid: undefined,
            trialExpired: false,
            trialRemaining: 0,

            width: window.innerWidth,
            height: window.innerHeight,

            controlType: "orbit",

            hideLabelsThreshold: 1000,
            hideLabels: true,
            isAnimating: false,

            interwingle: 0,
            input: "",
            hyperedge: [],
            hyperedges: [],
            filters: [],
            depth: 0,
            maxDepth: 0,
            data: { nodes: [], links: [] },
        };
    }

    reloadData(controlType = null, zoom = true) {
        return new Promise(async (resolve, reject) => {
            const start = Date.now();

            console.log("INTERWINGLE", this.state.interwingle);
            console.log("DEPTH", this.state.depth);

            const data = await window.api.forceGraph.graphData(
                this.state.filters,
                {
                    interwingle: this.state.interwingle,
                    depth: this.state.depth,
                }
            );

            let depth = this.state.depth;
            const maxDepth = data.maxDepth || 0;
            if (depth > maxDepth) depth = maxDepth;

            const hyperedges = await window.api.hyperedges.all();

            const state = {
                data,
                depth,
                maxDepth,
                loaded: true,
                hyperedges,
                hideLabels: data.nodes.length >= this.state.hideLabelsThreshold,
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
        ForceGraph.load(this.graphRef);

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));
        window.api.messages.receive(
            "message-from-main",
            this.handleMessageFromMain.bind(this)
        );

        this.fetchLicenseInfo();

        this.reloadData();

        window.api.analytics.track("app.load");
    }

    componentWillUnmount() {
        this.animation.stop();
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
        document.removeEventListener("keyup", this.handleKeyUp.bind(this));
        document.removeEventListener(
            "mousedown",
            this.handleMouseDown.bind(this)
        );
        document.removeEventListener("mouseup", this.handleMouseUp.bind(this));
        document.removeEventListener("wheel", this.handleZoom.bind(this));
        window.removeEventListener("resize", this.handleResize.bind(this));
    }

    async fetchLicenseInfo() {
        const license = await window.api.licenses.info();
        this.setState(license, async () => {
            await this.validateAccess();
        });
    }

    handleMessageFromMain(event, message) {
        switch (event) {
            case "show-license-info":
                this.setState({ showLicense: true });
                break;
            default:
                console.log("MESSAGE", event, message);
        }
    }

    get isFocusingInput() {
        return document.activeElement == this.inputRef.current;
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
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
            window.api.analytics.track("app.toggleConsole");
            // if (!this.isFocusingInput) {
            this.setState({ showConsole: !this.state.showConsole }, () => {
                this.consoleRef.current.scrollTop =
                    this.consoleRef.current.scrollHeight;
            });
            // }
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
            } else {
                this.inputRef.current.focus();
            }
        } else if (this.state.controlType === "fly") {
            return;
        } else if (this.state.trialExpired || this.state.showLicense) {
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
                hyperedge: [],
            });
            return;
        }

        await window.api.hyperedges.add(this.state.hyperedge, this.state.input);

        this.setState(
            {
                input: "",
                hyperedge: [...this.state.hyperedge, this.state.input],
            },
            async () => {
                await this.reloadData();
            }
        );
    }

    handleClickNode(node, e) {
        console.log("CLICK NODE", node);
        window.api.analytics.track("app.clickNode");
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

        const distance = Math.sqrt(
            cameraPosition.x ** 2 + cameraPosition.z ** 2
        );

        const initialAngle = Math.atan2(cameraPosition.x, cameraPosition.z);

        const rotationRadians = angleDegrees * (Math.PI / 180);
        const newAngle = initialAngle + rotationRadians;

        const x = distance * Math.sin(newAngle);
        const z = distance * Math.cos(newAngle);

        this.graphRef.current.cameraPosition(
            { x, y: cameraPosition.y, z },
            null,
            100
        );
    }

    toggleLabels() {
        window.api.analytics.track("app.toggleLabels");
        this.setState({ hideLabels: !this.state.hideLabels }, () => {
            this.graphRef.current.refresh();
        });
    }

    toggleCamera() {
        window.api.analytics.track("app.toggleCamera");
        const controlType =
            this.state.controlType === "orbit" ? "fly" : "orbit";
        this.reloadData(controlType);
    }

    toggleAnimation() {
        window.api.analytics.track("app.toggleAnimation");
        if (this.state.isAnimating) {
            this.animation.stop();
        } else {
            this.animation.start();
        }

        this.setState({ isAnimating: !this.state.isAnimating });
    }

    toggleInterwingle(interwingle) {
        window.api.analytics.track("app.toggleInterwingle");
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
        window.api.analytics.track("app.toggleDepth");
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

    removeIndexFromHyperedge(index) {
        const hyperedge = this.state.hyperedge;
        hyperedge.splice(index, 1);
        this.setState({ hyperedge });
    }

    removeFilterSymbol(filter, symbol) {
        window.api.analytics.track("app.removeFilterSymbol");
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

    async validateAccess() {
        const state = {
            licenseValid: false,
            trialExpired: this.state.trialRemaining <= 0,
        };

        if (this.state.licenseKey) {
            state.licenseValid = await window.api.licenses.validate(
                this.state.licenseKey
            );

            if (state.licenseValid) {
                await window.api.settings.set("license", this.state.licenseKey);
                state.error = null;
            } else {
                state.error = "License is not valid";
            }
        }

        this.setState(state);
    }

    async activateLicense(e) {
        e.preventDefault();
        await this.validateAccess();
    }

    async deactivateLicense() {
        await window.api.settings.set("license", null);
        await window.api.settings.set("lastValidated", null);
        this.setState({ licenseKey: "", licenseValid: false }, async () => {
            await this.fetchLicenseInfo();
        });
    }

    async createHyperTyperTutorial() {
        if (this.state.hyperedges.length > 0) return;

        const tutorial = [
            ["HyperTyper", "is a", "Mind Mapper"],
            ["HyperTyper", "is a", "knowledge graph"],
            ["HyperTyper", "connects", "ideas"],
            ["HyperTyper", "let's you", "create"],
            ["HyperTyper", "let's you", "explore"],
            ["ideas", "press tab"],
            ["create", "type anything and press enter"],
            ["explore", "click any text"],
            ["knowledge graph", "press `"],
        ];

        for (const hyperedge of tutorial) {
            const last = hyperedge.pop();
            await window.api.hyperedges.add(hyperedge, last);
        }
        this.setState({ interwingle: 3, depth: -1 }, async () => {
            await this.reloadData();
            console.log(this.state.hyperedges);
        });
        console.log("CREATING TUTORIAL");
    }

    render() {
        return (
            <>
                <Splash
                    loaded={this.state.loaded}
                    hyperedges={this.state.hyperedges}
                    createTutorial={this.createHyperTyperTutorial.bind(this)}
                    licenseValid={this.state.licenseValid}
                    input={this.state.input}
                    trialRemaining={this.state.trialRemaining}
                    showLicense={() => this.setState({ showLicense: true })}
                />
                <a id="titlebar">HyperTyper</a>
                <License
                    licenseKey={this.state.licenseKey}
                    licenseValid={this.state.licenseValid}
                    trialExpired={this.state.trialExpired}
                    trialRemaining={this.state.trialRemaining}
                    showLicense={this.state.showLicense}
                    activateLicense={this.activateLicense.bind(this)}
                    deactivateLicense={this.deactivateLicense.bind(this)}
                    error={this.state.error}
                    updateLicenseKey={(licenseKey) =>
                        this.setState({ licenseKey })
                    }
                    closeLicense={() => this.setState({ showLicense: false })}
                />
                <Console
                    consoleRef={this.consoleRef}
                    showConsole={this.state.showConsole}
                    hyperedges={this.state.hyperedges}
                    removeHyperedge={this.removeHyperedge.bind(this)}
                />
                <Filters
                    filters={this.state.filters}
                    removeFilter={this.removeFilterSymbol.bind(this)}
                />
                <Interwingle
                    interwingle={this.state.interwingle}
                    toggleInterwingle={this.toggleInterwingle.bind(this)}
                />
                <Depth
                    depthRef={this.depthRef}
                    depth={this.state.depth}
                    maxDepth={this.state.maxDepth}
                    toggleDepth={this.toggleDepth.bind(this)}
                />
                <Typer
                    inputRef={this.inputRef}
                    input={this.state.input}
                    addInput={this.handleAddInput.bind(this)}
                    removeIndex={this.removeIndexFromHyperedge.bind(this)}
                    changeInput={(e) =>
                        this.setState({ input: e.target.value })
                    }
                    hyperedge={this.state.hyperedge}
                    show={!this.state.showConsole}
                />
                <ForceGraph
                    graphRef={this.graphRef}
                    data={this.state.data}
                    width={this.state.width}
                    height={this.state.height}
                    controlType={this.state.controlType}
                    hideLabels={this.state.hideLabels}
                    onNodeClick={this.handleClickNode.bind(this)}
                    showLabels={!this.state.hideLabels}
                />
                <Footer
                    isAnimating={this.state.isAnimating}
                    controlType={this.state.controlType}
                    toggleCamera={this.toggleCamera.bind(this)}
                    toggleAnimation={this.toggleAnimation.bind(this)}
                />
            </>
        );
    }
}
