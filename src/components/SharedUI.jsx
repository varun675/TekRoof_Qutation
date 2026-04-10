import React, { useState } from 'react';
import { C } from '../constants';

const inputCss = (err) => ({
  width: "100%", padding: "10px 13px",
  border: `1.5px solid ${err ? C.danger : C.border}`,
  borderRadius: 9, fontFamily: "inherit", fontSize: 14,
  color: C.text, background: C.surface, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s",
});

export function Inp({ err, style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      style={{ ...inputCss(err), borderColor: focus ? C.accent : err ? C.danger : C.border, ...style }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      {...props}
    />
  );
}

export function Sel({ children, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <select
      style={{ ...inputCss(false), borderColor: focus ? C.accent : C.border, appearance: "none", cursor: "pointer" }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      {...props}
    >{children}</select>
  );
}

export function Txt({ style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea
      style={{ ...inputCss(false), borderColor: focus ? C.accent : C.border, resize: "vertical", minHeight: 76, ...style }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      {...props}
    />
  );
}

export function Field({ label, req, hint, err, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.text2, marginBottom: 5, letterSpacing: "0.3px" }}>
        {label}{req && <span style={{ color: C.accent, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{hint}</div>}
      {err  && <div style={{ fontSize: 11, color: C.danger, marginTop: 3 }}>{err}</div>}
    </div>
  );
}

export function Card({ icon, title, sub, children }) {
  return (
    <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(26,26,46,0.07)", marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "15px 22px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${C.primary},#2d2d5e)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: C.text3 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ padding: "18px 22px" }}>{children}</div>
    </div>
  );
}

export function SecLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "1px", margin: "16px 0 10px", paddingBottom: 6, borderBottom: `1px dashed ${C.border}` }}>{children}</div>;
}

export function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "6px 13px", border: `1px solid ${active ? C.primary : C.border}`, borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: active ? C.primary : C.surface, color: active ? "#fff" : C.text2, transition: "all 0.18s" }}>
      {children}
    </button>
  );
}

export function G2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>{children}</div>; }
export function G3({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13 }}>{children}</div>; }
