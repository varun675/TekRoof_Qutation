import React from 'react';
import { C } from '../constants';
import { LOGO_B64 } from '../constants/assets';
import { Card, Field, Inp, SecLabel } from './SharedUI';

export default function Step1({ data, set, errors }) {
  const f = (k) => ({ value: data[k] || "", onChange: (e) => set(k, e.target.value) });
  return (
    <>
      <div style={{ background: C.primary, borderRadius: 14, padding: "16px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 24px rgba(26,26,46,0.15)" }}>
        <img src={LOGO_B64} alt="TSPL" style={{ height: 50, maxWidth: 180, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>TEKROOF STEELS PRIVATE LIMITED</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>CIN: U28990UP2020PTC132852</div>
        </div>
      </div>

      <Card icon="🏭" title="Company Details" sub="Pre-filled — edit if needed">
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Company Name" req err={errors.s_company}><Inp {...f("s_company")} err={errors.s_company} /></Field>
          <Field label="CIN"><Inp {...f("s_cin")} /></Field>
        </div>
        <Field label="Address"><Inp {...f("s_address")} /></Field>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 13 }}>
          <Field label="GSTIN"><Inp {...f("s_gstin")} /></Field>
          <Field label="Authorized Signatory"><Inp {...f("s_sign")} /></Field>
        </div>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 13 }}>
          <Field label="Phone 1"><Inp {...f("s_phone1")} /></Field>
          <Field label="Phone 2"><Inp {...f("s_phone2")} /></Field>
        </div>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginTop: 13 }}>
          <Field label="Website"><Inp {...f("s_web")} /></Field>
          <Field label="Email"><Inp {...f("s_email")} type="email" /></Field>
        </div>

        <SecLabel>Bank Details</SecLabel>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 13 }}>
          <Field label="Account Name"><Inp {...f("b_name")} /></Field>
          <Field label="Account Number"><Inp {...f("b_acc")} /></Field>
        </div>
        <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          <Field label="IFSC"><Inp {...f("b_ifsc")} /></Field>
          <Field label="Bank Name & Branch"><Inp {...f("b_bank")} /></Field>
        </div>

        <SecLabel>Quotation Reference</SecLabel>
        <div className="g3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 13 }}>
          <Field label="Quotation No." req hint="e.g. TSPL/26-27/03" err={errors.q_number}><Inp {...f("q_number")} placeholder="TSPL/26-27/03" err={errors.q_number} /></Field>
          <Field label="Date" req err={errors.q_date}><Inp {...f("q_date")} type="date" err={errors.q_date} /></Field>
          <Field label="Validity"><Inp {...f("q_validity")} placeholder="07 Days" /></Field>
        </div>
      </Card>
    </>
  );
}
