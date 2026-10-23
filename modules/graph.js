// Graph theory part: spanning tree, links, tie-set and cut-set matrices.
// Pure functions: everything comes in as arguments.

// Split branches into tree branches and links (union-find)
export function buildTree(br) {
    const nodes = [...new Set(br.flatMap(b => [b.f, b.t]))].sort((a, b) => a - b);
    const par = {};
    nodes.forEach(n => (par[n] = n));
    const fd = x => (par[x] === x ? x : (par[x] = fd(par[x])));
    const tree = [],
        lk = [];
    br.forEach(b => {
        if (b.f === b.t) throw Error("Branch " + b.n + ": both ends are the same node");
        const a = fd(b.f),
            c = fd(b.t);
        if (a !== c) {
            par[a] = c;
            tree.push(b);
        } else lk.push(b);
    });
    if (new Set(nodes.map(fd)).size > 1) throw Error("The network is not connected");
    return { nodes, tree, lk };
}

// Tree path v -> u, as { branchNumber: +1 | -1 }
export function treePath(tree, v, u) {
    const p = { [v]: null },
        q = [v];
    while (q.length) {
        const x = q.shift();
        tree.forEach(b => {
            [
                [b.f, b.t],
                [b.t, b.f]
            ].forEach(([a, c]) => {
                if (a === x && !(c in p)) {
                    p[c] = { x, b };
                    q.push(c);
                }
            });
        });
    }
    const r = {};
    let c = u;
    while (c !== v) {
        const { x, b } = p[c];
        r[b.n] = b.f === x && b.t === c ? 1 : -1;
        c = x;
    }
    return r;
}

// Fundamental tie-set (loop) matrix B: one row per link
export function tieSet(br, tree, lk) {
    return lk.map(l => {
        const r = Array(br.length).fill(0);
        r[l.n - 1] = 1;
        const pth = treePath(tree, l.t, l.f);
        for (const k in pth) r[k - 1] = pth[k];
        return r;
    });
}

// Fundamental cut-set matrix C: one row per tree branch
export function cutSet(br, tree) {
    return tree.map(t => {
        const S = new Set([t.f]);
        let ch = true;
        while (ch) {
            ch = false;
            tree.forEach(b => {
                if (b !== t) {
                    if (S.has(b.f) && !S.has(b.t)) {
                        S.add(b.t);
                        ch = true;
                    }
                    if (S.has(b.t) && !S.has(b.f)) {
                        S.add(b.f);
                        ch = true;
                    }
                }
            });
        }
        return br.map(b => (S.has(b.f) && !S.has(b.t) ? 1 : !S.has(b.f) && S.has(b.t) ? -1 : 0));
    });
}
