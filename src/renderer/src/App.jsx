// TODO: Need to do incremental updates to the graph. Currently it's just rebuilding the whole thing every time

// TODO: add nodes dynamically
// TODO: do some graph simplification. only create connection node if more than 1 connection or if it ends in what would be a connection node

import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

const colorPalette = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e"
];
function stringToColor(str, colors = colorPalette) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the modulo operator to map the hash to an index within the colors array
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.graphRef = React.createRef();
        this.state = {
            isConnected: true,
            input: "",
            hyperedge: [],
            colors: [],

            data: { nodes: [], links: [] },

            hypergraph: [
                ["Ted Nelson", "invented", "HyperText"],
                ["HyperText", "influenced", "WWW"]
                // ["Tim Berners-Lee", "invented", "WWW"]
                // ["Tim Berners-Lee", "author", "Weaving the Web"],
                // ["Ted Nelson", "author", "Lib Machines"],
                // ["Ted Nelson", "invented", "HyperMedia"],
                // ["Ted Nelson", "invented", "Xanadu"],
                // ["Ted Nelson", "invented", "ZigZag"],
                // ["Vannevar Bush", "invented", "Memex"],
                // ["Vannevar Bush", "author", "As We May Think"]
            ]
        };
    }

    componentDidMount() {
        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        const data = this.hypergraphToForceGraph(this.state.hypergraph);

        this.setState({
            data
        });
    }

    hypergraphToForceGraph(hypergraph) {
        const symbols = {};
        const nodes = {};
        const links = {};

        for (const hyperedge of hypergraph) {
            const edge = [];
            let lastId = null;

            for (const symbol of hyperedge) {
                edge.push(symbol);
                const id = edge.join("-");
                const textHeight = edge.length === 1 ? 12 : 8;
                const color = stringToColor(edge[0]);

                nodes[id] = { id, name: symbol, color, textHeight };

                if (edge.length > 1) {
                    const linkId = `${lastId}-${id}-link`;
                    links[linkId] = { id: linkId, source: lastId, target: id, color };
                }

                if (this.state.isConnected) {
                    if (!symbols[symbol]) {
                        symbols[symbol] = new Set();
                    }

                    symbols[symbol].add(id);

                    if (symbols[symbol].size > 1) {
                        const connectorId = `${symbol}-connector`;

                        if (!nodes[connectorId]) {
                            nodes[connectorId] = { id: connectorId };
                        }

                        for (const otherId of Array.from(symbols[symbol])) {
                            const linkConnectorId = `${connectorId}-${otherId}-link`;
                            links[linkConnectorId] = {
                                id: linkConnectorId,
                                source: connectorId,
                                target: otherId,
                                length: -10
                            };
                        }
                    }
                }

                lastId = id;
            }
        }

        return this.simplifyHypergraph({
            nodes,
            links
        });
    }

    simplifyHypergraph(hypergraph) {
        // const links = hypergraph.links;
        console.log(hypergraph.links);

        for (const node of Object.keys(hypergraph.nodes)) {
            if (node.includes("-connector")) {
                console.log("NODE", node);
                const links = Object.values(hypergraph.links).filter((link) => {
                    return link.source === node || link.target === node;
                });

                if (links.length === 2) {
                    delete hypergraph.nodes[node];
                    delete hypergraph.links[links[0].id];
                    const node1 = hypergraph.nodes[links[0].target];
                    console.log("NODE 1", node1);

                    delete hypergraph.links[links[1].id];

                    const target = links[1].target;
                    const node2 = hypergraph.nodes[target];

                    delete hypergraph.nodes[node2.id];
                    for (const otherLink of Object.values(hypergraph.links)) {
                        if (otherLink.source === node2.id || otherLink.target === node2.id) {
                            delete hypergraph.links[otherLink.id];
                            const newConnId = `${node1.id}-${otherLink.target}-link`;
                            hypergraph.links[newConnId] = {
                                id: newConnId,
                                source: node1.id,
                                target: otherLink.target
                            };
                        }
                    }
                }
            }
        }

        return {
            nodes: Object.values(hypergraph.nodes),
            links: Object.values(hypergraph.links)
        };
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

    toggleIsConnected() {
        this.setState({ isConnected: !this.state.isConnected }, () => {
            this.setState({ data: this.hypergraphToForceGraph(this.state.hypergraph) });
        });
    }

    render() {
        return (
            <>
                <div className="absolute flex gap-4 z-20">
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
                </div>
                <div className="absolute top-0 right-0 p-2 flex gap-4 z-20">
                    <a
                        onClick={this.toggleIsConnected.bind(this)}
                        className="cursor-pointer opacity-50 hover:opacity-100 transition-all bg-gray-50 rounded-sm"
                    >
                        {!this.state.isConnected && (
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
                                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                                />
                            </svg>
                        )}
                        {this.state.isConnected && (
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
                                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                                />
                            </svg>
                        )}
                    </a>
                </div>
                <ForceGraph3D
                    ref={this.graphRef}
                    graphData={this.state.data}
                    showNavInfo={false}
                    backgroundColor="#ffffff"
                    linkColor={(link) => {
                        return link.color || "#333333";
                    }}
                    nodeThreeObject={(node) => {
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
                    linkCurvature={0.25}
                />
            </>
        );
    }
}
