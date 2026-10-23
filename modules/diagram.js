// SVG drawing: the circuit (c1) and its directed graph (c2).

import { $ } from "./utils.js";
import { state } from "./state.js";

const NS = "http://www.w3.org/2000/svg";

const el = (p, t, a, x) => {
    const e = document.createElementNS(NS, t);
    for (const k in a) e.setAttribute(k, a[k]);
    if (x != null) e.textContent = x;
    p.appendChild(e);
    return e;
};

const line = (p, a, c) =>
    el(p, "path", {
        d: `M${a[0]} ${a[1]}L${c[0]} ${c[1]}`,
        stroke: "var(--ink)",
        "stroke-width": 2,
        fill: "none"
    });

// Place new nodes on an ellipse; existing (dragged) nodes keep their position
function layout(nodes) {
    const { pos } = state;
    nodes.forEach((n, i) => {
        if (!pos[n]) {
            const a = -Math.PI / 2 + (2 * Math.PI * i) / nodes.length;
            pos[n] = [280 + 170 * Math.cos(a), 200 + 135 * Math.sin(a)];
        }
    });
}

// Geometry of one branch; `pt(t, h)` = point at distance t along it, h to the side
function geo(b) {
    const { br, pos } = state,
        P = pos[b.f],
        Q = pos[b.t],
        dx = Q[0] - P[0],
        dy = Q[1] - P[1],
        d = Math.hypot(dx, dy) || 1,
        u = [dx / d, dy / d],
        n = [-u[1], u[0]];
    const same = br.filter(x => (x.f === b.f && x.t === b.t) || (x.f === b.t && x.t === b.f)),
        k = same.indexOf(b),
        m = same.length,
        s = b.f < b.t ? 1 : -1;
    return {
        P,
        Q,
        d,
        off: (k - (m - 1) / 2) * 50 * s,
        pt: (t, h) => [P[0] + u[0] * t + n[0] * h, P[1] + u[1] * t + n[1] * h]
    };
}

function addMarkers(svg) {
    const df = el(svg, "defs", {});
    ["tree", "lnk"].forEach(c =>
        el(
            el(df, "marker", {
                id: "a" + c,
                viewBox: "0 0 10 10",
                refX: "9",
                refY: "5",
                markerWidth: "7",
                markerHeight: "7",
                orient: "auto-start-reverse"
            }),
            "path",
            { d: "M0 0L10 5L0 10z", fill: `var(--${c})` }
        )
    );
}

function drawCircuitBranch(s, b, { P, Q, d, off, pt }) {
    const sd = off > 0 ? 1 : -1,
        A = 0.2 * d,
        Lg = 0.6 * d,
        cm = [];
    if (b.e) cm.push({ k: "e", c: Lg * 0.3, w: 26 });
    if (b.z) cm.push({ k: "r", c: Lg * (b.e ? 0.72 : 0.5), w: Math.min(58, Lg * 0.3) });
    line(s, P, pt(A, off));
    let cur = 0;
    cm.forEach(m => {
        line(s, pt(A + cur, off), pt(A + m.c - m.w / 2, off));
        cur = m.c + m.w / 2;
        const o = A + m.c;
        if (m.k === "r") {
            const z = [pt(o - m.w / 2, off)];
            for (let i = 0; i < 6; i++) z.push(pt(o - m.w / 2 + (m.w * (i + 0.5)) / 6, off + (i % 2 ? 7 : -7)));
            z.push(pt(o + m.w / 2, off));
            el(s, "path", {
                d: "M" + z.map(p => p.join(" ")).join("L"),
                stroke: "var(--cu)",
                "stroke-width": 2.2,
                fill: "none"
            });
        } else {
            const c = pt(o, off);
            el(s, "circle", {
                cx: c[0],
                cy: c[1],
                r: 13,
                fill: "var(--bg)",
                stroke: "var(--ac)",
                "stroke-width": 2.2
            });
            const sg = b.e > 0 ? 1 : -1,
                pl = pt(o + sg * 6, off),
                mi = pt(o - sg * 6, off);
            el(s, "text", { x: pl[0], y: pl[1] + 4, "text-anchor": "middle", "font-size": 13, fill: "var(--ink)" }, "+");
            el(s, "text", { x: mi[0], y: mi[1] + 4, "text-anchor": "middle", "font-size": 13, fill: "var(--ink)" }, "−");
        }
    });
    line(s, pt(A + cur, off), pt(Lg + A, off));
    line(s, pt(Lg + A, off), Q);
    if (b.i) {
        const h = off - sd * 34,
            c = pt(d / 2, h);
        [-1, 1].forEach(q => {
            el(s, "path", {
                d: `M${pt(d / 2 + q * 20, off)}L${pt(d / 2 + q * 20, h)}L${pt(d / 2 + q * 13, h)}`.replace(/,/g, " "),
                stroke: "var(--ac)",
                "stroke-width": 2,
                fill: "none"
            });
        });
        el(s, "circle", { cx: c[0], cy: c[1], r: 12, fill: "var(--bg)", stroke: "var(--ac)", "stroke-width": 2 });
        const a1 = pt(d / 2 - 7, h),
            a2 = pt(d / 2 + 7, h);
        el(s, "path", {
            d: `M${a1[0]} ${a1[1]}L${a2[0]} ${a2[1]}`,
            stroke: "var(--ac)",
            "stroke-width": 2,
            "marker-end": "url(#ac)"
        });
    }
    const lb = pt(d / 2, off + sd * 26),
        tx = `b${b.n}: ${b.z ? b.z + "Ω" : ""}${b.e ? " " + b.e + "V" : ""}${b.i ? " " + b.i + "A" : ""}`;
    el(s, "text", { x: lb[0], y: lb[1], "text-anchor": "middle", "font-size": 13, fill: "var(--ink)" }, tx);
}

function drawGraphBranch(s, b, { P, Q, d, off, pt }) {
    const c = pt(d / 2, off * 2),
        isT = state.tree.includes(b),
        col = isT ? "var(--tree)" : "var(--lnk)",
        e = [
            Q[0] - ((Q[0] - c[0]) / Math.hypot(Q[0] - c[0], Q[1] - c[1])) * 17,
            Q[1] - ((Q[1] - c[1]) / Math.hypot(Q[0] - c[0], Q[1] - c[1])) * 17
        ];
    el(s, "path", {
        d: `M${P[0]} ${P[1]}Q${c[0]} ${c[1]} ${e[0]} ${e[1]}`,
        stroke: col,
        "stroke-width": 2.4,
        fill: "none",
        "stroke-dasharray": isT ? "" : "7 5",
        "marker-end": `url(#a${isT ? "tree" : "lnk"})`
    });
    const lp = pt(d / 2, off + (off >= 0 ? 1 : -1) * (off ? 14 : -14));
    el(
        s,
        "text",
        { x: lp[0], y: lp[1] + 4, "text-anchor": "middle", "font-size": 14, "font-weight": 700, fill: col },
        "b" + b.n
    );
}

function drawNodes(svgs) {
    const { info, pos } = state;
    svgs.forEach(s =>
        info.nodes.forEach(n => {
            const p = pos[n],
                g = el(s, "g", { "data-n": n, style: "cursor:grab" });
            el(g, "circle", { cx: p[0], cy: p[1], r: 15, fill: "var(--sf)", stroke: "var(--ink)", "stroke-width": 2 });
            el(
                g,
                "text",
                {
                    x: p[0],
                    y: p[1] + 5,
                    "text-anchor": "middle",
                    "font-size": 14,
                    "font-weight": 700,
                    fill: "var(--ink)"
                },
                n
            );
        })
    );
}

export function draw() {
    if (!state.info) return;
    layout(state.info.nodes);
    const s1 = $("c1"),
        s2 = $("c2");
    s1.innerHTML = "";
    s2.innerHTML = "";
    addMarkers(s2);
    state.br.forEach(b => {
        const g = geo(b);
        drawCircuitBranch(s1, b, g);
        drawGraphBranch(s2, b, g);
    });
    drawNodes([s1, s2]);
}
