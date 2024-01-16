export default class HyperType {
    constructor(hypergraph) {
        this.hypergraph = hypergraph;
    }

    async add(input) {
        console.log("ADDING", input);
        const node = await this.hypergraph.add(input);
        return node.symbol;
    }

    // TODO: does a proxy make sense here?
    get nodes() {
        return this.hypergraph.nodes.map((node) => node.symbol);
    }

    get hyperedges() {
        return this.hypergraph.hyperedges.map((hyperedge) => hyperedge.symbols);
    }

    get all() {
        return this.hypergraph.hypergraph;
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
            }
        };

        const hypergraph = new Hypergraph(options);

        return new HyperType(hypergraph);
    }
}
