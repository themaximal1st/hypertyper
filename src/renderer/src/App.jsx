import React from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { stringToColor } from "./utils";

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
            ]
        };
    }

    componentDidMount() {
        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        const data = this.hypergraphToForceGraph(this.state.hypergraph);

        this.setState({ data });
    }

    hypergraphToForceGraph(hypergraph) {
        const symbols = {};
        const nodes = {};
        const links = {};

        for (const hyperedge of hypergraph) {
            this.processHyperedge(hyperedge, nodes, links, symbols);
        }

        return { nodes: Object.values(nodes), links: Object.values(links) };
    }

    processHyperedge(hyperedge, nodes, links, symbols, isConnected) {
        let lastId = null;

        hyperedge.forEach((symbol) => {
            const id = this.createNodeId(hyperedge, symbol); // Function to create a unique node ID
            nodes[id] = this.createNode(symbol, id, hyperedge.length); // Create and store the node
            const color = stringToColor(hyperedge[0]);

            if (hyperedge.length > 1) {
                // Create and store the link if it's not the first element in the hyperedge
                if (lastId !== null) {
                    links[this.createLinkId(lastId, id)] = this.createLink(lastId, id, color);
                }
                lastId = id;
            }

            if (isConnected) {
                this.updateSymbolsAndCreateConnectors(symbol, id, symbols, nodes, links);
            }
        });

        return { nodes, links };
    }

    createNodeId(hyperedge, currentSymbol) {
        // Determine the position of the current symbol in the hyperedge
        const index = hyperedge.indexOf(currentSymbol);
        // Generate the node ID by joining the symbols up to the current one
        return hyperedge.slice(0, index + 1).join("-");
    }

    createNode(symbol, id, edgeLength) {
        const textHeight = edgeLength === 1 ? 12 : 8;
        const color = stringToColor(id.split("-")[0]);
        return { id, name: symbol, color, textHeight };
    }

    createLinkId(sourceId, targetId) {
        return `${sourceId}-${targetId}-link`;
    }

    createLink(sourceId, targetId, color) {
        return {
            id: this.createLinkId(sourceId, targetId),
            source: sourceId,
            target: targetId,
            color
        };
    }

    /*
    simplifyHypergraph(hypergraph) {
        for (const node of Object.keys(hypergraph.nodes)) {
            if (node.includes("-connector")) {
                const links = Object.values(hypergraph.links).filter((link) => {
                    return link.source === node || link.target === node;
                });

                if (links.length === 2) {
                    delete hypergraph.nodes[node];
                    delete hypergraph.links[links[0].id];
                    const node1 = hypergraph.nodes[links[0].target];

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
    */

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
                        {!this.state.isConnected && "Connect"}
                        {this.state.isConnected && "Disconnect"}
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
