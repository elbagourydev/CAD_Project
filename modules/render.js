// HTML output: matrices, solution steps, results and loop equations.

import { $, fmt } from "./utils.js";
import { treePath } from "./graph.js";

export const mat = (t, M, rl, cl) =>
    `<div class="mat"><b>${t}</b><table><tr><th></th>${cl.map(c => `<th>${c}</th>`).join("")}</tr>${M.map((r, i) => `<tr><th>${rl[i]}</th>${r.map(v => `<td>${fmt(v)}</td>`).join("")}</tr>`).join("")}</table></div>`;

const bn = br => br.map(b => "b" + b.n);
const col = v => v.map(x => [x]); // vector -> column matrix

export function tieStepsHTML(br, lk, d) {
    const B = bn(br),
        Lr = lk.map((_, i) => "L" + (i + 1));
    return (
        mat("EB", d.E, B, ["V"]) +
        mat("IB", d.I, B, ["A"]) +
        mat("B", d.Bm, Lr, B) +
        mat("ZB", d.Z, B, B) +
        `<div class="eq">B.ZB.Bt.IL = B.EB - B.ZB.IB</div>` +
        mat("B.ZB.Bt", d.A, Lr, Lr) +
        mat("B.EB - B.ZB.IB", d.rhs, Lr, ["rhs"]) +
        mat("IL", col(d.IL), Lr, ["A"]) +
        `<div class="eq">JB = BT.IL</div>` +
        mat("JB", d.J, B, ["A"]) +
        `<div class="eq">VB = ZB (JB + IB) − EB</div>` +
        mat("VB", col(d.Vb), B, ["V"])
    );
}

export function cutStepsHTML(br, tree, d) {
    const B = bn(br),
        Tn = tree.map(b => "T" + b.n);
    return (
        mat("EB", d.E, B, ["V"]) +
        mat("IB", d.I, B, ["A"]) +
        mat("C", d.C, Tn, B) +
        mat("YB", d.Y, B, B) +
        `<div class="eq">C.YB.Ct.VT = C.IB - C.YB.EB</div>` +
        mat("C.YB.Ct", d.A, Tn, Tn) +
        mat("C.IB - C.YB.EB", d.rhs, Tn, ["rhs"]) +
        mat("VT", col(d.VT), Tn, ["V"]) +
        `<div class="eq">VB = CT.VT</div>` +
        mat("VB", col(d.Vb), B, ["V"]) +
        `<div class="eq">JB = YB (VB + EB) − IB</div>` +
        mat("JB", d.J, B, ["A"])
    );
}

function loopsText(tree, lk) {
    return lk.length
        ? "Loops: " +
              lk
                  .map(
                      (l, i) =>
                          "L" +
                          (i + 1) +
                          " = b" +
                          l.n +
                          Object.keys(treePath(tree, l.t, l.f))
                              .map(k => " + b" + k)
                              .join("")
                  )
                  .join(" , ")
        : "The network is a tree – no loops";
}

export function showResults({ steps, br, tree, lk, J, Vb }) {
    $("steps").innerHTML = steps;
    $("res").innerHTML = mat("JB", J, bn(br), ["A"]) + mat("VB", col(Vb), bn(br), ["V"]);
    $("out").hidden = false;
    $("loops").textContent = loopsText(tree, lk);
}

export function showError(message) {
    $("msg").textContent = message;
}

export function clearError() {
    $("msg").textContent = "";
}
