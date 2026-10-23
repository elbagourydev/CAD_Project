// Drag nodes with the mouse/touch; calls `onMove` to redraw.

import { $ } from "./utils.js";
import { state } from "./state.js";

export function initDrag(onMove) {
    let drag = null;
    [$("c1"), $("c2")].forEach(s =>
        s.addEventListener("pointerdown", e => {
            const g = e.target.closest("[data-n]");
            if (g) {
                drag = { n: +g.dataset.n, s };
                e.preventDefault();
            }
        })
    );
    addEventListener("pointermove", e => {
        if (!drag) return;
        const r = drag.s.getBoundingClientRect();
        state.pos[drag.n] = [
            Math.max(20, Math.min(540, ((e.clientX - r.left) / r.width) * 560)),
            Math.max(20, Math.min(380, ((e.clientY - r.top) / r.height) * 400))
        ];
        onMove();
    });
    addEventListener("pointerup", () => (drag = null));
}
