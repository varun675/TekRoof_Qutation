import { jsPDF } from "jspdf";
import { NOTE_TEXTS, SCOPE_OPTIONS, PAY_OPTIONS, fmt, fmtDate } from '../constants';
import { LOGO_B64, STAMP_B64, SIG_B64 } from '../constants/assets';

export async function makePDF({ company, client, items, terms, gstMode, activeNotes, scopeChecked }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 14;
  let y = 0;
  const PR = [26,26,46], AC = [200,169,81], GR = [100,100,110], LG = [240,238,232], WH = [255,255,255], DK = [30,30,50];

  const fullSubject = company.subjectPrefix + (company.subjectDetail ? " " + company.subjectDetail : "");
  const freightStr = terms.freightDest ? `${terms.freight} — ${terms.freightDest}` : terms.freight;
  const payText = PAY_OPTIONS.find(p => p.value === terms.payment)?.text || terms.paymentCustom || "";
  const vItems = items.filter(i => i.desc || i.rate);
  const totSub = vItems.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;
  const grand = totSub + gstAmt;


  // ── PROCESS & UPSCALE IMAGES FOR CRISP PDF RENDERING ──
  const processImage = async (base64Str, options = {}) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const scale = options.scale || 1;
        const cvs = document.createElement("canvas");
        cvs.width = img.width * scale; 
        cvs.height = img.height * scale;
        const ctx = cvs.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        
        if (options.invertWhite) {
          const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
          for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255; imgData.data[i+1] = 255; imgData.data[i+2] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
        }
        resolve(cvs.toDataURL("image/png"));
      };
      img.src = base64Str;
    });
  };

  const whiteLogoB64 = await processImage(LOGO_B64, { scale: 3, invertWhite: true });

  // ── COMPOSITE AUTHORIZATION BLOCK ──
  const mergedAuth = await new Promise(resolve => {
    const sImg = new Image(); const sigImg = new Image();
    let c = 0;
    const check = () => {
      if (++c < 2) return;
      const scale = 8; // High DPI output for crisp PDF printing
      const sW = 32 * scale, sH = sW * (140 / 88); 
      const siW = 36 * scale, siH = siW * (80 / 103);
      const width = Math.max(sW, siW), height = sH;
      const cvs = document.createElement("canvas");
      cvs.width = width; cvs.height = height;
      const ctx = cvs.getContext("2d");
      
      // Solid white background prevents PNG alpha fringe rendering bugs in PDF
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      
      // Stamp: faded ink opacity just like the UI preview
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sImg, (width - sW)/2, 0, sW, sH);
      
      // Signature: full opacity laid completely on top
      ctx.globalAlpha = 1.0;
      ctx.drawImage(sigImg, (width - siW)/2, (height - siH)/2, siW, siH);
      
      resolve({ b64: cvs.toDataURL("image/jpeg", 0.95), w: width/scale, h: height/scale });
    };
    sImg.onload = check; sigImg.onload = check;
    sImg.src = STAMP_B64; sigImg.src = SIG_B64;
  });

  // ── HEADER ──
  doc.setFillColor(...PR); doc.rect(0, 0, W, 44, "F");
  try { doc.addImage(whiteLogoB64, "PNG", M, 5, 44, 20); } catch(e){}
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(200,200,210);
  doc.text("CIN: " + company.s_cin, M, 31);
  doc.text(company.s_address || "", M, 36);
  doc.text([company.s_phone1,company.s_phone2].filter(Boolean).join(" | "), M, 40.5);
  if (company.s_gstin) { doc.setTextColor(...AC); doc.text("GSTIN: "+company.s_gstin, M+66, 31); }
  doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(200,200,210);
  doc.text("QUOTATION", W-M, 16, {align:"right"});
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...AC);
  doc.text("Ref: "+company.q_number, W-M, 28, {align:"right"});
  doc.setTextColor(200,200,210);
  doc.text("Date: "+fmtDate(company.q_date), W-M, 35, {align:"right"});
  y = 50;

  // ── PARTIES ──
  const pW = (W - M*2 - 5) / 2;
  doc.setFillColor(...LG);
  doc.roundedRect(M, y, pW, 28, 2, 2, "F");
  doc.roundedRect(M+pW+5, y, pW, 28, 2, 2, "F");
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR);
  doc.text("QUOTATION FROM", M+4, y+5);
  doc.text("QUOTATION FOR (CLIENT)", M+pW+9, y+5);
  doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...DK);
  doc.text(company.s_company||"", M+4, y+12);
  doc.text(client.c_attn||"", M+pW+9, y+12);
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...GR);
  doc.text(doc.splitTextToSize((company.s_address||"") + (company.s_gstin?"\nGSTIN: "+company.s_gstin:""), pW-8).slice(0,2), M+4, y+18);
  doc.text(doc.splitTextToSize((client.c_company||"") + "\n" + (client.c_address||"") + (client.c_gstin?"\nGSTIN: "+client.c_gstin:""), pW-8).slice(0,3), M+pW+9, y+18);
  y += 34;

  // ── SUBJECT ──
  doc.setFillColor(240,236,218); doc.roundedRect(M, y, W-M*2, 11, 2, 2, "F");
  doc.setDrawColor(...AC); doc.setLineWidth(0.8); doc.line(M, y, M, y+11); doc.setLineWidth(0.2);
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("SUB", M+4, y+4.5);
  doc.setFontSize(8.5); doc.setFont("helvetica","bold"); doc.setTextColor(...DK);
  doc.text(doc.splitTextToSize(fullSubject, W-M*2-8)[0]||"", M+4, y+9);
  y += 17;

  // ── PAGINATION HELPERS ──
  const addFooter = () => {
    const fy = H - 18;
    doc.setFillColor(...PR); doc.rect(0, fy, W, 18, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(200,200,210);
    doc.text([company.s_phone1,company.s_phone2].filter(Boolean).join(" | ")+"  |  "+(company.s_web||"www.tekroofsteels.com"),M,fy+7);
    doc.setTextColor(...AC); doc.text(company.s_email||"sales.tekroof@gmail.com",M,fy+13);
    doc.setFont("helvetica","bold"); doc.setTextColor(...WH); doc.text("GSTIN: "+(company.s_gstin||"09AAICT0263B1ZM"), W-M, fy+10, {align:"right"});
  };

  const addNewPage = () => {
    addFooter();
    doc.addPage();
    y = 20;
  };

  const checkPage = (requiredSpace, drawHeaderFn = null) => {
    if (y > H - requiredSpace) {
      addNewPage();
      if (drawHeaderFn) drawHeaderFn();
    }
  };

  // ── META ──
  const metaArr = [["Quotation No.",company.q_number],["Date",fmtDate(company.q_date)],["Validity",company.q_validity||"07 Days"],["GST","18% Exclusive"]];
  if (client.c_ref) metaArr.push(["Buyer Ref.",client.c_ref]);
  const mW = (W-M*2)/Math.min(metaArr.length,4);
  metaArr.slice(0,4).forEach(([l,v],i) => {
    doc.setFillColor(...LG); doc.roundedRect(M+i*mW, y, mW-2, 13, 1, 1, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text(l, M+i*mW+3, y+5);
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DK); doc.text(String(v||"—").substring(0,22), M+i*mW+3, y+11);
  }); y += 19;

  // ── ITEMS TABLE ──
  doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...GR);
  doc.text("DESCRIPTION OF GOODS / SERVICES", M, y+4); y += 7;
  const cW = [8,78,14,14,22,30]; const rH = 8;
  
  const drawTableHeader = () => {
    doc.setFillColor(...PR); doc.rect(M, y, W-M*2, rH, "F");
    let cx = M;
    ["#","Description","Qty","Unit","Rate (Rs.)","Amount (Rs.)"].forEach((h,i) => {
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...WH);
      const al = i>=4?"right":"left", xp = al==="right"?cx+cW[i]-2:cx+2;
      doc.text(h, xp, y+5.5, {align:al}); cx+=cW[i];
    }); y += rH;
  };
  
  drawTableHeader();

  vItems.forEach((item,idx) => {
    checkPage(30, drawTableHeader);
    doc.setFillColor(...(idx%2===0?WH:LG)); doc.rect(M, y, W-M*2, rH, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DK);
    [String(idx+1),item.desc||"",item.qty||"",item.unit||"",fmt(parseFloat(item.rate)||0),fmt(item.amount)].forEach((v,i) => {
      let cx2=M; for(let j=0;j<i;j++) cx2+=cW[j];
      const al=i>=4?"right":i===0?"center":"left", xp=al==="right"?cx2+cW[i]-2:al==="center"?cx2+cW[i]/2:cx2+2;
      doc.text(String(v).substring(0,i===1?38:20), xp, y+5.5, {align:al});
    });
    doc.setDrawColor(...LG); doc.line(M, y+rH, W-M, y+rH); y+=rH;
  }); y+=4;

  // ── TOTALS ──
  checkPage(40);
  const tRows = gstMode==="intra"
    ? [["Subtotal (Ex-GST)",fmt(totSub)],["CGST @ 9%",fmt(gstAmt/2)],["SGST @ 9%",fmt(gstAmt/2)]]
    : [["Subtotal (Ex-GST)",fmt(totSub)],["IGST @ 18%",fmt(gstAmt)]];
  const tX = W-M-62;
  tRows.forEach(([l,v]) => { doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...GR); doc.text(l,tX,y); doc.text("Rs. "+v,W-M,y,{align:"right"}); y+=6; });
  doc.setDrawColor(...AC); doc.setLineWidth(0.5); doc.line(tX,y,W-M,y); y+=4;
  doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...DK); doc.text("Grand Total",tX,y);
  doc.setTextColor(...AC); doc.text("Rs. "+fmt(grand),W-M,y,{align:"right"}); y+=10;

  // ── TERMS ──
  checkPage(50);
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("TERMS & CONDITIONS",M,y); y+=5;
  const termsArr=[["GST","18% Exclusive"],["Freight",freightStr],["Delivery",terms.delivery||"As agreed"],["Validity",company.q_validity||"07 Days"],["Payment",payText]];
  const tC=3, tW2=(W-M*2)/tC;
  termsArr.forEach(([l,v],i) => {
    const col=i%tC, row=Math.floor(i/tC), tx=M+col*tW2, ty=y+row*12;
    doc.setFillColor(...LG); doc.roundedRect(tx,ty,tW2-2,11,1,1,"F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text(l.toUpperCase(),tx+3,ty+4.5);
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...DK); doc.text((doc.splitTextToSize(v||"",tW2-6)[0])||"",tx+3,ty+9);
  }); y+=Math.ceil(termsArr.length/tC)*12+6;

  // ── BANK ──
  checkPage(40);
  doc.setFillColor(...LG); doc.roundedRect(M,y,W-M*2,22,2,2,"F");
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("BANK DETAILS FOR PAYMENT",M+4,y+5);
  [["A/c Name",company.b_name],["A/c No.",company.b_acc],["IFSC",company.b_ifsc],["Bank",company.b_bank]].forEach(([l,v],i)=>{
    const bx=M+4+(i>=2?90:0), by=y+10+(i%2)*7;
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...GR); doc.text(l+":",bx,by);
    doc.setFont("helvetica","normal"); doc.setTextColor(...DK); doc.text(v||"—",bx+22,by);
  }); y+=28;

  // ── NOTES ──
  const allNotes=[...activeNotes].sort().map(n=>NOTE_TEXTS[n]);
  if (terms.notesExtra) allNotes.push(terms.notesExtra);
  const scopeItems=[...SCOPE_OPTIONS.filter((_,i)=>scopeChecked.includes(i)),...(terms.scopeCustom?[terms.scopeCustom]:[])];
  if (scopeItems.length) allNotes.unshift("Scope of Work: "+scopeItems.join("; "));
  
  if (allNotes.length) {
    addNewPage(); // User requested NOTE on next page
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("NOTE",M,y); y+=5;
    allNotes.forEach(note => {
      checkPage(30);
      doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...AC); doc.text("•",M+2,y);
      doc.setTextColor(...GR); const nl=doc.splitTextToSize(note,W-M*2-10); doc.text(nl,M+7,y); y+=nl.length*5+2;
    });
  }

  // ── SIGNATURE + STAMP ──
  checkPage(50);
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GR);
  doc.text("AUTHORIZED SIGNATORY",W-M,y,{align:"right"}); y+=7;
  // Stamp + Signature composite block
  const authX = W - M - mergedAuth.w - 10;
  const authY = y - 3;
  try { doc.addImage(mergedAuth.b64, "JPEG", authX, authY, mergedAuth.w, mergedAuth.h); } catch(e){}
  y += 36;
  doc.setDrawColor(...AC); doc.setLineWidth(0.4); doc.line(W-M-60,y,W-M,y); y+=5;
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...DK); doc.text(company.s_sign||"Mohit Sharma",W-M,y,{align:"right"}); y+=5;
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...GR); doc.text("For "+company.s_company,W-M,y,{align:"right"}); y+=10;

  // ── FOOTER ──
  addFooter();

  // Use base64 data URL to bypass CSP blob restrictions
  const fname = (company.q_number.replace(/[/\\:*?"<>|]/g, "-") || "Quotation") + ".pdf";
  const pdfBase64 = doc.output("datauristring");
  const link = document.createElement("a");
  link.href = pdfBase64;
  link.download = fname;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
