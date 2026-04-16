export const SUBJECT_CHIPS = [
  { label: "Profile Sheet",           prefix: "Supply of Profile Sheet" },
  { label: "GI Deck Sheet Fix",       prefix: "Supply and Fixing of Galvanized Deck Sheet" },
  { label: "MS Deck Sheet",           prefix: "Supply of MS Rolla Deck Sheet" },
  { label: "GI Deck Sheet",           prefix: "Supply of GI Deck Sheet" },
  { label: "PPGL Sheet",              prefix: "Supply of PPGL Profile Sheet" },
  { label: "Custom…",                 prefix: "Supply of" },
];

export const DEFAULT_TERMS = `1. Unloading etc. will be arranged by you.
2. Transit insurance to be covered by you.
3. Price variation clause applicable. In case prices of raw material increase in market, our rate will increase accordingly.
4. Material should be packed properly to avoid damage during transit.`;

export const C = {
  primary: "#1a1a2e", accent: "#c8a951", accent2: "#b8943f",
  surface: "#ffffff", surface2: "#f7f6f3", border: "#e0ddd5",
  text: "#1a1a2e", text2: "#6b6560", text3: "#9e9890",
  danger: "#c0392b", success: "#27ae60",
};

export const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => { if (!d) return ""; const p = d.split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d; };
export const today = () => new Date().toISOString().split("T")[0];
