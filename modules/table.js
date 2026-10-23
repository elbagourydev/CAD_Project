// Branch input table: build rows, load data, read values back.

import { $ } from "./utils.js";
import { state } from "./state.js";

export const EXAMPLE = [
    [0, 1, 5, 10, 0],
    [1, 0, 5, 0, 0],
    [1, 2, 10, 0, 0],
    [2, 0, 5, 0, 0]
];

export function addRow(a = [1, 2, 10, 0, 0]) {
    const tr = document.createElement("tr");
    tr.innerHTML =
        a.map(v => `<td><input type="number" step="any" value="${v}"></td>`).join("") +
        `<td><button aria-label="Delete">×</button></td>`;
    tr.querySelector("button").onclick = () => tr.remove();
    $("tb").appendChild(tr);
}

export function renderHeader() {
    $("tb").innerHTML = "<tr><th>From</th><th>To</th><th>ZB (Ω)</th><th>EB (V)</th><th>IB (A)</th><th></th></tr>";
}

export function loadRows(rows) {
    renderHeader();
    rows.forEach(r => addRow(r));
    state.pos = {}; // new data -> re-layout nodes
}

export function readBranches() {
    return [...$("tb").querySelectorAll("tr")].slice(1).map((tr, i) => {
        const v = [...tr.querySelectorAll("input")].map(x => parseFloat(x.value) || 0);
        return { n: i + 1, f: v[0], t: v[1], z: v[2], e: v[3], i: v[4] };
    });
}
