import React, { useState, useEffect } from "react";

import EditorBox from "./components/EditorBox";
import Graph from "./components/Graph";
import Layout from "./components/Layout";

export default class App extends React.Component {
    constructor() {
        super();
        this.state = {
            boom: "boom",
            layout: {
                name: "fcose"
            },
            data: []
        };
    }

    onSelectNode(symbol) {
        console.log("SELECTED NODE AT SYMBOL", symbol);
    }

    render() {
        return (
            <div className="w-full h-screen">
                <EditorBox />
                <Graph
                    data={this.state.data}
                    layout={this.state.layout}
                    onSelectNode={this.onSelectNode.bind(this)}
                />
                ;{/* <Layout setLayout={setLayout} setScratchMode={setScratchMode} /> */}
            </div>
        );
    }
}

/*
export default function App() {
    console.log("LOADING");

    const [hypergraph, setHypergraph] = useState({});
    const [scratchMode, setScratchMode] = useState(false);
    const [scratchHypergraph, setScratchHypergraph] = useState({});

    const data = scratchMode ? Object.values(scratchHypergraph) : Object.values(hypergraph);

    const [layout, setLayout] = useState({
        name: "fcose",
        padding: 50
        // name: "fcose",
        // quality: "proof",
        // randomize: false
    });

    useEffect(() => {
        if (data.length > 0) {
            console.log("UPDATE DATA");
            update();
        }
    }, [data]);

    useEffect(() => {
        console.log("START");
        reload();
    }, []);

    function update() {
        console.log("UPDATE LAYOUT");
        window.ht_cy.layout(layout).run();
    }

    async function reload() {
        console.log("RELOAD");
        const data = await window.api.hypergraph.all();
        console.log("RELOAD DATA", data.length);
        addToHypergraph(data);
    }

    function handleSelectNode(symbol) {
        console.log("SELECTED NODE AT SYMBOL", symbol);
    }

    function addToHypergraph(obj) {
        console.log("ADD TO HYPERGRAPH", obj);
        if (typeof obj === "string") {
            console.log("ADDING SYMBOL");
            // symbol
            setScratchHypergraph({
                ...scratchHypergraph,
                [obj]: { data: { id: obj, label: obj } }
            });
            setHypergraph({ ...hypergraph, [obj]: { data: { id: obj, label: obj } } });
            return;
        } else if (Array.isArray(obj)) {
            console.log("ADDING HYPEREDGES", obj.length);
            if (!Array.isArray(obj[0])) {
                obj = [obj];
            }

            const newHypergraph = { ...hypergraph };
            const newScratchHypergraph = { ...scratchHypergraph };

            for (const hyperedge of obj) {
                let lastNode = null;
                for (const node of hyperedge) {
                    newHypergraph[node] = { data: { id: node, label: node } };
                    newScratchHypergraph[node] = { data: { id: node, label: node } };

                    if (lastNode) {
                        const id = `${lastNode}-${node}`;
                        newHypergraph[id] = { data: { id, source: lastNode, target: node } };
                        newScratchHypergraph[id] = { data: { id, source: lastNode, target: node } };
                    }
                    lastNode = node;
                }
            }

            setHypergraph(newHypergraph);
            setScratchHypergraph(newScratchHypergraph);
        }
    }

    // Clear context when creating a new node...then bring in relevant background nodes/edges as needed
    // Keep track of hypergraph when adding, don't always clear it away....
    // TODO: Auto complete

    // TODO: It's not a hypergraph viewer, it's a hyperedge viewer (for now)
    // TODO: There's always context (either a node or a hyperedge), and that context disconnects the hyperedges into their own strands. This detangles the hypergraph

    // TODO: Do incremental layout updates
    // TODO: By adding graph as you add the node, the graph is less janky
    // TODO: See what else is out there...what am I missing?
    async function handleAdd(obj) {
        // TODO: juse use setState so that you can use callbacks?

        if (!scratchMode) {
            // TODO: why isnt this working?
            console.log("SCRATCH MODE");
            setScratchHypergraph({});
            setScratchMode(true);
        }
        addToHypergraph(obj);
        // await window.api.hypergraph.add(obj);
    }

    return (
        <div className="w-full h-screen">
            <EditorBox add={handleAdd} />
            <Graph data={data} layout={layout} onSelectNode={handleSelectNode} />;
            <Layout setLayout={setLayout} setScratchMode={setScratchMode} />
        </div>
    );
}

*/
