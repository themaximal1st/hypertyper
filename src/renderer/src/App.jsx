import React, { useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

export default class App extends React.Component {
    constructor() {
        super();
        console.log("COMPONENT DID MOUNT");
        this.state = {
            layout: { name: "circle" },
            data: [
                { data: { id: "a", label: "a" } },
                { data: { id: "b", label: "b" } },
                { data: { id: "c", label: "c" } },
                { data: { source: "a", target: "b" } }
            ]
        };
    }

    componentDidMount() {
        console.log("DID MOUNT");
        console.log(window.my_cy);
        this.renderHypergraphLayout();
    }

    updateHypergraph() {
        // this.state.data.push({
        //     data: { id: "d", label: "d" }
        // });

        this.setState(
            {
                ...this.state,
                data: [
                    ...this.state.data,
                    { data: { id: "d", label: "d" } },
                    { data: { source: "a", target: "d" } }
                ]
            },
            () => {
                this.renderHypergraphLayout();
            }
        );
    }

    renderHypergraphLayout() {
        window.my_cy.layout(this.state.layout).run();
    }

    renderHypergraph() {
        return (
            <div className="w-full h-full">
                <button onClick={this.updateHypergraph.bind(this)}>Update</button>
                <CytoscapeComponent
                    global="my_cy"
                    elements={this.state.data}
                    className="w-full h-full"
                    maxZoom={2.5}
                    stylesheet={[
                        {
                            selector: "node",
                            style: {
                                width: 20,
                                height: 20,
                                backgroundColor: "#999",
                                label: "data(label)",
                                "font-size": "11px"
                            }
                        },
                        {
                            selector: "edge",
                            style: {
                                width: 3,
                                "line-color": "#DDD"
                            }
                        }
                    ]}
                />
            </div>
        );
    }

    render() {
        return <div className="w-full h-screen">{this.renderHypergraph()}</div>;
    }
}
/*
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
Cytoscape.use(COSEBilkent);

import fcose from "cytoscape-fcose";
Cytoscape.use(fcose);

import CytoscapeComponent from "react-cytoscapejs";
import React, { useState, useEffect } from "react";

function App() {
    const [hypergraph, setHypergraph] = useState([]);
    const [hyperedge, setHyperedge] = useState([]);
    const [input, setInput] = useState("");
    const [layout, setLayout] = useState({
        name: "fcose"
        // name: "cose-bilkent",
        // fit: true,
        // nodeDimensionsIncludeLabels: true,
        // padding: 50,
        // idealEdgeLength: 30,
        // animate: true
    });

    async function reloadHypergraph() {
        console.log("RELOAD HYPERGRAPH");
        renderHypergraph(await window.api.hypergraph.all());
    }

    useEffect(() => {
        reloadHypergraph();
    }, []);

    function renderHypergraph(hypergraph_data) {
        console.log("RENDER HYPERGRAPH");
        const results = [];
        for (const edge of hypergraph_data) {
            let lastNode = null;
            for (const node of edge) {
                let id = node;
                if (lastNode) {
                    id = `${lastNode}-${node}`;
                }
                results.push({ data: { id, label: node } });

                if (lastNode) {
                    results.push({
                        data: { source: lastNode, target: id }
                    });
                }

                lastNode = id;
            }
        }

        setHypergraph(results);
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        console.log("HANDLE FORM SUBMIT");
        if (input.length === 0 && hyperedge.length > 0) {
            setHyperedge([]);
            setInput("");
            const nodes = await window.api.nodes.add(hyperedge);
            await reloadHypergraph();
        }

        if (input.length > 0) {
            setHyperedge([...hyperedge, input]);
            const nodes = await window.api.nodes.add(input);
            await reloadHypergraph();
            setInput("");
        }
    }

    // function handleCy(cy_instance) {
    //     if (!cy) {
    //         console.log("CY INSTANCE..RUN LAYOUT");
    //         cy = cy_instance;
    //         // cy.layout(layout).run(); // initial layout

    //         cy.on("resize", () => {
    //             console.log("RESIZE..RUN LAYOUT");
    //             cy.layout(layout).run();
    //         });
    //     }
    // }

    useEffect(() => {
        console.log("RUNNING LAYOUT");
        window.my_cy.layout(layout).run();
    }, [layout]);

    async function changeLayout(e, name) {
        e.preventDefault();
        setLayout({ ...layout, name });
    }

    const layouts = [
        "random",
        "cose",
        "cose-bilkent",
        "grid",
        "breadthfirst",
        "concentric",
        "circle",
        "fcose"
    ];

    return (
        <div className="bg-gray-50 flex flex-col justify-center items-center relative h-screen">
            <div className="border-2 absolute inset-0">
                <CytoscapeComponent
                    layout={layout}
                    global="my_cy"
                    elements={hypergraph}
                    className="w-full h-full"
                    maxZoom={2.5}
                />
            </div>
            <div className="absolute inset-0 pointer-events-none">
                <div className="flex justify-center items-start gap-4 mt-4">
                    {hyperedge.map((item) => (
                        <div
                            key={item}
                            className="bg-white border-r p-2 rounded-lg pointer-events-auto opacity-100"
                        >
                            {item}
                        </div>
                    ))}
                    <div className="rounded-lg opacity-100">
                        <form onSubmit={handleFormSubmit}>
                            <input
                                type="text"
                                placeholder="Create"
                                value={input}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setInput(e.target.value);
                                }}
                                className="p-2 border-0 rounded-lg pointer-events-auto outline-none"
                            />
                        </form>
                    </div>
                </div>
            </div>

            <div className="absolute z-20 bottom-0 left-0 flex cursor-pointer text-sm text-gray-500">
                {layouts.map((item) => (
                    <a
                        key={item}
                        className="p-2 hover:text-gray-800"
                        onClick={(e) => {
                            changeLayout(e, item);
                        }}
                    >
                        {item}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default App;
*/
