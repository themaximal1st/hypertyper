import Hypergraph from "../src/renderer/src/Hypergraph.js";

import { expect, test } from "vitest";

// INTERWINGLE PARAMETER
// 0 = isolated
// 1 = confluence
// 2 = fusion
// 3 = bridge
// 4 = pagerank
// 5 = embeddings

// TODO: test simple A-B-C A-B-D hypergraph
// TODO: test simple A-B-C C-D-E hypergraph
// TODO: test simple A-B-C 1-B-2 hypergraph
// TODO: test case we were hitting...masquerade node should be deterministic. Not flip flop. One node is the masquerade node. Not any node that can be a masquerade node.

// TODO: come up with names for type of hypergraph simplification ()
// TODO: test various connection depths on different hypergraphs

test("empty hypergraph", () => {
    const hypergraph = new Hypergraph();
    expect(hypergraph.hyperedges).toEqual([]);
});

test("single hyperedge", () => {
    const hyperedges = [["A", "B", "C"]];
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

test.only("confluence", () => {
    const hyperedges = [
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
