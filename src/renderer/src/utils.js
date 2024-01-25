const colorPalette = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e"
];

export function stringToColor(str, colors = colorPalette) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the modulo operator to map the hash to an index within the colors array
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function mergeGraphs(graphs) {
    const graphData = { nodes: {}, links: {} };
    for (const graph of graphs) {
        graphData.nodes = { ...graphData.nodes, ...(graph.nodes || {}) };
        graphData.links = { ...graphData.links, ...(graph.links || {}) };
    }

    return graphData;
}

export function cycleInterwingle(interwingle) {
    if (++interwingle > 3) interwingle = 0;
    return interwingle;
}
