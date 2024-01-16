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

    // TODO: Do incremental layout updates
    // TODO: By adding graph as you add the node, the graph is less janky
    // TODO: See what else is out there...what am I missing?
    async function handleAdd(obj) {
        await window.api.hypergraph.add(obj);
        reload();
    }

    return (
        <div className="w-full h-screen">
            <EditorBox add={handleAdd} />
            <Graph data={data} layout={layout} />;
            <Layout setLayout={setLayout} />
        </div>
    );
}
