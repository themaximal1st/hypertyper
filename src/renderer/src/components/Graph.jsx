import Cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
Cytoscape.use(fcose);

import COSEBilkent from "cytoscape-cose-bilkent";
Cytoscape.use(COSEBilkent);

import CytoscapeComponent from "react-cytoscapejs";

export default function Graph({ data, layout }) {
    return (
        <CytoscapeComponent
            global="ht_cy"
            elements={data}
            layout={layout}
            className="w-full h-full"
            minZoom={0.1}
            maxZoom={5}
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
    );
}

Graph.fromHypergraph = function (data) {
    const results = [];
    for (const edge of data) {
        let lastNode = null;
        for (const node of edge) {
            results.push({ data: { id: node, label: node } });

            if (lastNode) {
                results.push({
                    data: { source: lastNode, target: node }
                });
            }

            lastNode = node;
        }
    }
    return results;
};
