export const SUBJECT_CHIPS = [
  { label: "Profile Sheet",           prefix: "Supply of Profile Sheet" },
  { label: "GI Deck Sheet Fix",       prefix: "Supply and Fixing of Galvanized Deck Sheet" },
  { label: "MS Deck Sheet",           prefix: "Supply of MS Rolla Deck Sheet" },
  { label: "GI Deck Sheet",           prefix: "Supply of GI Deck Sheet" },
  { label: "PPGL Sheet",              prefix: "Supply of PPGL Profile Sheet" },
  { label: "Custom…",                 prefix: "Supply of" },
];

export const DEFAULT_TERMS = `Unloading and related arrangements shall be carried out by you immediately upon receipt of the material at your plant.
Halting charges shall be Rs.2,000 per day in case of any delay, for any reason.`;

export const DEFAULT_SPECIAL_TERMS = `Price Variation Clause: In the event of any increase in the market prices of raw materials, our quoted rates shall be revised accordingly.`;

export const C = {
  primary: "#1a1a2e", accent: "#c8a951", accent2: "#b8943f",
  surface: "#ffffff", surface2: "#f7f6f3", border: "#e0ddd5",
  text: "#1a1a2e", text2: "#6b6560", text3: "#9e9890",
  danger: "#c0392b", success: "#27ae60",
  highlight: "#1e40af",
};

export const isRateLine = (line) => /^\s*rate\s*:/i.test(line || "");

export const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => { if (!d) return ""; const p = d.split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d; };
export const today = () => new Date().toISOString().split("T")[0];

const stripRevision = (s) => String(s || "").replace(/-R\d+$/i, "");

export const newQNumber = (s) => {
  if (!s) return s;
  const base = stripRevision(s);
  const m = base.match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return base;
  const [, head, num, tail] = m;
  const next = String(parseInt(num, 10) + 1).padStart(num.length, "0");
  return head + next + tail;
};

export const reviseQNumber = (s) => {
  if (!s) return s;
  const m = String(s).match(/^(.*)-R(\d+)$/i);
  if (m) {
    const [, base, n] = m;
    return base + "-R" + (parseInt(n, 10) + 1);
  }
  return s + "-R1";
};
