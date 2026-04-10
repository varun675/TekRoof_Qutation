import React, { useState, useCallback } from 'react';
import { C, FREIGHT_OPTIONS, PAY_OPTIONS, SCOPE_OPTIONS, fmt } from '../constants';
import { STAMP_B64, SIG_B64 } from '../constants/assets';
import { Card, Field, Inp, SecLabel, Sel, Txt, Chip } from './SharedUI';

function ItemRow({ item, idx, onChange, onRemove }) {
  const cellStyle = { padding: "7px 4px", borderBottom: `1px solid ${C.surface2}` };
  const numInp = (k) => ({
    type: "number", min: "0", value: item[k] || "",
    onChange: e => onChange(idx, k, e.target.value),
    style: { width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "7px 6px", fontSize: 13, fontFamily: "inherit", background: "transparent", outline: "none", textAlign: "right" },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = "transparent",
  });
  return (
    <tr>
      <td style={{ ...cellStyle, textAlign: "center", fontSize: 12, color: C.text3, width: 28 }}>{idx + 1}</td>
      <td style={cellStyle}>
        <input type="text" placeholder="Description of goods / service" value={item.desc || ""}
          onChange={e => onChange(idx, "desc", e.target.value)}
          style={{ width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "7px 8px", fontSize: 13, fontFamily: "inherit", background: "transparent", outline: "none" }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "transparent"}
        />
      </td>
      <td style={{ ...cellStyle, width: 68 }}><input {...numInp("qty")} style={{ ...numInp("qty").style, textAlign: "center" }} placeholder="0" /></td>
      <td style={{ ...cellStyle, width: 62 }}>
        <input type="text" value={item.unit || "SQM"} onChange={e => onChange(idx, "unit", e.target.value)}
          style={{ width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "7px 6px", fontSize: 13, fontFamily: "inherit", background: "transparent", outline: "none", textAlign: "center" }}
          onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = "transparent"}
        />
      </td>
      <td style={{ ...cellStyle, width: 88 }}><input {...numInp("rate")} step="0.01" placeholder="0.00" /></td>
      <td style={{ ...cellStyle, width: 100, textAlign: "right", paddingRight: 10, fontWeight: 700, fontSize: 13, color: C.accent, whiteSpace: "nowrap" }}>₹{fmt(item.amount)}</td>
      <td style={{ ...cellStyle, width: 34 }}>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 18, padding: "2px 6px", borderRadius: 6, lineHeight: 1 }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fde8e8"; e.currentTarget.style.color = C.danger; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.text3; }}>×</button>
      </td>
    </tr>
  );
}

function MobileItemCard({ item, idx, onChange, onRemove }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: C.surface2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text3 }}>Item {idx + 1}</span>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 16, fontWeight: 700 }}>✕</button>
      </div>
      <Field label="Description"><Inp value={item.desc || ""} onChange={e => onChange(idx, "desc", e.target.value)} placeholder="Description" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Qty"><Inp type="number" min="0" value={item.qty || ""} onChange={e => onChange(idx, "qty", e.target.value)} placeholder="0" /></Field>
        <Field label="Unit"><Inp value={item.unit || "SQM"} onChange={e => onChange(idx, "unit", e.target.value)} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Rate (₹)"><Inp type="number" min="0" step="0.01" value={item.rate || ""} onChange={e => onChange(idx, "rate", e.target.value)} placeholder="0.00" /></Field>
        <Field label="Amount (₹)"><div style={{ padding: "10px 13px", background: "#f0ede8", borderRadius: 9, fontSize: 14, fontWeight: 700, color: C.accent }}>₹{fmt(item.amount)}</div></Field>
      </div>
    </div>
  );
}

export default function Step3({ items, setItems, terms, setTerms, activeNotes, toggleNote, scopeChecked, toggleScope, gstMode, setGstMode }) {
  const [isMobile] = useState(() => window.innerWidth <= 540);
  const totSub = items.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;

  const handleChange = useCallback((idx, key, val) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, [key]: val };
      const q = parseFloat(key === "qty" ? val : updated.qty) || 0;
      const r = parseFloat(key === "rate" ? val : updated.rate) || 0;
      updated.amount = q * r;
      return updated;
    }));
  }, [setItems]);

  const addItem = () => setItems(prev => [...prev, { id: Date.now() + Math.random(), desc: "", qty: "", unit: "SQM", rate: "", amount: 0 }]);
  const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const f = (k) => ({ value: terms[k] || "", onChange: (e) => setTerms(p => ({ ...p, [k]: e.target.value })) });

  return (
    <>
      <Card icon="📦" title="Items / Products" sub="Amount = Qty × Rate (live auto-calculation)">
        {!isMobile ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {["#", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)", ""].map((h, i) => (
                    <th key={i} style={{ padding: "9px 8px", fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `2px solid ${C.border}`, textAlign: i >= 4 ? "right" : i === 0 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <ItemRow key={item.id} item={item} idx={idx} onChange={handleChange} onRemove={removeItem} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            {items.map((item, idx) => (
              <MobileItemCard key={item.id} item={item} idx={idx} onChange={handleChange} onRemove={removeItem} />
            ))}
          </div>
        )}

        <button onClick={addItem}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "none", border: `1.5px dashed ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, color: C.text2, fontFamily: "inherit", width: "100%", marginTop: 10, justifyContent: "center" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
          ＋ Add Item
        </button>

        <div style={{ background: C.surface2, borderRadius: 10, padding: "14px 18px", marginTop: 14, border: `1px solid ${C.border}` }}>
          {(gstMode === "intra"
            ? [["Subtotal (Ex-GST)", totSub], ["CGST @ 9%", gstAmt / 2], ["SGST @ 9%", gstAmt / 2]]
            : [["Subtotal (Ex-GST)", totSub], ["IGST @ 18%", gstAmt]]
          ).map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: C.text2 }}>
              <span>{l}</span><span>₹{fmt(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", marginTop: 8, borderTop: `2px solid ${C.border}`, fontSize: 16, fontWeight: 700 }}>
            <span>Grand Total</span><span style={{ color: C.accent }}>₹{fmt(totSub + gstAmt)}</span>
          </div>
        </div>
      </Card>

      <Card icon="⚙️" title="Terms & Conditions">
        <SecLabel>GST Type</SecLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["intra", "Intra-State (CGST+SGST 18%)"], ["inter", "Inter-State (IGST 18%)"]].map(([v, l]) => (
            <button key={v} onClick={() => setGstMode(v)}
              style={{ flex: 1, padding: "9px 8px", border: `1.5px solid ${gstMode === v ? C.primary : C.border}`, borderRadius: 8, background: gstMode === v ? C.primary : C.surface, color: gstMode === v ? "#fff" : C.text2, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Freight"><Sel {...f("freight")}>{FREIGHT_OPTIONS.map(o => <option key={o}>{o}</option>)}</Sel></Field>
          <Field label="Freight Destination"><Inp {...f("freightDest")} placeholder="e.g. Firozabad Site" /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Delivery Timeline"><Inp {...f("delivery")} placeholder="e.g. Within 2 weeks" /></Field>
          <Field label="Payment Terms">
            <Sel {...f("payment")}>{PAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</Sel>
          </Field>
        </div>
        {terms.payment === "custom" && (
          <Field label="Custom Payment Terms" style={{ marginBottom: 13 }}><Inp {...f("paymentCustom")} placeholder="Enter terms..." /></Field>
        )}

        <SecLabel>Scope of Work (optional)</SecLabel>
        {SCOPE_OPTIONS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 6, background: C.surface }}>
            <input type="checkbox" checked={scopeChecked.includes(i)} onChange={() => toggleScope(i)} style={{ accentColor: C.accent, width: 15, height: 15, flexShrink: 0 }} />
            <label style={{ fontSize: 13, color: C.text2, cursor: "pointer" }} onClick={() => toggleScope(i)}>{s}</label>
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <Field label="Additional Scope"><Inp {...f("scopeCustom")} placeholder="Other scope items..." /></Field>
        </div>

        <SecLabel>Notes</SecLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
          {[1,2,3,4,5,6].map(n => (
            <Chip key={n} active={activeNotes.has(n)} onClick={() => toggleNote(n)}>
              {["Unloading by client","Transit insurance","Price variation","Halting ₹2k/day","Idle sitting ₹3k/day","Crane by client"][n-1]}
            </Chip>
          ))}
        </div>
        <Field label="Additional Notes"><Txt {...f("notesExtra")} placeholder="Any additional notes or conditions..." /></Field>
      </Card>

      <Card icon="✍️" title="Signature & Stamp" sub="Auto-applied to preview and downloaded PDF">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap", padding: "4px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Company Stamp</div>
            <img src={STAMP_B64} alt="Stamp" style={{ height: 140, width: 140, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ width: 1, height: 110, background: C.border, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Signature — Mohit Sharma</div>
            <img src={SIG_B64} alt="Signature" style={{ height: 80, maxWidth: 240, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right", paddingBottom: 4 }}>
            <div style={{ fontSize: 12, color: C.text3 }}>Will appear in preview</div>
            <div style={{ fontSize: 12, color: C.text3 }}>and downloaded PDF</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.success, marginTop: 8 }}>✓ Ready</div>
          </div>
        </div>
      </Card>
    </>
  );
}
