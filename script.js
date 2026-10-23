// Main entry point: wires all the modules together.
// Load with: <script type="module" src="script.js"></script>

import { $ } from "./modules/utils.js";
import { state } from "./modules/state.js";
import { EXAMPLE, addRow, loadRows, readBranches } from "./modules/table.js";
import { buildTree } from "./modules/graph.js";
import { solveTieSet, solveCutSet } from "./modules/solvers.js";
import { tieStepsHTML, cutStepsHTML, showResults, showError, clearError } from "./modules/render.js";
import { draw } from "./modules/diagram.js";
import { initDrag } from "./modules/drag.js";

function run() {
    clearError();
    try {
        const br = (state.br = readBranches());
        if (!br.length) throw Error("Add at least one branch");

        const { nodes, tree, lk } = buildTree(br);
        state.tree = tree;

        let result, steps, info;
        if ($("m").value === "tie") {
            result = solveTieSet(br, tree, lk);
            steps = tieStepsHTML(br, lk, result);
            info = { lk, Bm: result.Bm };
        } else {
            result = solveCutSet(br, tree);
            steps = cutStepsHTML(br, tree, result);
            info = { C: result.C };
        }
        state.info = { ...info, nodes };

        showResults({ steps, br, tree, lk, J: result.J, Vb: result.Vb });
        draw();
    } catch (e) {
        showError(e.message);
    }
}

// Events
$("go").onclick = run;
$("add").onclick = () => addRow([0, 1, 1, 0, 0]);
$("ex").onclick = () => {
    loadRows(EXAMPLE);
    run();
};
initDrag(draw);

// Start
loadRows(EXAMPLE);
run();
