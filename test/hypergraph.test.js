import Hypergraph from "../src/renderer/src/Hypergraph.js";

import { expect, test } from "vitest";
import fs from "fs";
// TODO: we need a really good way to modify/remove hyperedges
//         - updating indexes and making sure everything is proper

// TODO: refactor graphData hash to map

// TODO: hypertype actually needs to be built much differently.
//          we can't do everything on init, it's too slow.
//          we should have a batch parameter, that shows activity is happening/syncing
//          and nodes that don't have data, are shown, but those attributes are ignored
//          we should be able to load and render a 50k node graph in 1 second

// TODO: So we need some refactoring help
// TODO: We want to be able to add/edit the hypergraph, without rewriting everything right? (maybe)
// TODO: biggest issue is finding connections. to do this well we need indexes (i think)
// TODO: to do indexes well, the updater needs to be more consistent.
// TODO: ideally this is super deterministic. we should be able to run & cache results
// TODO: need really solid way to translate between hypergraph and graphData
// TODO: then you have weird "hidden" nodes like bridge nodes...which maybe should be their own hyperedge? can we just generate them dynamically like that or what?

test("empty hypergraph", () => {
    const hypergraph = new Hypergraph();
    expect(hypergraph.hyperedges).toEqual([]);
});

test("single hyperedge", () => {
    const hypergraph = new Hypergraph();
    hypergraph.addHyperedge(["A", "B", "C"]);

    expect(hypergraph.hyperedges.length).toBe(1);
    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[0].nodes[0].symbol).toEqual("A");
    expect(hypergraph.hyperedges[0].nodes[0].id).toEqual("A");
    expect(hypergraph.hyperedges[0].nodes[1].symbol).toEqual("B");
    expect(hypergraph.hyperedges[0].nodes[1].id).toEqual("A.B");
    expect(hypergraph.hyperedges[0].nodes[2].symbol).toEqual("C");
    expect(hypergraph.hyperedges[0].nodes[2].id).toEqual("A.B.C");

    const data = hypergraph.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0].hyperedgeID).toBe("A->B->C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1].hyperedgeID).toBe("A->B->C");
});

test("two distinct hyperedges", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["1", "2", "3"]
    ];
    const hypergraph = new Hypergraph();
    hypergraph.addHyperedges(hyperedges);

    expect(hypergraph.hyperedges.length).toEqual(2);

    expect(hypergraph.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(hypergraph.hyperedges[1].symbols).toEqual(["1", "2", "3"]);

    const data = hypergraph.graphData();
    expect(data.links.length).toBe(4);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");

    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->1.2.3");
});

test("isolated", () => {
    const hyperedges = [
        ["A", "B", "C"],
        ["A", "1", "2"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.ISOLATED });
    hypergraph.addHyperedges(hyperedges);

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
    const hypergraph = new Hypergraph({
        interwingle: Hypergraph.INTERWINGLE.CONFLUENCE
    });

    hypergraph.addHyperedges(hyperedges);
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
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");
});

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.FUSION });
    hypergraph.addHyperedges(hyperedges);
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
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A.B.C->C.D");
    expect(data.links[3].id).toBe("C.D->C.D.E");

    expect(hypergraph.masqueradeIndex.size).toBe(1);
    // console.log(hypergraph.masqueradeIndex);
});

test("fusion end", () => {
    const hyperedges = [
        // A.B.C 1.2.C with C as fusion node
        ["A", "B", "C"],
        ["1", "2", "C"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.FUSION });
    hypergraph.addHyperedges(hyperedges);
    expect(hypergraph.hyperedges.length).toEqual(2);

    const data = hypergraph.graphData();

    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->A.B.C");
});

test("bridge", () => {
    const hyperedges = [
        ["A", "vs", "B"],
        ["1", "vs", "2"]
    ];

    const hypergraph = new Hypergraph({ interwingle: Hypergraph.INTERWINGLE.BRIDGE });
    hypergraph.addHyperedges(hyperedges);

    expect(hypergraph.hyperedges.length).toEqual(2);

    const data = hypergraph.graphData();
    expect(data.nodes.length).toBe(7); // vs creates connection node

    const nodeIds = data.nodes.map((node) => node.id);
    expect(nodeIds).toContain("A");
    expect(nodeIds).toContain("A.vs");
    expect(nodeIds).toContain("A.vs.B");
    expect(nodeIds).toContain("1");
    expect(nodeIds).toContain("1.vs");
    expect(nodeIds).toContain("1.vs.2");
    expect(nodeIds).toContain("vs#bridge");

    expect(data.links.length).toBe(6);

    const linkIds = data.links.map((link) => link.id);
    expect(linkIds).toContain("A->A.vs");
    expect(linkIds).toContain("A.vs->A.vs.B");
    expect(linkIds).toContain("1->1.vs");
    expect(linkIds).toContain("1.vs->1.vs.2");

    expect(linkIds).toContain("vs#bridge->A.vs");
    expect(linkIds).toContain("vs#bridge->1.vs");
});

test.skip("huge", () => {
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data", "utf-8")
        .split("\n")
        // .slice(0, 1000)
        .map((line) => {
            return line.split(" -> ");
        });

    // console.log(hyperedges);

    // const hypergraph = new Hypergraph(hyperedges);
    const start = Date.now();
    const hypergraph = new Hypergraph({ interwingle: 3 });
    hypergraph.addHyperedges(hyperedges);
    console.log("GOT HYPERGRAPH");

    const data = hypergraph.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);

    expect(elapsed).toBeLessThan(300);
});

// TODO: generate graphData based on search parameters
