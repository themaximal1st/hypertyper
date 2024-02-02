import Hypergraph from "@themaximalist/hypertype";
import { default as VisualHypergraph } from "../src/renderer/src/Hypergraph.js";

import Hypertype from "../src/main/hypertype.js";

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
