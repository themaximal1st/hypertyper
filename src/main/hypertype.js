import fs from "fs";

export default class HyperType {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    async add(input) {
        const obj = await this.hypergraph.add(input);
        if (obj.symbols) {
            return obj.symbols;
        }

        return obj.symbol;
    }

    get nodes() {
        return this.hypergraph.nodes.map((node) => node.symbol);
    }

    get hyperedges() {
        return this.hypergraph.hyperedges.map((hyperedge) => hyperedge.symbols);
    }

    get all() {
        return this.hypergraph.all;
    }

    static async load() {
        const Hypergraph = (await import("@themaximalist/hypertype")).default;
        const options = {
            vectordb: {
                dimensions: 1536,
                embeddings: {
                    endpoint: "https://modeldeployer.com/api/v1/embeddings",
                    service: "modeldeployer",
                    model: "34b402aa-0144-4106-8e00-342d1174ca4f"
                }
            },
            llm: {
                endpoint: "https://modeldeployer.com/api/v1/chat",
                service: "modeldeployer",
                model: "24007ff9-b61e-4ab9-95d1-66a2e15c71d6",
                temperature: 0.1
            },
            parse: {
                delimiter: " -> "
            }
        };

        const file = "/Users/brad/Projects/loom/data/data";
        const contents = fs.readFileSync(file, "utf8").split("\n").slice(0, 30).join("\n");
        // const contents = fs.readFileSync(file, "utf8");

        try {
            console.log("LOADING");
            const hypergraph = Hypergraph.parse(contents, options);
            console.log("LOADED");
            // console.log("BOOM");
            // console.log(hypergraph);
            const hypertype = new HyperType(hypergraph);
            return hypertype;
        } catch (e) {
            console.log("ERROR");
            console.log(e);
        }
    }
}
