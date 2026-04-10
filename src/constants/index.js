export const NOTE_TEXTS = {
  1: "Unloading etc. will be arranged by you.",
  2: "Transit insurance to be covered by you.",
  3: "Price variation clause applicable. In case prices of raw material increase in market, our rate will increase accordingly.",
  4: "Halting charges shall be Rs.2,000 per day in case of any delay, for any reason.",
  5: "Idle sitting charges @ Rs.3,000/- per day will be paid by you in case of any reason.",
  6: "You will provide Hydra/Crane for movement of deck sheet on each working area free of cost.",
};

export const SUBJECT_CHIPS = [
  { label: "Profile Sheet",           prefix: "Supply of Profile Sheet" },
  { label: "GI Deck Sheet Fix",       prefix: "Supply and Fixing of Galvanized Deck Sheet" },
  { label: "MS Deck Sheet",           prefix: "Supply of MS Rolla Deck Sheet" },
  { label: "GI Deck Sheet",           prefix: "Supply of GI Deck Sheet" },
  { label: "PPGL Sheet",              prefix: "Supply of PPGL Profile Sheet" },
  { label: "Custom…",                 prefix: "Supply of" },
];

export const SCOPE_OPTIONS = [
  "Supply and installation of GI fasteners (8mm × 75mm)",
  "Cutting of deck sheets as required",
  "Grinding works related to deck sheet installation",
  "Provision of all necessary labour for complete execution",
];

export const PAY_OPTIONS = [
  { value: "100adv", label: "100% Advance before dispatch",         text: "You will release 100% advance payment before dispatch as per bank details." },
  { value: "50adv",  label: "50% with PO, balance vs Proforma",     text: "50% advance with PO, balance against Proforma Invoice before dispatch." },
  { value: "100pi",  label: "100% advance vs Proforma Invoice",     text: "100% advance against Proforma Invoice before dispatch." },
  { value: "custom", label: "Custom…",                              text: "" },
];

export const FREIGHT_OPTIONS = ["Extra (Ex-Works)", "FOR Site", "To Pay Extra", "Inclusive", "Ex Works Unnao"];

export const C = {
  primary: "#1a1a2e", accent: "#c8a951", accent2: "#b8943f",
  surface: "#ffffff", surface2: "#f7f6f3", border: "#e0ddd5",
  text: "#1a1a2e", text2: "#6b6560", text3: "#9e9890",
  danger: "#c0392b", success: "#27ae60",
};

export const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => { if (!d) return ""; const p = d.split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d; };
export const today = () => new Date().toISOString().split("T")[0];
