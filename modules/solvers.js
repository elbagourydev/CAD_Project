// The two analysis methods. Pure math: they return matrices, no HTML.

import { T, mul, solve } from "./matrix.js";
import { tieSet, cutSet } from "./graph.js";

// Diagonal impedance matrix Z, plus voltage (E) and current (I) source columns
function branchMatrices(br) {
    return {
        Z: br.map((b, i) => br.map((_, j) => (i === j ? b.z : 0))),
        E: br.map(b => [b.e]),
        I: br.map(b => [b.i])
    };
}

// Tie-set (loop) analysis:  B·ZB·Bᵗ·IL = B·EB − B·ZB·IB
export function solveTieSet(br, tree, lk) {
    if (!lk.length) throw Error("No loops – use Cut-set");
    const { Z, E, I } = branchMatrices(br),
        Bm = tieSet(br, tree, lk),
        BZ = mul(Bm, Z),
        A = mul(BZ, T(Bm)),
        BZI = mul(BZ, I),
        rhs = mul(Bm, E).map((r, i) => [r[0] - BZI[i][0]]),
        IL = solve(
            A,
            rhs.map(r => r[0])
        ),
        J = mul(
            T(Bm),
            IL.map(v => [v])
        ),
        Vb = br.map((b, i) => b.z * (J[i][0] + b.i) - b.e);
    return { Z, E, I, Bm, A, rhs, IL, J, Vb };
}

// Cut-set analysis:  C·YB·Cᵗ·VT = C·IB − C·YB·EB
export function solveCutSet(br, tree) {
    if (br.some(b => b.z === 0)) throw Error("Cut-set needs Z ≠ 0 on every branch – try Tie-set");
    const { Z, E, I } = branchMatrices(br),
        C = cutSet(br, tree),
        Y = Z.map((r, i) => r.map((_, j) => (i === j ? 1 / br[i].z : 0))),
        CY = mul(C, Y),
        A = mul(CY, T(C)),
        CI = mul(C, I),
        CYE = mul(CY, E),
        rhs = CI.map((r, i) => [r[0] - CYE[i][0]]),
        VT = solve(
            A,
            rhs.map(r => r[0])
        ),
        V = mul(
            T(C),
            VT.map(v => [v])
        ),
        J = br.map((b, i) => [(V[i][0] + b.e) / b.z - b.i]),
        Vb = br.map((b, i) => b.z * (J[i][0] + b.i) - b.e);
    return { Z, E, I, C, Y, A, rhs, VT, J, Vb };
}
