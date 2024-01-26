import Hypergraph from "@themaximalist/hypertype";
import { default as ForceHypergraph } from "../src/renderer/src/Hypergraph.js";

import Hypertype from "../src/main/hypertype.js";

// TODO: Maybe need another name for frontend Hypergraph...make it specific to ForceGraph

import { expect, test } from "vitest";

test("empty hypertype", () => {
    const hypergraph = new Hypergraph();
    const hypertype = new Hypertype(hypergraph);

    expect(hypertype.all).toEqual([]);
});

test("simple hypertype", () => {
    const hypergraph = new Hypergraph([["A", "B", "C"]]);
    const hypertype = new Hypertype(hypergraph);

    expect(hypertype.all).toEqual([["A", "B", "C"]]);
});

test.skip("search hypertype", () => {
    const hypergraph = new Hypergraph([
        ["A", "B", "C"],
        ["1", "2", "B"]
    ]);
    const hypertype = new Hypertype(hypergraph);
    const data = hypertype.all;
    const forceGraph = new ForceHypergraph(data);

    let hyperedges = forceGraph.edgeSearch([["A"]]);
    expect(hyperedges.length).toEqual(1);
    expect(hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    hyperedges = forceGraph.edgeSearch([["1"]]);
    expect(hyperedges.length).toEqual(1);
    expect(hyperedges[0].symbols).toEqual(["1", "2", "B"]);

    hyperedges = forceGraph.edgeSearch([["B"]]);
    expect(hyperedges.length).toEqual(2);
});

test("search with edge", () => {
    const hypergraph = new Hypergraph([
        ["A", "B", "C"],
        ["1", "2", "B"]
    ]);
    const hypertype = new Hypertype(hypergraph);
    const data = hypertype.all;
    const forceGraph = new ForceHypergraph(data);

    let hyperedges = forceGraph.edgeSearch([["A", "B"]]);
    expect(hyperedges.length).toEqual(1);
    expect(hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    hyperedges = forceGraph.edgeSearch([["1", "2"]]);
    expect(hyperedges.length).toEqual(1);
    expect(hyperedges[0].symbols).toEqual(["1", "2", "B"]);
});

test("search edge vs multiple nodes", () => {
    const hypergraph = new Hypergraph([
        ["A", "B", "C"],
        ["1", "2", "B"]
    ]);
    const hypertype = new Hypertype(hypergraph);
    const data = hypertype.all;
    const forceGraph = new ForceHypergraph(data);

    let hyperedges = forceGraph.edgeSearch([["A", "B"]]);
    expect(hyperedges.length).toEqual(1);
    expect(hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    hyperedges = forceGraph.edgeSearch([["A", "C"]]);
    expect(hyperedges.length).toEqual(0);

    hyperedges = forceGraph.edgeSearch([["A"], ["C"]]);
    expect(hyperedges.length).toEqual(1);

    hyperedges = forceGraph.edgeSearch([["A"], ["1", "2"]]);
    expect(hyperedges.length).toEqual(2);
});
