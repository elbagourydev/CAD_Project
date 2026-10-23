// Small shared helpers (DOM lookup + number formatting)

export const $ = id => document.getElementById(id);

export const fmt = n => (Math.abs(n) < 1e-9 ? "0" : String(+n.toPrecision(5)));
