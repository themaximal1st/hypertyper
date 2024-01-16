import React, { useState, useEffect } from "react";

import EditorBox from "./components/EditorBox";
import Graph from "./components/Graph";
import Layout from "./components/Layout";

export default function App() {
    const [data, setData] = useState([]);
    const [layout, setLayout] = useState({
        name: "fcose",
        quality: "proof",
        randomize: false
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
        setData(Graph.fromHypergraph(data));
    }

    async function handleAddNode(symbol) {
        setData([...data, { data: { id: symbol, label: symbol } }]);
        await window.api.nodes.add(symbol);
        // reload();
    }

    return (
        <div className="w-full h-screen">
            <EditorBox addNode={handleAddNode} />
            <Graph data={data} layout={layout} />;
            <Layout setLayout={setLayout} />
        </div>
    );
}
