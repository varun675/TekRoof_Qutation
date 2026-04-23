import { jsPDF } from "jspdf";
import { fmt, fmtDate } from '../constants';
import { LOGO_B64, STAMP_B64, SIG_B64 } from '../constants/assets';

const isPriced = (i) => parseFloat(i.qty) > 0 && parseFloat(i.rate) > 0;
const splitLines = (s) => (s || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);

export async function makePDF({ company, client, items, terms, gstMode }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, H = 297, M = 14;
  let y = 0;
  const PR = [26,26,46], AC = [200,169,81], GR = [100,100,110], LG = [240,238,232], WH = [255,255,255], DK = [30,30,50];

  const fullSubject = company.subjectPrefix + (company.subjectDetail ? " " + company.subjectDetail : "");
  const freightStr = [terms.freight, terms.freightDest].filter(Boolean).join(" — ");
  const payText = terms.payment || "";
  const showPricing = terms.showPricing !== false;
  const hasAmount = (i) => showPricing && isPriced(i);
  const visibleItems = items.filter(i => (i.desc && i.desc.trim()) || isPriced(i));
  const pricedItems = showPricing ? items.filter(isPriced) : [];
  const totSub = pricedItems.reduce((s, i) => s + (i.amount || 0), 0);
  const gstAmt = totSub * 0.18;
  const grand = totSub + gstAmt;
  const showTotals = showPricing && terms.showTotals !== false && pricedItems.length > 0;
  const termLines = splitLines(terms.notesExtra);
  const specialLines = splitLines(terms.specialTerms);

  // ── PROCESS IMAGES ──
  const processImage = async (base64Str, options = {}) => new Promise(resolve => {
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

  const whiteLogoB64 = await processImage(LOGO_B64, { scale: 3, invertWhite: true });

  const mergedAuth = await new Promise(resolve => {
    const sImg = new Image(); const sigImg = new Image();
    let c = 0;
    const check = () => {
      if (++c < 2) return;
      const scale = 8;
      const sW = 32 * scale, sH = sW * (140 / 88);
      const siW = 36 * scale, siH = siW * (80 / 103);
      const width = Math.max(sW, siW), height = sH;
      const cvs = document.createElement("canvas");
      cvs.width = width; cvs.height = height;
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 0.85;
      ctx.drawImage(sImg, (width - sW)/2, 0, sW, sH);
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
  doc.text("CIN: " + (company.s_cin || ""), M, 31);
  doc.text(company.s_address || "", M, 36);
  doc.text([company.s_phone1,company.s_phone2].filter(Boolean).join(" | "), M, 40.5);
  if (company.s_gstin) { doc.setTextColor(...AC); doc.text("GSTIN: "+company.s_gstin, M+66, 31); }
  doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.setTextColor(200,200,210);
  doc.text("QUOTATION", W-M, 16, {align:"right"});
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...AC);
  doc.text("Ref: "+(company.q_number || ""), W-M, 28, {align:"right"});
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
  doc.text(company.s_company || "", M+4, y+12);
  doc.text(client.c_attn || "", M+pW+9, y+12);
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
  const metaArr = [["Quotation No.",company.q_number],["Date",fmtDate(company.q_date)],["Validity",company.q_validity||"—"]];
  if (showPricing) metaArr.push(["GST","18% Exclusive"]);
  if (client.c_ref) metaArr.push(["Buyer Ref.",client.c_ref]);
  const mW = (W-M*2)/Math.min(metaArr.length,4);
  metaArr.slice(0,4).forEach(([l,v],i) => {
    doc.setFillColor(...LG); doc.roundedRect(M+i*mW, y, mW-2, 13, 1, 1, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text(l, M+i*mW+3, y+5);
    doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DK); doc.text(String(v||"—").substring(0,22), M+i*mW+3, y+11);
  }); y += 19;

  // ── ITEMS TABLE (multi-line description support) ──
  doc.setFontSize(7.5); doc.setFont("helvetica","bold"); doc.setTextColor(...GR);
  doc.text("DESCRIPTION OF GOODS / SERVICES", M, y+4); y += 7;

  const tableW = W - M*2;
  // When pricing is shown: [#, Desc, Qty, Unit, Rate, Amount]
  // When pricing is hidden: [#, Desc]
  const cW = showPricing
    ? [8, tableW - (8+14+14+22+30), 14, 14, 22, 30]
    : [8, tableW - 8];
  const headers = showPricing
    ? ["#","Description","Qty","Unit","Rate (Rs.)","Amount (Rs.)"]
    : ["#","Description"];

  const drawTableHeader = () => {
    doc.setFillColor(...PR); doc.rect(M, y, tableW, 8, "F");
    let cx = M;
    headers.forEach((h,i) => {
      doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...WH);
      const al = showPricing ? (i>=4 ? "right" : i===0 ? "center" : "left") : (i===0 ? "center" : "left");
      const xp = al==="right" ? cx+cW[i]-2 : al==="center" ? cx+cW[i]/2 : cx+2;
      doc.text(h, xp, y+5.5, {align:al}); cx+=cW[i];
    });
    y += 8;
  };

  drawTableHeader();

  visibleItems.forEach((item, idx) => {
    const descLines = doc.splitTextToSize(item.desc || "", cW[1]-4);
    const rowH = Math.max(8, descLines.length * 4.2 + 4);
    checkPage(rowH + 12, drawTableHeader);
    doc.setFillColor(...(idx%2===0?WH:LG)); doc.rect(M, y, tableW, rowH, "F");
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...DK);
    // #
    doc.text(String(idx+1), M + cW[0]/2, y+5.5, {align:"center"});
    // Description (multi-line)
    doc.text(descLines, M + cW[0] + 2, y + 5);
    if (showPricing) {
      const qtyTxt = item.qty || "—";
      const unitTxt = item.unit || "—";
      const rateTxt = hasAmount(item) ? fmt(parseFloat(item.rate) || 0) : "—";
      const amtTxt = hasAmount(item) ? fmt(item.amount) : "—";
      let cx = M + cW[0] + cW[1];
      doc.text(qtyTxt, cx + cW[2]/2, y+5.5, {align:"center"}); cx += cW[2];
      doc.text(unitTxt, cx + cW[3]/2, y+5.5, {align:"center"}); cx += cW[3];
      doc.text(rateTxt, cx + cW[4] - 2, y+5.5, {align:"right"}); cx += cW[4];
      doc.text(amtTxt, cx + cW[5] - 2, y+5.5, {align:"right"});
    }
    doc.setDrawColor(...LG); doc.line(M, y+rowH, W-M, y+rowH);
    y += rowH;
  });
  y += 4;

  // ── TOTALS (optional) ──
  if (showTotals) {
    checkPage(40);
    const tRows = gstMode==="intra"
      ? [["Subtotal (Ex-GST)",fmt(totSub)],["CGST @ 9%",fmt(gstAmt/2)],["SGST @ 9%",fmt(gstAmt/2)]]
      : [["Subtotal (Ex-GST)",fmt(totSub)],["IGST @ 18%",fmt(gstAmt)]];
    const tX = W-M-62;
    tRows.forEach(([l,v]) => { doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...GR); doc.text(l,tX,y); doc.text("Rs. "+v,W-M,y,{align:"right"}); y+=6; });
    doc.setDrawColor(...AC); doc.setLineWidth(0.5); doc.line(tX,y,W-M,y); y+=4;
    doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(...DK); doc.text("Grand Total",tX,y);
    doc.setTextColor(...AC); doc.text("Rs. "+fmt(grand),W-M,y,{align:"right"}); y+=10;
  } else {
    y += 4;
  }

  // ── COMMERCIAL TERMS ──
  checkPage(60);
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("COMMERCIAL TERMS",M,y); y+=5;
  const termsArr = [];
  if (showPricing) termsArr.push(["GST","18% Exclusive"]);
  termsArr.push(["Freight",freightStr || "—"], ["Delivery",terms.delivery || "—"], ["Validity",company.q_validity || "—"]);
  if (payText) termsArr.push(["Payment", payText]);
  const tC=3, tW2=(W-M*2)/tC;
  const rowsCount = Math.ceil(termsArr.length / tC);
  // Compute per-row height (allow 2 lines of wrapped payment text)
  let ty = y;
  termsArr.forEach(([l,v],i) => {
    const col=i%tC, row=Math.floor(i/tC);
    const txWrap = doc.splitTextToSize(v || "—", tW2-6).slice(0,3);
    const boxH = Math.max(11, 5 + txWrap.length * 3.8);
    const tx = M+col*tW2, yy = ty + row*14;
    doc.setFillColor(...LG); doc.roundedRect(tx, yy, tW2-2, boxH, 1, 1, "F");
    doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text(l.toUpperCase(), tx+3, yy+4.5);
    doc.setFontSize(7.5); doc.setFont("helvetica","normal"); doc.setTextColor(...DK);
    txWrap.forEach((line, li) => doc.text(line, tx+3, yy+8.5+li*3.8));
  });
  y += rowsCount * 14 + 4;

  // ── BANK DETAILS ──
  checkPage(36);
  doc.setFillColor(...LG); doc.roundedRect(M,y,W-M*2,22,2,2,"F");
  doc.setFontSize(7); doc.setFont("helvetica","bold"); doc.setTextColor(...GR); doc.text("BANK DETAILS FOR PAYMENT",M+4,y+5);
  [["A/c Name",company.b_name],["A/c No.",company.b_acc],["IFSC",company.b_ifsc],["Bank",company.b_bank]].forEach(([l,v],i)=>{
    const bx=M+4+(i>=2?90:0), by=y+10+(i%2)*7;
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...GR); doc.text(l+":",bx,by);
    doc.setFont("helvetica","normal"); doc.setTextColor(...DK); doc.text(String(v || "—").substring(0,50), bx+22, by);
  }); y+=28;

  // ── TERMS & CONDITIONS (on new page if content) ──
  if (termLines.length || specialLines.length) {
    addNewPage();

    if (termLines.length) {
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DK); doc.text("TERMS & CONDITIONS", M, y); y+=6;
      termLines.forEach(note => {
        const wrapped = doc.splitTextToSize(note, W-M*2-10);
        checkPage(wrapped.length * 4.5 + 4);
        doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...AC); doc.text("•", M+2, y);
        doc.setTextColor(...GR); doc.text(wrapped, M+7, y);
        y += wrapped.length * 4.3 + 2;
      });
      y += 3;
    }

    if (specialLines.length) {
      checkPage(14);
      doc.setFillColor(255, 249, 236); doc.roundedRect(M, y-2, W-M*2, 7, 1.5, 1.5, "F");
      doc.setDrawColor(...AC); doc.setLineWidth(0.4); doc.line(M, y-2, M, y+5); doc.setLineWidth(0.2);
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...DK); doc.text("SPECIAL TERMS & CONDITIONS", M+3, y+3); y+=10;
      specialLines.forEach(note => {
        const wrapped = doc.splitTextToSize(note, W-M*2-10);
        checkPage(wrapped.length * 4.5 + 4);
        doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(...AC); doc.text("★", M+2, y);
        doc.setTextColor(...DK); doc.text(wrapped, M+7, y);
        y += wrapped.length * 4.3 + 2;
      });
      y += 4;
    }
  }

  // ── SIGNATURE + STAMP ──
  checkPage(50);
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...GR);
  doc.text("AUTHORIZED SIGNATORY",W-M,y,{align:"right"}); y+=7;
  const authX = W - M - mergedAuth.w - 10;
  const authY = y - 3;
  try { doc.addImage(mergedAuth.b64, "JPEG", authX, authY, mergedAuth.w, mergedAuth.h); } catch(e){}
  y += 36;
  doc.setDrawColor(...AC); doc.setLineWidth(0.4); doc.line(W-M-60,y,W-M,y); y+=5;
  doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...DK); doc.text(company.s_sign||"Mohit Sharma",W-M,y,{align:"right"}); y+=5;
  doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(...GR); doc.text("For "+(company.s_company || ""),W-M,y,{align:"right"}); y+=10;

  addFooter();

  const fname = ((company.q_number || "Quotation").replace(/[/\\:*?"<>|]/g, "-")) + ".pdf";
  const pdfBase64 = doc.output("datauristring");
  const link = document.createElement("a");
  link.href = pdfBase64;
  link.download = fname;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
