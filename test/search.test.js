import Hypergraph from "../src/renderer/src/Hypergraph.js";

import { expect, test } from "vitest";

// TODO: search edges at different interwingle depths
// TODO: we need a concept of increasing crawl depth for search as intwerwingle increases

test("search edges (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["A"]]);
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});

test("multiple search edges (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["C"]]);
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);
});

test("multiple search terms (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["A"], ["1"]]);
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);
});

test("search edge (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["A", "B"]]);
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});

test("search edge no results (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "3"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["A", "C"]]);
    expect(data.nodes.length).toBe(0);
    expect(data.links.length).toBe(0);
});

test("search edge multiple results (isolated)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["A", "B", "D"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData([["A", "B"]]);
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);
});

/*
test.only("multiple search edges (confluence)", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.CONFLUENCE});
    hypergraph.addHyperedges(hyperedges);

    const data = hypergraph.searchGraphData(["C"]);
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);
});
*/
