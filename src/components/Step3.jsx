import React, { useState, useCallback, useEffect } from 'react';
import { C, fmt } from '../constants';
import { STAMP_B64, SIG_B64 } from '../constants/assets';
import { Card, Field, Inp, SecLabel, Txt } from './SharedUI';

const isPriced = (item) => parseFloat(item.qty) > 0 && parseFloat(item.rate) > 0;

function firstLine(text, maxChars = 60) {
  const t = (text || "").trim();
  if (!t) return "";
  const first = t.split(/\r?\n/)[0];
  return first.length > maxChars ? first.slice(0, maxChars - 1) + "…" : first;
}

// ── MOBILE ACCORDION ITEM ──
function MobileAccordionItem({ item, idx, total, expanded, showPricing, onExpand, onChange, onRemove, onDuplicate, onMove }) {
  const priced = showPricing && isPriced(item);
  const summary = !showPricing
    ? "Description only"
    : priced
      ? `${item.qty} ${item.unit || ""} × ₹${fmt(parseFloat(item.rate) || 0)}`
      : "No pricing yet";

  if (!expanded) {
    return (
      <button
        onClick={onExpand}
        style={{
          display: "block", width: "100%", textAlign: "left", cursor: "pointer",
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "12px 14px", marginBottom: 8, fontFamily: "inherit", color: "inherit",
        }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: showPricing ? 4 : 0 }}>
          <span style={{ display: "inline-flex", flexShrink: 0, width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: C.surface2, fontSize: 12, fontWeight: 700, color: C.text2 }}>{idx + 1}</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: C.text, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
            {firstLine(item.desc) || <span style={{ color: C.text3, fontStyle: "italic" }}>Empty description — tap to edit</span>}
          </span>
          <span style={{ fontSize: 18, color: C.text3, marginTop: -2 }}>⌄</span>
        </div>
        {showPricing && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, paddingLeft: 32, fontSize: 12 }}>
            <span style={{ color: C.text3, fontStyle: priced ? "normal" : "italic" }}>{summary}</span>
            <span style={{ fontWeight: 700, color: priced ? C.accent : C.text3 }}>{priced ? `₹${fmt(item.amount)}` : ""}</span>
          </div>
        )}
      </button>
    );
  }

  const actionBtn = (label, onClick, disabled = false, danger = false) => (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        flex: "0 0 auto", padding: "8px 10px", minHeight: 38, borderRadius: 8,
        border: `1px solid ${danger ? "#f3c9c4" : C.border}`,
        background: danger ? "#fff5f3" : C.surface,
        color: disabled ? C.text3 : danger ? C.danger : C.text2,
        fontSize: 12, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, fontFamily: "inherit",
      }}>
      {label}
    </button>
  );

  return (
    <div style={{
      border: `1.5px solid ${C.accent}`, borderRadius: 12, padding: 14, marginBottom: 10,
      background: C.surface, boxShadow: "0 4px 14px rgba(200,169,81,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: C.accent, color: C.primary, fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Item {idx + 1}</span>
        </div>
        <button onClick={onExpand} style={{ background: "none", border: "none", fontSize: 18, color: C.text3, cursor: "pointer", padding: "4px 8px" }}>⌃</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {actionBtn("↑ Up", () => onMove(-1), idx === 0)}
        {actionBtn("↓ Down", () => onMove(1), idx === total - 1)}
        {actionBtn("📋 Duplicate", onDuplicate)}
        <div style={{ flex: 1 }} />
        {actionBtn("✕ Delete", onRemove, total === 1, true)}
      </div>

      <Field label="Description" hint="One point per line. Press Enter for a new bullet.">
        <Txt
          value={item.desc || ""}
          onChange={(e) => onChange("desc", e.target.value)}
          placeholder={"e.g.\nSupply of profile sheet 0.50 mm\nColour: Blue, Make: AM/NS\nLength: 3000 mm"}
          style={{ minHeight: 140 }}
        />
      </Field>

      {showPricing && (
        <>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <Field label="Qty"><Inp type="number" min="0" value={item.qty || ""} onChange={(e) => onChange("qty", e.target.value)} placeholder="0" /></Field>
            <Field label="Unit"><Inp value={item.unit || ""} onChange={(e) => onChange("unit", e.target.value)} placeholder="SQM / Nos / LS" /></Field>
          </div>
          <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <Field label="Rate ₹"><Inp type="number" min="0" step="0.01" value={item.rate || ""} onChange={(e) => onChange("rate", e.target.value)} placeholder="0.00" /></Field>
            <Field label="Amount ₹">
              <div style={{ padding: "11px 13px", background: priced ? "#f7f2e2" : C.surface2, borderRadius: 9, fontSize: 15, fontWeight: 700, color: priced ? C.accent : C.text3, minHeight: 44, display: "flex", alignItems: "center" }}>
                {priced ? `₹${fmt(item.amount)}` : "—"}
              </div>
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

// ── DESKTOP TABLE ROW ──
function DesktopItemRow({ item, idx, total, showPricing, onChange, onRemove, onDuplicate, onMove }) {
  const cellStyle = { padding: "8px 6px", borderBottom: `1px solid ${C.surface2}`, verticalAlign: "top" };
  const inpBase = { width: "100%", border: "1px solid transparent", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", background: "transparent", outline: "none" };
  const onF = (e) => (e.target.style.borderColor = C.accent);
  const onB = (e) => (e.target.style.borderColor = "transparent");
  const priced = showPricing && isPriced(item);

  return (
    <tr>
      <td style={{ ...cellStyle, textAlign: "center", fontSize: 12, color: C.text3, width: 28, paddingTop: 14 }}>{idx + 1}</td>
      <td style={cellStyle}>
        <textarea
          rows={Math.max(3, (item.desc || "").split("\n").length)}
          placeholder="Description (press Enter for new line / bullet)"
          value={item.desc || ""}
          onChange={(e) => onChange("desc", e.target.value)}
          onFocus={onF} onBlur={onB}
          style={{ ...inpBase, resize: "vertical", minHeight: 70, lineHeight: 1.55 }}
        />
      </td>
      {showPricing && (
        <>
          <td style={{ ...cellStyle, width: 72 }}>
            <input type="number" min="0" value={item.qty || ""}
              onChange={(e) => onChange("qty", e.target.value)}
              onFocus={onF} onBlur={onB} placeholder="0" style={{ ...inpBase, textAlign: "center" }} />
          </td>
          <td style={{ ...cellStyle, width: 70 }}>
            <input type="text" value={item.unit || ""} onChange={(e) => onChange("unit", e.target.value)}
              onFocus={onF} onBlur={onB} placeholder="—" style={{ ...inpBase, textAlign: "center" }} />
          </td>
          <td style={{ ...cellStyle, width: 96 }}>
            <input type="number" min="0" step="0.01" value={item.rate || ""}
              onChange={(e) => onChange("rate", e.target.value)}
              onFocus={onF} onBlur={onB} placeholder="0.00" style={{ ...inpBase, textAlign: "right" }} />
          </td>
          <td style={{ ...cellStyle, width: 108, textAlign: "right", paddingRight: 10, fontWeight: 700, fontSize: 13, color: priced ? C.accent : C.text3, whiteSpace: "nowrap" }}>
            {priced ? "₹" + fmt(item.amount) : "—"}
          </td>
        </>
      )}
      <td style={{ ...cellStyle, width: 96 }}>
        <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <button onClick={() => onMove(-1)} disabled={idx === 0} title="Move up"
            style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: C.text3, fontSize: 14, padding: "4px 6px", opacity: idx === 0 ? 0.4 : 1 }}>↑</button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} title="Move down"
            style={{ background: "none", border: "none", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: C.text3, fontSize: 14, padding: "4px 6px", opacity: idx === total - 1 ? 0.4 : 1 }}>↓</button>
          <button onClick={onDuplicate} title="Duplicate"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.text3, fontSize: 13, padding: "4px 6px" }}>📋</button>
          <button onClick={onRemove} title="Delete" disabled={total === 1}
            style={{ background: "none", border: "none", cursor: total === 1 ? "not-allowed" : "pointer", color: C.text3, fontSize: 18, padding: "2px 6px", borderRadius: 6, lineHeight: 1, opacity: total === 1 ? 0.4 : 1 }}
            onMouseEnter={(e) => { if (total > 1) { e.currentTarget.style.background = "#fde8e8"; e.currentTarget.style.color = C.danger; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.text3; }}>×</button>
        </div>
      </td>
    </tr>
  );
}

export default function Step3({ items, setItems, terms, setTerms, gstMode, setGstMode }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= 640);
  const [expandedId, setExpandedId] = useState(() => (items[0] ? items[0].id : null));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showPricing = terms.showPricing !== false;
  const pricedItems = showPricing ? items.filter(isPriced) : [];
  const totSub = pricedItems.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;
  const anyPriced = pricedItems.length > 0;

  const updateItem = useCallback((id, key, val) => {
    setItems((prev) => prev.map((it) => {
      if (it.id !== id) return it;
      const updated = { ...it, [key]: val };
      if (key === "qty" || key === "rate") {
        const q = parseFloat(key === "qty" ? val : updated.qty) || 0;
        const r = parseFloat(key === "rate" ? val : updated.rate) || 0;
        updated.amount = q * r;
      }
      return updated;
    }));
  }, [setItems]);

  const addItem = () => {
    const newItem = { id: Date.now() + Math.random(), desc: "", qty: "", unit: "", rate: "", amount: 0 };
    setItems((prev) => [...prev, newItem]);
    setExpandedId(newItem.id);
    setTimeout(() => {
      const el = document.getElementById("items-end");
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const duplicateItem = (id) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: Date.now() + Math.random() };
      const next = [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
      setTimeout(() => setExpandedId(copy.id), 0);
      return next;
    });
  };

  const moveItem = (id, dir) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const togglePricing = (on) => setTerms("showPricing", !!on);

  const f = (k) => ({ value: terms[k] || "", onChange: (e) => setTerms(k, e.target.value) });

  const headerCells = showPricing
    ? ["#", "Description", "Qty", "Unit", "Rate (₹)", "Amount (₹)", "Actions"]
    : ["#", "Description", "Actions"];

  return (
    <>
      <Card icon="📦" title="Items / Description" sub={showPricing ? "Qty / Unit / Rate applies to every item. Uncheck below to make all items description-only." : "All items are description-only. Check below to enable pricing for every item."}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 14px", background: showPricing ? "#fdf8e6" : C.surface2, border: `1.5px solid ${showPricing ? C.accent : C.border}`, borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showPricing}
            onChange={(e) => togglePricing(e.target.checked)}
            style={{ accentColor: C.accent, width: 18, height: 18, flexShrink: 0 }}
          />
          <span style={{ color: C.text, flex: 1 }}>
            <strong>Include Qty / Unit / Rate</strong> for all items
            <span style={{ display: "block", fontSize: 12, color: C.text3, marginTop: 2 }}>
              {showPricing ? "Pricing columns visible on every item." : "Only description shown; no pricing, no totals."}
            </span>
          </span>
        </label>

        {!isMobile ? (
          <div style={{ overflowX: "auto", margin: "0 -4px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: showPricing ? 620 : 360 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {headerCells.map((h, i) => (
                    <th key={i} style={{ padding: "9px 8px", fontSize: 11, fontWeight: 600, color: C.text3, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `2px solid ${C.border}`, textAlign: showPricing ? (i >= 4 && i !== 6 ? "right" : (i === 0 || i === 6) ? "center" : "left") : (i === 0 ? "center" : i === 2 ? "center" : "left"), whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <DesktopItemRow
                    key={item.id} item={item} idx={idx} total={items.length} showPricing={showPricing}
                    onChange={(key, val) => updateItem(item.id, key, val)}
                    onRemove={() => removeItem(item.id)}
                    onDuplicate={() => duplicateItem(item.id)}
                    onMove={(dir) => moveItem(item.id, dir)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            {items.map((item, idx) => (
              <MobileAccordionItem
                key={item.id} item={item} idx={idx} total={items.length} showPricing={showPricing}
                expanded={expandedId === item.id}
                onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onChange={(key, val) => updateItem(item.id, key, val)}
                onRemove={() => removeItem(item.id)}
                onDuplicate={() => duplicateItem(item.id)}
                onMove={(dir) => moveItem(item.id, dir)}
              />
            ))}
          </div>
        )}

        <div id="items-end" />

        <button onClick={addItem}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", background: "none", border: `1.5px dashed ${C.border}`, borderRadius: 9, cursor: "pointer", fontSize: 13, color: C.text2, fontFamily: "inherit", width: "100%", marginTop: 10, justifyContent: "center", minHeight: 48 }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2; }}>
          ＋ Add Item / Description
        </button>

        {showPricing && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, padding: "10px 12px", background: C.surface2, borderRadius: 8, cursor: "pointer", fontSize: 13, color: C.text2 }}>
            <input type="checkbox" checked={!!terms.showTotals} onChange={(e) => setTerms("showTotals", e.target.checked)}
              style={{ accentColor: C.accent, width: 17, height: 17 }} />
            <span>Show subtotal, GST and Grand Total on quotation</span>
          </label>
        )}

        {showPricing && terms.showTotals && anyPriced && (
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
        {showPricing && (
          <>
            <SecLabel>GST Type</SecLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[["intra", "Intra-State (CGST+SGST 18%)"], ["inter", "Inter-State (IGST 18%)"]].map(([v, l]) => (
                <button key={v} onClick={() => setGstMode(v)}
                  style={{ flex: "1 1 160px", padding: "10px 8px", border: `1.5px solid ${gstMode === v ? C.primary : C.border}`, borderRadius: 8, background: gstMode === v ? C.primary : C.surface, color: gstMode === v ? "#fff" : C.text2, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", minHeight: 44 }}>
                  {l}
                </button>
              ))}
            </div>
          </>
        )}

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
