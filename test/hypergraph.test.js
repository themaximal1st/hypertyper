import Hypergraph from "../src/renderer/src/Hypergraph.js";

import { expect, test } from "vitest";

// TODO: hypertype actually needs to be built much differently.
//          we can't do everything on init, it's too slow.
//          we should have a batch parameter, that shows activity is happening/syncing
//          and nodes that don't have data, are shown, but those attributes are ignored
//          we should be able to load and render a 50k node graph in 1 second

// INTERWINGLE PARAMETER
// 0 = isolated
// 1 = confluence
// 2 = fusion
// 3 = bridge
// pagerank (toggle)
// embeddings (toggle)

// TODO: test simple A-B-C 1-B-2 bridge hypergraph
// TODO: come up with all kinds of weird connections...test them
// TODO: test case we were hitting...masquerade node should be deterministic. Not flip flop. One node is the masquerade node. Not any node that can be a masquerade node.

// TODO: come up with names for type of hypergraph simplification ()
// TODO: test various connection depths on different hypergraphs

test("empty hypergraph", () => {
    const hypergraph = new Hypergraph();
    expect(hypergraph.hyperedges).toEqual([]);
});

test("single hyperedge", () => {
    const hyperedges = [["A", "B", "C"]]; // A.B.C
    const hypergraph = new Hypergraph(hyperedges);
    expect(hypergraph.hyperedges.length).toEqual(1);

    const hyperedge = hypergraph.hyperedges[0];
    expect(hyperedge.nodes.length).toEqual(3);
    expect(hyperedge.nodes[0].symbol).toEqual("A");
    expect(hyperedge.nodes[0].id).toEqual("A");
    expect(hyperedge.nodes[1].symbol).toEqual("B");
    expect(hyperedge.nodes[1].id).toEqual("A.B");
    expect(hyperedge.nodes[2].symbol).toEqual("C");
    expect(hyperedge.nodes[2].id).toEqual("A.B.C");

    const data = hypergraph.graphData();
    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
});

test("two distinct hyperedges", () => {
    const hyperedges = [
        // A.B.C && 1.2.3
        ["A", "B", "C"],
        ["1", "2", "3"]
    ];
    const hypergraph = new Hypergraph(hyperedges);
    expect(hypergraph.hyperedges.length).toEqual(2);

    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[1].symbols).toEqual(["1", "2", "3"]);

    const data = hypergraph.graphData();
    expect(data.links.length).toBe(4);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");

    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[2].source).toBe("1");
    expect(data.links[2].target).toBe("1.2");
    expect(data.links[3].id).toBe("1.2->1.2.3");
    expect(data.links[3].source).toBe("1.2");
    expect(data.links[3].target).toBe("1.2.3");
});

test("isolated", () => {
    const hyperedges = [
        // A.B.C && 1.2.3
        ["A", "B", "C"],
        ["A", "1", "2"]
    ];
    const hypergraph = new Hypergraph(hyperedges, { interwingle: 0 });
    expect(hypergraph.hyperedges.length).toEqual(2);

    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("0:A");
    expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("0:A.B");
    expect(hypergraph.hyperedges[1].symbols).toEqual(["A", "1", "2"]);
    expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("1:A");
    expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("1:A.1");

    const data = hypergraph.graphData();
    expect(data.links.length).toBe(4);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");

    expect(data.links[2].id).toBe("1:A->1:A.1");
    expect(data.links[2].source).toBe("1:A");
    expect(data.links[2].target).toBe("1:A.1");

    expect(data.links[3].id).toBe("1:A.1->1:A.1.2");
    expect(data.links[3].source).toBe("1:A.1");
    expect(data.links[3].target).toBe("1:A.1.2");
});

test("confluence", () => {
    const hyperedges = [
        // A.B.C && A.1.2 with A as confluence node
        ["A", "B", "C"],
        ["A", "1", "2"]
    ];
    const hypergraph = new Hypergraph(hyperedges, { interwingle: 1 });
    expect(hypergraph.hyperedges.length).toEqual(2);

    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("A");
    expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("A.B");
    expect(hypergraph.hyperedges[1].symbols).toEqual(["A", "1", "2"]);
    expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("A");
    expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("A.1");

    const data = hypergraph.graphData();
    expect(data.links.length).toBe(4);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");

    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[2].source).toBe("A");
    expect(data.links[2].target).toBe("A.1");

    expect(data.links[3].id).toBe("A.1->A.1.2");
    expect(data.links[3].source).toBe("A.1");
    expect(data.links[3].target).toBe("A.1.2");
});

test("fusion", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const hypergraph = new Hypergraph(hyperedges, { interwingle: 2 });
    expect(hypergraph.hyperedges.length).toEqual(2);

    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("A");
    expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("A.B");
    expect(hypergraph.hyperedges[1].symbols).toEqual(["C", "D", "E"]);
    expect(hypergraph.hyperedges[1].nodes[0].id).toEqual("C");
    expect(hypergraph.hyperedges[1].nodes[1].id).toEqual("C.D");

    const data = hypergraph.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C

    expect(data.links.length).toBe(4);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");

    expect(data.links[2].id).toBe("A.B.C->C.D");
    expect(data.links[2].source).toBe("A.B.C");
    expect(data.links[2].target).toBe("C.D");

    expect(data.links[3].id).toBe("C.D->C.D.E");
    expect(data.links[3].source).toBe("C.D");
    expect(data.links[3].target).toBe("C.D.E");
});
