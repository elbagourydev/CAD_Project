// Pure linear-algebra helpers (no DOM, no state)

export const T = A => A[0].map((_, j) => A.map(r => r[j]));

export const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));

// Gauss-Jordan elimination with partial pivoting: solves A·x = b
export function solve(A, b) {
    const n = A.length,
        M = A.map((r, i) => [...r, b[i]]);
    for (let i = 0; i < n; i++) {
        let p = i;
        for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
        if (Math.abs(M[p][i]) < 1e-12) throw Error("Singular matrix – check connectivity and Z values");
        [M[i], M[p]] = [M[p], M[i]];
        for (let r = 0; r < n; r++)
            if (r !== i) {
                const f = M[r][i] / M[i][i];
                for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c];
            }
    }
    return M.map((r, i) => r[n] / r[i]);
}
