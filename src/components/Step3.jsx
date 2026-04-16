import React, { useState, useCallback } from 'react';
import { C, fmt } from '../constants';
import { STAMP_B64, SIG_B64 } from '../constants/assets';
import { Card, Field, Inp, SecLabel, Txt } from './SharedUI';

function hasAmount(item) {
  return parseFloat(item.qty) > 0 && parseFloat(item.rate) > 0;
}

function MobileItemCard({ item, idx, onChange, onRemove }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, background: C.surface2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.text3 }}>Item {idx + 1}</span>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 18, fontWeight: 700, padding: "6px 10px", minHeight: 36 }}>✕</button>
      </div>
      <Field label="Description (one point per line)" hint="Press Enter to add a new bullet point">
        <Txt value={item.desc || ""} onChange={e => onChange(idx, "desc", e.target.value)} placeholder="Enter description..." style={{ minHeight: 92 }} />
      </Field>
      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Qty (optional)"><Inp type="number" min="0" value={item.qty || ""} onChange={e => onChange(idx, "qty", e.target.value)} placeholder="—" /></Field>
        <Field label="Unit"><Inp value={item.unit || ""} onChange={e => onChange(idx, "unit", e.target.value)} placeholder="SQM / Nos / LS" /></Field>
      </div>
      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        <Field label="Rate ₹ (optional)"><Inp type="number" min="0" step="0.01" value={item.rate || ""} onChange={e => onChange(idx, "rate", e.target.value)} placeholder="—" /></Field>
        <Field label="Amount ₹">
          <div style={{ padding: "10px 13px", background: hasAmount(item) ? "#f0ede8" : "#efefe9", borderRadius: 9, fontSize: 14, fontWeight: 700, color: hasAmount(item) ? C.accent : C.text3 }}>
            {hasAmount(item) ? "₹" + fmt(item.amount) : "—"}
          </div>
        </Field>
      </div>
    </div>
  );
}

function DesktopItemRow({ item, idx, onChange, onRemove }) {
  const cellStyle = { padding: "8px 6px", borderBottom: `1px solid ${C.surface2}`, verticalAlign: "top" };
  const inpBase = { width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "7px 8px", fontSize: 13, fontFamily: "inherit", background: "transparent", outline: "none" };
  const onF = e => e.target.style.borderColor = C.accent;
  const onB = e => e.target.style.borderColor = "transparent";
  return (
    <tr>
      <td style={{ ...cellStyle, textAlign: "center", fontSize: 12, color: C.text3, width: 28, paddingTop: 14 }}>{idx + 1}</td>
      <td style={cellStyle}>
        <textarea
          rows={Math.max(2, (item.desc || "").split("\n").length)}
          placeholder="Description (press Enter for new line / bullet)"
          value={item.desc || ""}
          onChange={e => onChange(idx, "desc", e.target.value)}
          onFocus={onF} onBlur={onB}
          style={{ ...inpBase, resize: "vertical", minHeight: 56, lineHeight: 1.5 }}
        />
      </td>
      <td style={{ ...cellStyle, width: 72 }}>
        <input type="number" min="0" value={item.qty || ""}
          onChange={e => onChange(idx, "qty", e.target.value)} onFocus={onF} onBlur={onB}
          placeholder="—" style={{ ...inpBase, textAlign: "center" }} />
      </td>
      <td style={{ ...cellStyle, width: 70 }}>
        <input type="text" value={item.unit || ""} onChange={e => onChange(idx, "unit", e.target.value)} onFocus={onF} onBlur={onB}
          placeholder="—" style={{ ...inpBase, textAlign: "center" }} />
      </td>
      <td style={{ ...cellStyle, width: 96 }}>
        <input type="number" min="0" step="0.01" value={item.rate || ""}
          onChange={e => onChange(idx, "rate", e.target.value)} onFocus={onF} onBlur={onB}
          placeholder="—" style={{ ...inpBase, textAlign: "right" }} />
      </td>
      <td style={{ ...cellStyle, width: 108, textAlign: "right", paddingRight: 10, fontWeight: 700, fontSize: 13, color: hasAmount(item) ? C.accent : C.text3, whiteSpace: "nowrap" }}>
        {hasAmount(item) ? "₹" + fmt(item.amount) : "—"}
      </td>
      <td style={{ ...cellStyle, width: 36 }}>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 20, padding: "4px 8px", borderRadius: 6, lineHeight: 1 }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fde8e8"; e.currentTarget.style.color = C.danger; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.text3; }}>×</button>
      </td>
    </tr>
  );
}

export default function Step3({ items, setItems, terms, setTerms, gstMode, setGstMode }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 640);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pricedItems = items.filter(hasAmount);
  const totSub = pricedItems.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;
  const anyPriced = pricedItems.length > 0;

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

  const addItem = () => setItems(prev => [...prev, { id: Date.now() + Math.random(), desc: "", qty: "", unit: "", rate: "", amount: 0 }]);
  const removeItem = (id) => setItems(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const f = (k) => ({ value: terms[k] || "", onChange: (e) => setTerms(k, e.target.value) });

  return (
    <>
      <Card icon="📦" title="Items / Description" sub="Press Enter inside Description to add multiple points. Qty & Rate are optional.">
        {!isMobile ? (
          <div style={{ overflowX: "auto", margin: "0 -4px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {["#", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)", ""].map((h, i) => (
                    <th key={i} style={{ padding: "9px 8px", fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `2px solid ${C.border}`, textAlign: i >= 4 ? "right" : i === 0 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <DesktopItemRow key={item.id} item={item} idx={idx} onChange={handleChange} onRemove={removeItem} />
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
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", background: "none", border: `1.5px dashed ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, color: C.text2, fontFamily: "inherit", width: "100%", marginTop: 10, justifyContent: "center", minHeight: 44 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
          ＋ Add Item / Description
        </button>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", background: C.surface2, borderRadius: 8, cursor: "pointer", fontSize: 13, color: C.text2 }}>
          <input type="checkbox" checked={!!terms.showTotals} onChange={e => setTerms("showTotals", e.target.checked)}
            style={{ accentColor: C.accent, width: 17, height: 17 }} />
          <span>Show subtotal, GST and Grand Total on quotation</span>
        </label>

        {terms.showTotals && anyPriced && (
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
        )}
      </Card>

      <Card icon="⚙️" title="Commercial Terms" sub="All fields below are free-text editable">
        <SecLabel>GST Type</SecLabel>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[["intra", "Intra-State (CGST+SGST 18%)"], ["inter", "Inter-State (IGST 18%)"]].map(([v, l]) => (
            <button key={v} onClick={() => setGstMode(v)}
              style={{ flex: "1 1 160px", padding: "10px 8px", border: `1.5px solid ${gstMode === v ? C.primary : C.border}`, borderRadius: 8, background: gstMode === v ? C.primary : C.surface, color: gstMode === v ? "#fff" : C.text2, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", minHeight: 44 }}>
              {l}
            </button>
          ))}
        </div>

        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Freight" hint="e.g. FOR Site / Ex-Works / To Pay / Inclusive">
            <Inp {...f("freight")} placeholder="Enter freight terms..." />
          </Field>
          <Field label="Freight Destination (optional)">
            <Inp {...f("freightDest")} placeholder="e.g. Noida Site, Sector 62" />
          </Field>
        </div>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Delivery Timeline">
            <Inp {...f("delivery")} placeholder="e.g. Within 2 weeks" />
          </Field>
          <Field label="Payment Terms">
            <Txt {...f("payment")} placeholder="e.g. 100% advance before dispatch..." style={{ minHeight: 70 }} />
          </Field>
        </div>

        <SecLabel>Terms &amp; Conditions</SecLabel>
        <Field label="Standard Terms &amp; Conditions" hint="Edit freely — one point per line. These appear as bullet points on the quotation.">
          <Txt {...f("notesExtra")} placeholder="Enter terms, one per line..." style={{ minHeight: 140 }} />
        </Field>

        <div style={{ marginTop: 14 }}>
          <SecLabel>Special Terms &amp; Conditions</SecLabel>
          <Field label="Special T&amp;C (optional)" hint="Add any special clauses unique to this quotation — one per line.">
            <Txt {...f("specialTerms")} placeholder="Optional — leave blank if none..." style={{ minHeight: 100 }} />
          </Field>
        </div>
      </Card>

      <Card icon="✍️" title="Signature & Stamp" sub="Auto-applied to preview and downloaded PDF">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap", padding: "4px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Company Stamp</div>
            <img src={STAMP_B64} alt="Stamp" style={{ height: 120, width: 120, objectFit: "contain", display: "block" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Signature</div>
            <img src={SIG_B64} alt="Signature" style={{ height: 70, maxWidth: 220, objectFit: "contain", display: "block" }} />
          </div>
          <div style={{ marginLeft: "auto", paddingBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.success }}>✓ Ready</div>
          </div>
        </div>
      </Card>
    </>
  );
}
