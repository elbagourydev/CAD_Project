// Shared mutable app state.
// Kept in one object so every module always sees the latest values.

export const state = {
    br: [], // branches: { n, f, t, z, e, i }
    pos: {}, // node positions on the canvas: { nodeId: [x, y] }
    tree: [], // spanning-tree branches
    info: null // last successful analysis (used by the diagram)
};
