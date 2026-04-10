import React from 'react';
import { C, SUBJECT_CHIPS } from '../constants';
import { Card, Field, Inp, SecLabel, Chip } from './SharedUI';

export default function Step2({ data, setClient, setCompany, errors }) {
  const f = (k) => ({ value: data[k] || "", onChange: (e) => setClient(k, e.target.value) });
  return (
    <Card icon="👤" title="Client Details" sub="Who is this quotation for?">
      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
        <Field label="Contact Person" req err={errors.c_attn}><Inp {...f("c_attn")} placeholder="Mr. Jitender Singh" err={errors.c_attn} /></Field>
        <Field label="Company Name" req err={errors.c_company}><Inp {...f("c_company")} placeholder="Rattan Singh Builders Pvt. Ltd." err={errors.c_company} /></Field>
      </div>
      <Field label="Address / City" req err={errors.c_address}><Inp {...f("c_address")} placeholder="New Delhi" err={errors.c_address} /></Field>
      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 13 }}>
        <Field label="Phone"><Inp {...f("c_phone")} placeholder="+91 9XXXXXXXXX" /></Field>
        <Field label="Email"><Inp {...f("c_email")} type="email" placeholder="client@company.com" /></Field>
      </div>
      <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 13 }}>
        <Field label="GSTIN"><Inp {...f("c_gstin")} placeholder="Client GSTIN (if any)" /></Field>
        <Field label="Buyer's Ref / PO No."><Inp {...f("c_ref")} placeholder="If any" /></Field>
      </div>

      <SecLabel>Subject (SUB)</SecLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
        {SUBJECT_CHIPS.map(chip => (
          <Chip key={chip.prefix} active={data.subjectPrefix === chip.prefix} onClick={() => setCompany("subjectPrefix", chip.prefix)}>
            {chip.label}
          </Chip>
        ))}
      </div>
      <div style={{ background: C.surface2, borderRadius: 9, overflow: "hidden", border: `1.5px solid ${C.border}`, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ background: C.primary, color: C.accent, padding: "10px 13px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {data.subjectPrefix}
          </div>
          <input
            type="text"
            placeholder="Thickness 0.50 MM Colour Blue Make AM/NS or Equivalent"
            value={data.subjectDetail || ""}
            onChange={e => setCompany("subjectDetail", e.target.value)}
            style={{ border: "none", background: "transparent", flex: 1, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", outline: "none", color: C.text, minWidth: 0 }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.text3 }}>
        Preview: <em style={{ color: C.text2 }}>{data.subjectPrefix}{data.subjectDetail ? " " + data.subjectDetail : ""}</em>
      </div>
    </Card>
  );
}
