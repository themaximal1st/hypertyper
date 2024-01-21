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
                // ["Ted Nelson", "invented", "HyperText"],
                // ["HyperText", "influenced", "WWW"],
                // ["Tim Berners-Lee", "invented", "WWW"],
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

    positionForNode(id) {
        // for (const node of this.state.data.nodes) {
        //     if (node.id === id) {
        //         return { fx: node.x, fy: node.y, fz: node.z };
        //     }
        // }

        return {};
    }

    positionForLink(id) {
        // for (const link of this.state.data.links) {
        //     if (link.id === id) {
        //         return { fx: link.x, fy: link.y, fz: link.z };
        //     }
        // }

        return {};
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

                const nodePosition = this.positionForNode(id);
                nodes[id] = { id, name: symbol, color, textHeight, ...nodePosition };

                if (edge.length > 1) {
                    const linkId = `${lastId}-${id}-link`;
                    const linkPosition = this.positionForLink(linkId);
                    links[linkId] = { source: lastId, target: id, color, ...linkPosition };
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
                            const linkConnectorPosition = this.positionForLink(linkConnectorId);
                            links[linkConnectorId] = {
                                source: connectorId,
                                target: otherId,
                                length: 1,
                                ...linkConnectorPosition
                            };
                        }
                    }
                }

                lastId = id;
            }
        }

        return { nodes: Object.values(nodes), links: Object.values(links) };
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
                        return "#333333";
                    }}
                    nodeThreeObject={(node) => {
                        const sprite = new SpriteText(node.name);
                        sprite.color = node.color;
                        sprite.textHeight = node.textHeight || 8;
                        return sprite;
                    }}
                    /*
                    onNodeDragEnd={(node) => {
                        console.log("DRAG END");
                        node.fx = node.x;
                        node.fy = node.y;
                        node.fz = node.z;
                    }}
                    */
                    // warmupTicks={1000}
                    // cooldownTicks={100}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}
                />
            </>
        );
    }
}
