import React, { useState, useEffect } from "react";

import EditorBox from "./components/EditorBox";
import Graph from "./components/Graph";
import Layout from "./components/Layout";

export default function App() {
    const [data, setData] = useState([]);
    const [layout, setLayout] = useState({
        name: "cose-bilkent"
        // name: "fcose",
        // quality: "proof",
        // randomize: false
    });

    useEffect(() => {
        update();
    }, [data]);

    useEffect(() => {
        reload();
    }, []);

    function update() {
        console.log("UPDATE");
        window.ht_cy.layout(layout).run();
    }

    async function reload() {
        const data = await window.api.hypergraph.all();
        console.log("DATA", data);
        setData(Graph.fromHypergraph(data));
    }

    function incrementalAddEdgeToHypergraph(hyperedge) {
        let lastNode = null;
        const graph = [];
        for (const node of hyperedge) {
            graph.push({ data: { id: node, label: node } });
            if (lastNode) {
                graph.push({ data: { source: lastNode, target: node } });
            }
            lastNode = node;
        }

        return graph;
    }

    // Clear context when creating a new node...then bring in relevant background nodes/edges as needed
    // Keep track of hypergraph when adding, don't always clear it away....

    // TODO: It's not a hypergraph viewer, it's a hyperedge viewer (for now)
    // TODO: There's always context (either a node or a hyperedge), and that context disconnects the hyperedges into their own strands. This detangles the hypergraph

    // TODO: Do incremental layout updates
    // TODO: By adding graph as you add the node, the graph is less janky
    // TODO: See what else is out there...what am I missing?
    async function handleAdd(obj) {
        setData(incrementalAddEdgeToHypergraph(obj));
        await window.api.hypergraph.add(obj);
    }

    return (
        <div className="w-full h-screen">
            <EditorBox add={handleAdd} />
            <Graph data={data} layout={layout} />;
            <Layout setLayout={setLayout} />
        </div>
    );
}
