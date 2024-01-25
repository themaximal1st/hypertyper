import Hypergraph from "../src/renderer/src/Hypergraph.js";

import { expect, test } from "vitest";

// TODO: simple single case
// TODO: test simple A-B-C A-B-D hypergraph
// TODO: test simple A-B-C C-D-E hypergraph
// TODO: test simple A-B-C 1-B-2 hypergraph
// TODO: test case we were hitting...masquerade node should be deterministic. Not flip flop. One node is the masquerade node. Not any node that can be a masquerade node.

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
