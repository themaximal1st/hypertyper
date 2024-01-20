// CRAWL A GRAPH FORWARDS AND BACKWARDS
// TODO: Should be able to edit existing hyperedge nodes

import React from "react";

import Graph from "./components/Graph";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            input: "",
            hyperedgeIndex: -1,
            hyperedge: [],
            hypergraph: [],
            layout: {
                name: "cose-bilkent",
                padding: 75
            }
        };
    }

    get data() {
        if (this.state.hyperedge.length > 0) {
            return Object.values(this.search());
        } else {
            return Object.values(this.state.hypergraph);
        }
    }

    get autocomplete() {
        const data = new Set();
        for (const value of Object.values(this.state.hypergraph)) {
            if (value.data.label) {
                data.add(value.data.label);
            }
        }
        return Array.from(data);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keypress", this.handleKeyPress.bind(this));

        window.api.hypergraph.all().then((hyperedges) => {
            this.update(hyperedges);
        });

        window.ht_cy.on("resize", (e) => {
            console.log("RESIZE...RUN LAYOUT");
            this.layout();
        });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
        document.removeEventListener("keypress", this.handleKeyPress.bind(this));
    }

    async addCurrentInputToEdge() {
        const hyperedge = [...this.state.hyperedge, this.state.input];
        this.setState(
            {
                input: "",
                hyperedge,
                hyperedgeIndex: -1
            },
            async () => {
                this.incrementalUpdate(hyperedge);
                await window.api.hypergraph.add(hyperedge);
            }
        );
    }

    handleKeyPress(event) {
        if (this.state.hyperedgeIndex === -1) {
            this.inputRef.current.focus();
            if (event.key === "Enter" && this.state.input.length > 0) {
                this.addCurrentInputToEdge();
            }
        } else {
            this.setState({ hyperedgeIndex: -1 });
        }
    }

    handleKeyDown(event) {
        if (event.key === "ArrowLeft") {
            this.cycleHyperedgeIndex("left");
        } else if (event.key === "ArrowRight") {
            this.cycleHyperedgeIndex("right");
        } else if (event.key === "Backspace" && this.state.hyperedgeIndex > -1) {
            const hyperedge = [...this.state.hyperedge];
            hyperedge.splice(this.state.hyperedgeIndex, 1);
            this.setState({ hyperedge }, () => {
                this.cycleHyperedgeIndex("left");
                this.layout();
            });
        } else if (event.key === "Backspace" && this.state.hyperedgeIndex === -1) {
            if (!event.repeat && this.state.input === "") {
                this.cycleHyperedgeIndex("left");
            }
        }
    }

    handleSelectNode(node) {
        console.log("SELECT NODE");
    }

    update(hyperedges) {
        const hypergraph = this.hyperedgesToGraph(hyperedges);
        this.setState({ hypergraph }, () => {
            this.layout();
        });
    }

    incrementalUpdate(edge) {
        const hyperedge = this.hyperedgeToGraph(edge);
        const hypergraph = { ...this.state.hypergraph, ...hyperedge };
        this.setState({ hypergraph }, () => {
            this.layout();
        });
    }

    layout() {
        window.ht_cy.layout(this.state.layout).run();
    }

    render() {
        return (
            <div className="h-screen w-full flex flex-col">
                <div className="absolute flex z-20 p-1 gap-2 items-center">
                    {this.state.hyperedge
                        .map((item, i) => {
                            const classes = [];
                            if (this.state.hyperedgeIndex === i) {
                                classes.push("bg-gray-200");
                            } else {
                                classes.push("");
                            }

                            return (
                                <a
                                    onClick={(e) => {
                                        this.setState({ hyperedgeIndex: i });
                                    }}
                                    className={`rounded-md p-2 cursor-pointer ${classes.join(" ")}`}
                                    key={`${item}-${i}`}
                                >
                                    {item}
                                </a>
                            );
                        })
                        .reduce((accu, elem) => {
                            return accu === null ? [elem] : [...accu, " → ", elem];
                        }, null)}
                    {this.state.hyperedge.length > 0 && <div>→</div>}
                    <input
                        type="text"
                        autoFocus
                        placeholder="..."
                        className="outline-none rounded-lg p-2 bg-transparent"
                        ref={this.inputRef}
                        value={this.state.input}
                        list="suggestions"
                        autoComplete="false"
                        onChange={(e) => this.setState({ input: e.target.value })}
                    />

                    <datalist id="suggestions" className="flex flex-col gap-2 absolute">
                        {this.autocomplete.map((item) => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>
                </div>
                <Graph data={this.data} layout={this.state.layout} />
            </div>
        );
    }

    search() {
        const keys = Object.keys(this.hyperedgeToGraph(this.state.hyperedge));
        const hypergraph = {};
        for (const node of Object.keys(this.state.hypergraph)) {
            for (const key of keys) {
                if (node.indexOf(key) !== -1) {
                    hypergraph[node] = this.state.hypergraph[node];
                }
            }
        }

        return Object.values(hypergraph);
    }

    // utils
    cycleHyperedgeIndex(direction, callback = null) {
        if (direction !== "left" && direction !== "right") {
            throw new Error("invalid direction, must be left/right");
        }

        let blur = true;

        let hyperedgeIndex = this.state.hyperedgeIndex;
        if (this.state.hyperedgeIndex === -1) {
            if (direction === "left") {
                hyperedgeIndex = this.state.hyperedge.length - 1;
            } else if (direction === "right") {
                hyperedgeIndex = 0;
            }
        } else {
            if (direction === "left") {
                hyperedgeIndex = this.state.hyperedgeIndex - 1;
                if (hyperedgeIndex < 0) {
                    hyperedgeIndex = -1;
                    blur = false;
                }
            } else if (direction === "right") {
                hyperedgeIndex = this.state.hyperedgeIndex + 1;
                if (hyperedgeIndex > this.state.hyperedge.length - 1) {
                    hyperedgeIndex = -1;
                    blur = false;
                }
            }
        }

        if (blur) {
            this.inputRef.current.blur();
        } else {
            this.inputRef.current.focus();
        }
        this.setState({ hyperedgeIndex }, callback);
    }

    hyperedgesToGraph(hyperedges) {
        let hypergraph = {};
        for (const hyperedge of hyperedges) {
            hypergraph = {
                ...hypergraph,
                ...this.hyperedgeToGraph(hyperedge)
            };
        }
        return hypergraph;
    }

    hyperedgeToGraph(hyperedge) {
        const hypergraph = {};
        const edge = [];
        for (const node of hyperedge) {
            const prev_id = edge.join("-");

            edge.push(node);
            let id = edge.join("-");

            hypergraph[id] = { data: { id, label: node } };
            if (edge.length > 1) {
                const edge_id = `${id}-edge`;
                hypergraph[edge_id] = { data: { id: edge_id, source: prev_id, target: id } };
            }
        }

        return hypergraph;
    }
}
