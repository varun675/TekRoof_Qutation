import React from 'react';
import { C, NOTE_TEXTS, SCOPE_OPTIONS, PAY_OPTIONS, fmt, fmtDate } from '../constants';
import { LOGO_B64, STAMP_B64, SIG_B64 } from '../constants/assets';

export default function Step4({ company, client, items, terms, gstMode, activeNotes, scopeChecked, onEdit, onDownload }) {
  const fullSubject = company.subjectPrefix + (company.subjectDetail ? " " + company.subjectDetail : "");
  const totSub = items.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;
  const grand = totSub + gstAmt;
  const freightStr = terms.freightDest ? `${terms.freight} — ${terms.freightDest}` : terms.freight;
  const payText = PAY_OPTIONS.find(p => p.value === terms.payment)?.text || terms.paymentCustom || "";
  const allNotes = [...activeNotes].sort().map(n => NOTE_TEXTS[n]);
  if (terms.notesExtra) allNotes.push(terms.notesExtra);
  const scopeItems = [...SCOPE_OPTIONS.filter((_, i) => scopeChecked.includes(i)), ...(terms.scopeCustom ? [terms.scopeCustom] : [])];
  if (scopeItems.length) allNotes.unshift("Scope of Work: " + scopeItems.join("; "));

  const btnStyle = { padding: "9px 16px", border: `1.5px solid ${C.border}`, borderRadius: 9, background: C.surface, fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer", color: C.text2 };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
        <button style={btnStyle} onClick={() => onEdit(1)}>✏️ Company</button>
        <button style={btnStyle} onClick={() => onEdit(2)}>✏️ Client</button>
        <button style={btnStyle} onClick={() => onEdit(3)}>✏️ Items</button>
        <button onClick={onDownload}
          style={{ padding: "11px 26px", border: "none", borderRadius: 10, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", color: C.primary, marginLeft: "auto", boxShadow: "0 4px 16px rgba(200,169,81,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
          ⬇ Download PDF
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 12px 48px rgba(26,26,46,0.14)", overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ background: C.primary, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <img src={LOGO_B64} alt="TSPL" style={{ height: 56, maxWidth: 210, objectFit: "contain", filter: "brightness(0) invert(1)", display: "block", marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>CIN: {company.s_cin}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3, lineHeight: 1.9 }}>{company.s_address}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{[company.s_phone1, company.s_phone2].filter(Boolean).join("  |  ")}{company.s_web ? "  |  " + company.s_web : ""}</div>
            {company.s_gstin && <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>GSTIN: {company.s_gstin}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: 3, fontFamily:"serif" }}>QUOTATION</div>
            <div style={{ fontSize: 12, color: C.accent, marginTop: 4 }}>Ref: {company.q_number}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Date: {fmtDate(company.q_date)}</div>
          </div>
        </div>

        <div style={{ padding: "22px 28px" }}>
          <div className="prev-parties" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[
              { label: "Quotation From", name: company.s_company, lines: [company.s_address, company.s_gstin ? "GSTIN: " + company.s_gstin : "", company.s_phone1].filter(Boolean) },
              { label: "Kind Attention",  name: client.c_attn,    lines: [client.c_company, client.c_address, client.c_phone, client.c_gstin ? "GSTIN: " + client.c_gstin : ""].filter(Boolean) }
            ].map(p => (
              <div key={p.label} style={{ background: C.surface2, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.7 }}>{p.lines.map((l, i) => <div key={i}>{l}</div>)}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg,#f0ede4,#ede9df)", borderRadius: 8, padding: "11px 14px", marginBottom: 16, borderLeft: `3px solid ${C.accent}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: 1 }}>SUB</div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 500, marginTop: 2 }}>{fullSubject || "—"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8, marginBottom: 16 }}>
            {[["Quotation No.", company.q_number], ["Date", fmtDate(company.q_date)], ["Validity", company.q_validity || "07 Days"], ["GST", "18% Exclusive"], ...(client.c_ref ? [["Buyer Ref.", client.c_ref]] : [])].map(([l, v]) => (
              <div key={l} style={{ background: C.surface2, borderRadius: 8, padding: "9px 11px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{v || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Description of Goods / Services</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 400 }}>
              <thead>
                <tr style={{ background: C.primary }}>
                  {["#","Description","Qty","Unit","Rate (₹)","Amount (₹)"].map((h, i) => (
                    <th key={i} style={{ padding: "9px 10px", color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, textAlign: i >= 4 ? "right" : i === 0 ? "center" : "left", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter(i => i.desc || i.rate).map((item, idx) => (
                  <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : C.surface2, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 10px", textAlign: "center", color: C.text3 }}>{idx + 1}</td>
                    <td style={{ padding: "9px 10px" }}>{item.desc}</td>
                    <td style={{ padding: "9px 10px", textAlign: "center" }}>{item.qty}</td>
                    <td style={{ padding: "9px 10px", textAlign: "center" }}>{item.unit}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right" }}>₹{fmt(parseFloat(item.rate) || 0)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: C.accent }}>₹{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", margin: "14px 0 16px" }}>
            <div style={{ width: 260 }}>
              {(gstMode === "intra"
                ? [["Subtotal (Ex-GST)", totSub], ["CGST @ 9%", gstAmt/2], ["SGST @ 9%", gstAmt/2]]
                : [["Subtotal (Ex-GST)", totSub], ["IGST @ 18%", gstAmt]]
              ).map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: C.text2 }}>
                  <span>{l}</span><span>₹{fmt(v)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", marginTop: 8, borderTop: `2px solid ${C.border}`, fontSize: 16, fontWeight: 700 }}>
                <span>Grand Total</span><span style={{ color: C.accent }}>₹{fmt(grand)}</span>
              </div>
            </div>
          </div>

          <div className="prev-terms" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {[["GST","18% Exclusive"],["Freight",freightStr],["Delivery",terms.delivery||"As agreed"],["Validity",company.q_validity||"07 Days"],["Payment",payText]].map(([l,v]) => (
              <div key={l} style={{ background: C.surface2, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{v || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface2, borderRadius: 10, padding: "13px 15px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.text3, letterSpacing: 1, marginBottom: 10 }}>Bank Details for Payment</div>
            <div className="prev-terms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px" }}>
              {[["A/c Name",company.b_name],["A/c No.",company.b_acc],["IFSC",company.b_ifsc],["Bank",company.b_bank]].map(([l,v]) => (
                <div key={l} style={{ fontSize: 12, display: "flex", gap: 6 }}>
                  <span style={{ color: C.text3, whiteSpace: "nowrap" }}>{l}:</span>
                  <span style={{ color: C.text, fontWeight: 500 }}>{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {allNotes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.text3, letterSpacing: 1, marginBottom: 8 }}>Note</div>
              {allNotes.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: C.text2, padding: "3px 0", display: "flex", gap: 8, lineHeight: 1.6 }}>
                  <span style={{ color: C.accent, flexShrink: 0 }}>•</span><span>{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sig-section" style={{ borderTop: `1px solid ${C.border}`, padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "end" }}>
          <div style={{ fontSize: 12, color: C.text2, lineHeight: 2.1 }}>
            {[company.s_phone1 && "📞 "+company.s_phone1, company.s_phone2 && "📞 "+company.s_phone2, company.s_web && "🌐 "+company.s_web, company.s_email && "✉ "+company.s_email].filter(Boolean).map((l,i) => <div key={i}>{l}</div>)}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.text3, marginBottom: 12 }}>Authorized Signatory</div>
            <div style={{ position: "relative", height: 110, width: 180, marginLeft: "auto", marginBottom: 8 }}>
              <img src={STAMP_B64} alt="Stamp" style={{ position: "absolute", right: 15, bottom: -10, height: 150, width: 94, objectFit: "contain", opacity: 0.92 }} />
              <img src={SIG_B64}   alt="Signature" style={{ position: "absolute", right: 12, bottom: 35, width: 110, objectFit: "contain", zIndex: 2 }} />
            </div>
            <div style={{ height: 1, background: C.border, marginBottom: 6 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{company.s_sign || "Mohit Sharma"}</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>For {company.s_company}</div>
          </div>
        </div>

        <div style={{ background: C.primary, padding: "11px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.9 }}>
            {[company.s_phone1, company.s_phone2].filter(Boolean).join("  |  ")}{company.s_web ? "  |  " + company.s_web : ""}
          </div>
          <div style={{ fontSize: 11, color: C.accent }}>{company.s_email}</div>
        </div>
      </div>
    </div>
  );
}
