import { useState } from 'react';
import { C } from './constants';
import { LOGO_B64 } from './constants/assets';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import { makePDF } from './utils/makePDF';

const STEP_LABELS = ["", "Next: Client Details →", "Next: Items & Terms →", "Preview Quotation →"];

export default function App() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [gstMode, setGstMode] = useState("intra");
  const [activeNotes, setActiveNotes] = useState(new Set([1, 2, 3]));
  const [scopeChecked, setScopeChecked] = useState([0, 1]);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [items, setItems] = useState([
    { id: 1, desc: "Supply of profile sheet thickness 0.50 mm supply width 1060 mm covered width 1000 mm colour blue make AM/NS or Equivalent. Length- 3000 mm", qty: "200", unit: "Nos.", rate: "429", amount: 200*429 },
    { id: 2, desc: "Supply of profile sheet thickness 0.50 mm supply width 1060 mm covered width 1000 mm colour blue make AM/NS. Length- Upto 20 Ft", qty: "636", unit: "SQM", rate: "99.5", amount: 636*99.5 },
    { id: 3, desc: "Freight & Transportation charges (Lumpsum)", qty: "1", unit: "LS", rate: "8500", amount: 8500 },
  ]);

  const [company, setCompanyState] = useState({
    s_company: "Tekroof Steels Private Limited",
    s_cin: "U28990UP2020PTC132852",
    s_address: "Gata No-1616, Baba Khera, Badarka, Unnao UP-209862",
    s_gstin: "09AAICT0263B1ZM",
    s_sign: "Mohit Sharma",
    s_phone1: "9953023229",
    s_phone2: "7042930029",
    s_web: "www.tekroofsteels.com",
    s_email: "sales.tekroof@gmail.com",
    b_name: "Tekroof Steels Pvt Ltd",
    b_acc: "2406248761680072",
    b_ifsc: "AUBL0002487",
    b_bank: "AU Small Finance Bank, Civil Lines Branch, Kanpur",
    q_number: "TSPL/26-27/05",
    q_date: "2026-04-11",
    q_validity: "07 Days",
    subjectPrefix: "Supply of Profile Sheet",
    subjectDetail: "Thickness 0.50 MM Colour Blue Make AM/NS or Equivalent",
  });

  const [client, setClientState] = useState({
    c_attn: "Mr. Jitender Singh",
    c_company: "Rattan Singh Builders Pvt. Ltd.",
    c_address: "Plot No. 14, Sector 62, Noida, Uttar Pradesh - 201301",
    c_phone: "9811234567",
    c_email: "jitender@rattanbuilders.com",
    c_gstin: "09AABCR1234D1ZP",
    c_ref: "RSB/PO/2026/042",
  });
  const [terms, setTermsState] = useState({
    freight: "FOR Site",
    freightDest: "Noida Site, Sector 62",
    delivery: "Within 2 weeks",
    payment: "100adv",
    paymentCustom: "",
    scopeCustom: "",
    notesExtra: "Material should be packed properly to avoid damage during transit.",
  });

  const setCompany = (k, v) => setCompanyState(p => ({ ...p, [k]: v }));
  const setClient  = (k, v) => setClientState(p => ({ ...p, [k]: v }));
  const setTerms   = (k, v) => setTermsState(p => ({ ...p, [k]: v }));
  const toggleNote = (n) => setActiveNotes(prev => { const s=new Set(prev); s.has(n)?s.delete(n):s.add(n); return s; });
  const toggleScope = (i) => setScopeChecked(prev => prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);

  const validate = (s) => {
    const reqs = {
      1: [["s_company",company],["q_number",company],["q_date",company]],
      2: [["c_attn",client],["c_company",client],["c_address",client]],
      3: []
    };
    const errs = {};
    (reqs[s]||[]).forEach(([k,obj]) => { if (!obj[k]?.trim()) errs[k]="Required"; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => { if (validate(step) && step < 4) setStep(step + 1); };
  const goBack = () => { if (step > 1) setStep(step - 1); };

  const handleDownload = async () => {
    setPdfLoading(true);
    await new Promise(r => setTimeout(r, 100));
    try {
      await makePDF({ company, client, items, terms, gstMode, activeNotes, scopeChecked });
    } catch (e) {
      alert("PDF error: " + e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const ProgressDot = ({ n }) => {
    const done = n < step, active = n === step;
    return (
      <div onClick={() => { if (n < step || validate(step)) { setErrors({}); setStep(n); } }}
        style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"13px 6px", cursor:"pointer", borderBottom:`3px solid ${done?C.success:active?C.accent:"transparent"}`, gap:4 }}>
        <div style={{ width:28,height:28,borderRadius:"50%",background:done?C.success:active?C.accent:C.surface2,border:`2px solid ${done?C.success:active?C.accent:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:done?"#fff":active?C.primary:C.text3,transition:"all 0.2s" }}>
          {done?"✓":n}
        </div>
        <div style={{ fontSize:11,fontWeight:500,color:done?C.success:active?C.text:C.text3,textAlign:"center",whiteSpace:"nowrap" }}>
          {["","Company","Client","Items","Preview"][n]}
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif",background:C.surface2,minHeight:"100vh",color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        * { box-sizing:border-box; }
        body { margin:0; }
        input,select,textarea,button { font-family:inherit; }
        input[type=number]::-webkit-inner-spin-button { opacity:0.5; }
        @media(max-width:540px){
          .g2 { grid-template-columns:1fr !important; }
          .g3 { grid-template-columns:1fr 1fr !important; }
          .prev-parties { grid-template-columns:1fr !important; }
          .prev-terms { grid-template-columns:1fr 1fr !important; }
          .sig-section { grid-template-columns:1fr !important; }
          .topbar-sub { display:none !important; }
        }
      `}</style>

      <div style={{ background:C.primary,padding:"0 18px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <img src={LOGO_B64} alt="TSPL" style={{ height:38,maxWidth:140,objectFit:"contain",filter:"brightness(0) invert(1)" }} />
          <span className="topbar-sub" style={{ fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:"1px",textTransform:"uppercase" }}>Quotation Generator</span>
        </div>
        <span style={{ fontSize:11,color:"rgba(255,255,255,0.4)" }}>{company.q_number||"New Quotation"}</span>
      </div>

      <div style={{ background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 14px",overflowX:"auto" }}>
        <div style={{ display:"flex",maxWidth:780,margin:"0 auto",minWidth:280 }}>
          {[1,2,3,4].map(n => <ProgressDot key={n} n={n} />)}
        </div>
      </div>

      <div style={{ maxWidth:780,margin:"0 auto",padding:"20px 12px 120px" }}>
        {step===1 && <Step1 data={company} set={setCompany} errors={errors} />}
        {step===2 && <Step2
          data={{ ...client, subjectPrefix:company.subjectPrefix, subjectDetail:company.subjectDetail }}
          setClient={setClient} setCompany={setCompany} errors={errors}
        />}
        {step===3 && <Step3
          items={items} setItems={setItems}
          terms={terms} setTerms={setTerms}
          activeNotes={activeNotes} toggleNote={toggleNote}
          scopeChecked={scopeChecked} toggleScope={toggleScope}
          gstMode={gstMode} setGstMode={setGstMode}
        />}
        {step===4 && <Step4
          company={company} client={client} items={items}
          terms={terms} gstMode={gstMode}
          activeNotes={activeNotes} scopeChecked={scopeChecked}
          onEdit={n => { setErrors({}); setStep(n); }}
          onDownload={handleDownload}
        />}
      </div>

      {step < 4 && (
        <div style={{ position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 -8px 32px rgba(26,26,46,0.08)",zIndex:99 }}>
          <span style={{ fontSize:12,color:C.text3 }}>Step <strong style={{ color:C.text }}>{step}</strong> of 4</span>
          <div style={{ display:"flex",gap:10 }}>
            {step > 1 && (
              <button onClick={goBack} style={{ padding:"11px 20px",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.surface,fontSize:14,fontWeight:500,cursor:"pointer",color:C.text2 }}>← Back</button>
            )}
            <button onClick={goNext} style={{ padding:"11px 26px",border:"none",borderRadius:10,background:C.primary,fontSize:14,fontWeight:600,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",gap:6 }}>
              {STEP_LABELS[step]}
            </button>
          </div>
        </div>
      )}

      {pdfLoading && (
        <div style={{ position:"fixed",inset:0,background:"rgba(26,26,46,0.8)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16 }}>
          <div style={{ width:44,height:44,borderRadius:"50%",border:"3px solid rgba(200,169,81,0.3)",borderTopColor:C.accent,animation:"spin 0.8s linear infinite" }} />
          <div style={{ color:"rgba(255,255,255,0.8)",fontSize:14 }}>Generating PDF…</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
