function getAbsoluteLogoUrl() {
  if (typeof window === 'undefined') return '/logo-transparent.png';
  return window.location.origin + '/logo-transparent.png';
}

async function fetchLogoBase64(url) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function printHtml(html) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {}
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 800);
}

function nowAr() {
  const d = new Date();
  const date = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const time = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

export async function printInvoice({ patient, session, logoUrl, type = 'full', receptionist = '' }) {
  const absLogoUrl = logoUrl || getAbsoluteLogoUrl();
  const logoData   = await fetchLogoBase64(absLogoUrl);
  const logoSrc    = logoData || absLogoUrl;

  const sessionDate = session?.sessionDate
    ? new Date(session.sessionDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const { date: printDate, time: printTime } = nowAr();
  const amountPaid  = session?.amountPaid ?? patient?.financials?.totalPaid ?? 0;
  const remaining   = patient?.financials?.remaining ?? Math.max(0, (patient?.financials?.totalCost || 0) - (patient?.financials?.totalPaid || 0));
  const totalCost   = patient?.financials?.totalCost ?? 0;
  const totalPaid   = patient?.financials?.totalPaid ?? 0;

  const isThermal = type === 'thermal';

  if (isThermal) {
    const thermalHtml = buildThermalHtml({ logoSrc, patient, session, sessionDate, amountPaid, remaining, totalCost, totalPaid, printDate, printTime, receptionist });
    printHtml(thermalHtml);
    return;
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>فاتورة - ${patient?.fullName || ''}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{
      font-family:'Cairo','Arial','Tahoma',sans-serif;
      direction:rtl;
      background:#e8edf5;
      color:#0f172a;
      font-size:13px;
    }
    .page-wrap{
      width:210mm;
      min-height:297mm;
      margin:0 auto;
      background:white;
      position:relative;
      display:flex;
      flex-direction:column;
    }
    /* ── Watermark ── */
    .watermark{
      position:absolute;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:260px;height:260px;
      opacity:0.045;
      pointer-events:none;
      z-index:0;
    }
    .watermark img{width:100%;height:100%;object-fit:contain;}

    /* ── Content above border ── */
    .top-header{
      background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#0284c7 100%);
      color:white;
      padding:18px 28px 16px;
      display:flex;
      align-items:center;
      gap:16px;
      position:relative;
      z-index:1;
    }
    .th-logo{
      width:62px;height:62px;
      background:white;
      border-radius:14px;
      padding:4px;
      flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 16px rgba(0,0,0,0.25);
    }
    .th-logo img{width:54px;height:54px;object-fit:contain;}
    .th-info{flex:1;}
    .th-clinic{font-size:20px;font-weight:900;letter-spacing:0.3px;}
    .th-spec{font-size:12px;opacity:0.85;margin-top:2px;}
    .th-phone{font-size:11px;opacity:0.7;margin-top:2px;direction:ltr;text-align:right;}
    .th-meta{text-align:left;font-size:11px;opacity:0.8;line-height:1.9;}
    .th-meta strong{display:block;font-size:13px;opacity:1;}

    /* ── Inner border ── */
    .inner-border{
      border:2px solid #1d4ed8;
      margin:0 18px 18px;
      flex:1;
      position:relative;
      z-index:1;
      display:flex;
      flex-direction:column;
    }

    /* ── Invoice title bar ── */
    .inv-title-bar{
      background:linear-gradient(90deg,#eff6ff,#dbeafe);
      border-bottom:2px solid #bfdbfe;
      padding:10px 20px;
      display:flex;
      align-items:center;
      justify-content:space-between;
    }
    .inv-title-bar h2{font-size:16px;font-weight:900;color:#1e3a8a;}
    .inv-badge{
      background:#1d4ed8;color:white;
      font-size:10px;font-weight:800;
      padding:3px 10px;border-radius:99px;
      letter-spacing:0.3px;
    }

    /* ── Section ── */
    .section{padding:14px 20px;border-bottom:1.5px solid #e2e8f0;position:relative;}
    .section:last-child{border-bottom:none;}
    .sec-title{
      font-size:11px;font-weight:800;color:#2563eb;
      text-transform:uppercase;letter-spacing:0.5px;
      margin-bottom:10px;
      display:flex;align-items:center;gap:6px;
    }
    .sec-title::after{
      content:'';flex:1;height:1px;background:#bfdbfe;
    }

    /* ── Info grid ── */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;}
    .info-item{display:flex;flex-direction:column;gap:2px;}
    .info-label{font-size:10px;color:#94a3b8;font-weight:600;}
    .info-val{font-size:13px;font-weight:800;color:#0f172a;}

    /* ── Financial row ── */
    .fin-row{
      display:flex;justify-content:space-between;align-items:center;
      padding:8px 0;border-bottom:1px dashed #e2e8f0;
    }
    .fin-row:last-child{border:none;}
    .fin-label{font-size:12px;color:#475569;font-weight:600;}
    .fin-val{font-size:13px;font-weight:800;}

    /* ── Amount highlight boxes ── */
    .amount-boxes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;}
    .amt-box{
      border-radius:12px;padding:14px 12px;text-align:center;
    }
    .amt-box.paid{background:#f0fdf4;border:1.5px solid #86efac;}
    .amt-box.due{background:#fef2f2;border:1.5px solid #fca5a5;}
    .amt-box.settled{background:#f0fdf4;border:1.5px solid #86efac;grid-column:span 2;}
    .amt-big{font-size:24px;font-weight:900;display:block;margin-bottom:3px;}
    .amt-label{font-size:10px;color:#64748b;font-weight:600;}
    .paid .amt-big{color:#16a34a;}
    .due .amt-big{color:#dc2626;}
    .settled .amt-big{color:#16a34a;font-size:18px;}

    /* ── Notes ── */
    .notes-box{background:#f8fafc;border-right:3px solid #2563eb;padding:10px 14px;border-radius:0 8px 8px 0;font-size:12px;line-height:1.8;color:#334155;}

    /* ── Sign area ── */
    .sign-area{display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;gap:20px;}
    .sign-box{text-align:center;flex:1;}
    .sign-line{border-top:1.5px solid #94a3b8;margin:28px auto 6px;width:80%;}
    .sign-label{font-size:11px;color:#64748b;font-weight:700;}

    /* ── Clinic Stamp ── */
    .stamp-wrap{display:flex;justify-content:flex-end;margin-top:8px;}
    .stamp{
      width:110px;height:110px;
      border:3px solid #1d4ed8;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      transform:rotate(-18deg);
      position:relative;
      border-radius:4px;
    }
    .stamp::before{
      content:'';position:absolute;inset:4px;
      border:1.5px solid #1d4ed8;
      border-radius:2px;
    }
    .stamp-name{font-size:11.5px;font-weight:900;color:#1e3a8a;text-align:center;line-height:1.4;letter-spacing:0;}
    .stamp-sub{font-size:8.5px;color:#2563eb;text-align:center;font-weight:700;margin-top:2px;}

    /* ── Footer ── */
    .inv-footer{
      background:linear-gradient(90deg,#f0f9ff,#eff6ff);
      border-top:1.5px solid #bfdbfe;
      padding:10px 20px;
      text-align:center;
      font-size:11px;color:#64748b;
      line-height:1.9;
    }
    .inv-footer strong{color:#1d4ed8;}

    @media print{
      html,body{background:white!important;}
      .page-wrap{margin:0;box-shadow:none;border:none;width:100%;min-height:auto;}
      .inner-border{margin:0 12px 12px;}
      @page{size:A4 portrait;margin:0;}
    }
  </style>
</head>
<body>
<div class="page-wrap">

  <!-- Watermark -->
  <div class="watermark">
    <img src="${logoSrc}" alt="" onerror="this.style.display='none'"/>
  </div>

  <!-- Top header (outside border) -->
  <div class="top-header">
    <div class="th-logo">
      <img src="${logoSrc}" alt="لوجو" onerror="this.style.display='none'"/>
    </div>
    <div class="th-info">
      <div class="th-clinic">عيادة د. وسام يوسف</div>
      <div class="th-spec">أخصائي تقويم الأسنان | بني مزار، المنيا</div>
      <div class="th-phone">📞 01156798324</div>
    </div>
    <div class="th-meta">
      <strong>فاتورة رسمية</strong>
      ${receptionist ? `<span>الاستقبال: ${receptionist}</span><br/>` : ''}
      <span>${printDate}</span><br/>
      <span>الوقت: ${printTime}</span>
    </div>
  </div>

  <!-- Inner border box -->
  <div class="inner-border">

    <!-- Invoice title -->
    <div class="inv-title-bar">
      <h2>🧾 فاتورة / إيصال دفع</h2>
      <span class="inv-badge">فاتورة رسمية</span>
    </div>

    <!-- Patient info -->
    <div class="section">
      <div class="sec-title">👤 بيانات المريض</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">اسم المريض</span>
          <span class="info-val">${patient?.fullName || '—'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">رقم الجوال</span>
          <span class="info-val" style="direction:ltr;text-align:right">${patient?.phone || '—'}</span>
        </div>
        ${patient?.age ? `<div class="info-item"><span class="info-label">السن</span><span class="info-val">${patient.age} سنة</span></div>` : ''}
        <div class="info-item">
          <span class="info-label">تاريخ الجلسة</span>
          <span class="info-val">${sessionDate}</span>
        </div>
      </div>
    </div>

    <!-- Financial -->
    <div class="section">
      <div class="sec-title">💰 التفاصيل المالية</div>
      <div class="fin-row">
        <span class="fin-label">إجمالي تكلفة العلاج</span>
        <span class="fin-val">${Number(totalCost).toLocaleString('ar-EG')} ج.م</span>
      </div>
      <div class="fin-row">
        <span class="fin-label">إجمالي المدفوع سابقاً</span>
        <span class="fin-val" style="color:#16a34a">${Number(totalPaid).toLocaleString('ar-EG')} ج.م</span>
      </div>
      <div class="fin-row">
        <span class="fin-label">المدفوع في هذه الجلسة</span>
        <span class="fin-val" style="color:#2563eb;font-size:15px">${Number(amountPaid).toLocaleString('ar-EG')} ج.م</span>
      </div>

      <div class="amount-boxes">
        <div class="amt-box paid">
          <span class="amt-big">${Number(amountPaid).toLocaleString('ar-EG')} ج.م</span>
          <span class="amt-label">المبلغ المدفوع في هذه الجلسة</span>
        </div>
        ${remaining > 0
          ? `<div class="amt-box due">
              <span class="amt-big">${Number(remaining).toLocaleString('ar-EG')} ج.م</span>
              <span class="amt-label">المبلغ المتبقي</span>
            </div>`
          : `<div class="amt-box settled">
              <span class="amt-big">✅ الحساب مسدد بالكامل</span>
              <span class="amt-label">شكراً على التزامكم</span>
            </div>`
        }
      </div>
    </div>

    ${session?.notes ? `
    <div class="section">
      <div class="sec-title">📝 ملاحظات الجلسة</div>
      <div class="notes-box">${session.notes}</div>
    </div>` : ''}

    <!-- Sign + Stamp -->
    <div class="section">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;">
        <div class="sign-area" style="flex:1;">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">توقيع المريض</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">توقيع الطبيب / الاستقبال</div>
          </div>
        </div>
        <div class="stamp-wrap">
          <div class="stamp">
            <div class="stamp-name">د. وسام<br/>يوسف</div>
            <div class="stamp-sub">أخصائي تقويم<br/>الأسنان</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="inv-footer">
      <strong>شكراً لثقتكم بعيادة د. وسام يوسف</strong><br/>
      بني مزار، المنيا | 📞 01156798324<br/>
      تاريخ الإصدار: ${printDate} — الساعة ${printTime}
    </div>

  </div><!-- /inner-border -->
</div><!-- /page-wrap -->
</body>
</html>`;

  printHtml(html);
}


export async function printPrescription({ patient, session, receptionist = '' }) {
  const absLogoUrl = getAbsoluteLogoUrl();
  const logoData   = await fetchLogoBase64(absLogoUrl);
  const logoSrc    = logoData || absLogoUrl;
  const { date: printDate, time: printTime } = nowAr();

  const medicines = session?.medicines || [];
  if (medicines.length === 0) {
    alert('لا توجد أدوية مضافة في هذه الجلسة');
    return;
  }

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>روشتة - ${patient?.fullName || ''}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{font-family:'Cairo','Arial',sans-serif;direction:rtl;background:#e8edf5;color:#0f172a;font-size:13px;}
    .page-wrap{width:210mm;min-height:297mm;margin:0 auto;background:white;position:relative;display:flex;flex-direction:column;}
    .watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;height:260px;opacity:0.04;pointer-events:none;z-index:0;}
    .watermark img{width:100%;height:100%;object-fit:contain;}

    .top-header{background:linear-gradient(135deg,#1e3a8a,#1d4ed8,#0284c7);color:white;padding:18px 28px 16px;display:flex;align-items:center;gap:16px;position:relative;z-index:1;}
    .th-logo{width:62px;height:62px;background:white;border-radius:14px;padding:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.25);}
    .th-logo img{width:54px;height:54px;object-fit:contain;}
    .th-info{flex:1;}
    .th-clinic{font-size:20px;font-weight:900;}
    .th-spec{font-size:12px;opacity:0.85;margin-top:2px;}
    .th-phone{font-size:11px;opacity:0.7;margin-top:2px;direction:ltr;text-align:right;}
    .th-meta{text-align:left;font-size:11px;opacity:0.8;line-height:1.9;}
    .th-meta strong{display:block;font-size:13px;opacity:1;}

    .inner-border{border:2px solid #1d4ed8;margin:0 18px 18px;flex:1;position:relative;z-index:1;display:flex;flex-direction:column;}

    .rx-title{background:linear-gradient(90deg,#eff6ff,#dbeafe);border-bottom:2px solid #bfdbfe;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;}
    .rx-title h2{font-size:17px;font-weight:900;color:#1e3a8a;}
    .rx-symbol{font-size:38px;color:#1d4ed8;font-weight:900;font-style:italic;line-height:1;}

    .section{padding:14px 20px;border-bottom:1.5px solid #e2e8f0;}
    .section:last-child{border-bottom:none;}
    .sec-title{font-size:11px;font-weight:800;color:#2563eb;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
    .sec-title::after{content:'';flex:1;height:1px;background:#bfdbfe;}

    .patient-row{display:flex;gap:24px;flex-wrap:wrap;}
    .p-item{display:flex;flex-direction:column;gap:2px;}
    .p-label{font-size:10px;color:#94a3b8;font-weight:600;}
    .p-val{font-size:13px;font-weight:800;}

    .med-table{width:100%;border-collapse:collapse;}
    .med-table th{background:#1d4ed8;color:white;padding:9px 12px;font-size:12px;font-weight:800;text-align:right;}
    .med-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #e2e8f0;}
    .med-table tr:last-child td{border:none;}
    .med-table tr:nth-child(even) td{background:#f8fafc;}
    .med-num{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#dbeafe;color:#1d4ed8;border-radius:50%;font-size:11px;font-weight:900;}

    .sign-section{padding:16px 20px;}
    .sign-area{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;}
    .sign-box{text-align:center;flex:1;}
    .sign-line{border-top:1.5px solid #94a3b8;margin:28px auto 6px;width:80%;}
    .sign-label{font-size:11px;color:#64748b;font-weight:700;}
    .stamp-wrap{display:flex;justify-content:flex-end;}
    .stamp{width:110px;height:110px;border:3px solid #1d4ed8;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-18deg);position:relative;border-radius:4px;}
    .stamp::before{content:'';position:absolute;inset:4px;border:1.5px solid #1d4ed8;border-radius:2px;}
    .stamp-name{font-size:11.5px;font-weight:900;color:#1e3a8a;text-align:center;line-height:1.4;}
    .stamp-sub{font-size:8.5px;color:#2563eb;text-align:center;font-weight:700;margin-top:2px;}

    .inv-footer{background:linear-gradient(90deg,#f0f9ff,#eff6ff);border-top:1.5px solid #bfdbfe;padding:10px 20px;text-align:center;font-size:11px;color:#64748b;line-height:1.9;}
    .inv-footer strong{color:#1d4ed8;}

    @media print{
      html,body{background:white!important;}
      .page-wrap{margin:0;width:100%;min-height:auto;}
      .inner-border{margin:0 12px 12px;}
      @page{size:A4 portrait;margin:0;}
    }
  </style>
</head>
<body>
<div class="page-wrap">
  <div class="watermark"><img src="${logoSrc}" alt="" onerror="this.style.display='none'"/></div>

  <div class="top-header">
    <div class="th-logo"><img src="${logoSrc}" alt="" onerror="this.style.display='none'"/></div>
    <div class="th-info">
      <div class="th-clinic">عيادة د. وسام يوسف</div>
      <div class="th-spec">أخصائي تقويم الأسنان | بني مزار، المنيا</div>
      <div class="th-phone">📞 01156798324</div>
    </div>
    <div class="th-meta">
      <strong>روشتة طبية</strong>
      ${receptionist ? `<span>الاستقبال: ${receptionist}</span><br/>` : ''}
      <span>${printDate}</span><br/>
      <span>الوقت: ${printTime}</span>
    </div>
  </div>

  <div class="inner-border">
    <div class="rx-title">
      <h2>📋 روشتة طبية</h2>
      <div class="rx-symbol">Rx</div>
    </div>

    <div class="section">
      <div class="sec-title">👤 بيانات المريض</div>
      <div class="patient-row">
        <div class="p-item"><span class="p-label">الاسم</span><span class="p-val">${patient?.fullName || '—'}</span></div>
        <div class="p-item"><span class="p-label">الجوال</span><span class="p-val" style="direction:ltr">${patient?.phone || '—'}</span></div>
        ${patient?.age ? `<div class="p-item"><span class="p-label">السن</span><span class="p-val">${patient.age} سنة</span></div>` : ''}
        <div class="p-item"><span class="p-label">التاريخ</span><span class="p-val">${printDate}</span></div>
      </div>
    </div>

    <div class="section">
      <div class="sec-title">💊 الأدوية الموصوفة</div>
      <table class="med-table">
        <thead>
          <tr>
            <th style="width:30px">#</th>
            <th>اسم الدواء</th>
            <th>الجرعة</th>
            <th>المدة</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${medicines.map((m, i) => `
            <tr>
              <td><span class="med-num">${i + 1}</span></td>
              <td><strong>${m.name}</strong></td>
              <td>${m.dose || '—'}</td>
              <td>${m.duration || '—'}</td>
              <td style="color:#64748b;font-size:11px">${m.notes || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${session?.notes ? `
    <div class="section">
      <div class="sec-title">📝 ملاحظات الطبيب</div>
      <div style="background:#f8fafc;border-right:3px solid #2563eb;padding:10px 14px;border-radius:0 8px 8px 0;font-size:12px;line-height:1.8;color:#334155">${session.notes}</div>
    </div>` : ''}

    <div class="sign-section">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;">
        <div class="sign-area" style="flex:1;">
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">توقيع المريض</div>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <div class="sign-label">توقيع الطبيب</div>
          </div>
        </div>
        <div class="stamp-wrap">
          <div class="stamp">
            <div class="stamp-name">د. وسام<br/>يوسف</div>
            <div class="stamp-sub">أخصائي تقويم<br/>الأسنان</div>
          </div>
        </div>
      </div>
    </div>

    <div class="inv-footer">
      <strong>عيادة د. وسام يوسف — أخصائي تقويم الأسنان</strong><br/>
      بني مزار، المنيا | 📞 01156798324<br/>
      هذه الروشتة صادرة بتاريخ ${printDate}
    </div>
  </div>
</div>
</body>
</html>`;

  printHtml(html);
}


export async function printTestPage() {
  const logoData = await fetchLogoBase64(getAbsoluteLogoUrl());
  const logoSrc  = logoData || getAbsoluteLogoUrl();
  const { date, time } = nowAr();

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>صفحة اختبار الطباعة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Cairo','Arial',sans-serif;direction:rtl;background:white;padding:28px;max-width:600px;margin:0 auto;color:#0f172a;}
    .logo{display:block;margin:0 auto 12px;width:70px;height:auto;}
    h1{text-align:center;font-size:22px;font-weight:900;color:#1e40af;margin-bottom:6px;}
    .sub{text-align:center;color:#64748b;font-size:13px;margin-bottom:20px;}
    .box{border:2px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:14px;}
    .box h2{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:10px;}
    .row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px dotted #e2e8f0;}
    .row:last-child{border:none;}
    .arabic-test{font-size:14px;line-height:2;color:#1e293b;}
    .footer{text-align:center;margin-top:24px;font-size:11px;color:#94a3b8;}
    @media print{body{margin:0;}@page{margin:8mm;}}
  </style>
</head>
<body>
  <img src="${logoSrc}" class="logo" alt="logo" onerror="this.style.display='none'"/>
  <h1>عيادة د. وسام يوسف</h1>
  <div class="sub">🖨️ صفحة اختبار الطباعة</div>
  <div class="box">
    <h2>✅ اختبار الأحرف العربية</h2>
    <div class="arabic-test">
      أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي<br/>
      الأرقام: ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠ | 1 2 3 4 5 6 7 8 9 0<br/>
      نص تجريبي: مريض كريم محمد — تكلفة العلاج: ٥٠٠٠ ج.م<br/>
      اتجاه النص: يمين إلى يسار ✅
    </div>
  </div>
  <div class="box">
    <h2>📋 بيانات العيادة</h2>
    <div class="row"><label>الاسم:</label><span>عيادة د. وسام يوسف</span></div>
    <div class="row"><label>التخصص:</label><span>أخصائي تقويم الأسنان</span></div>
    <div class="row"><label>الموقع:</label><span>بني مزار، المنيا</span></div>
    <div class="row"><label>الهاتف:</label><span>01156798324</span></div>
  </div>
  <div class="box">
    <h2>🎨 اختبار الألوان</h2>
    <div style="color:#16a34a;font-weight:900;font-size:18px">مدفوع ✅</div>
    <div style="color:#ef4444;font-weight:900;font-size:16px">متأخر ⚠️</div>
    <div style="color:#1e40af;font-weight:800;font-size:15px">النظام يعمل بشكل صحيح ✅</div>
  </div>
  <div class="footer">
    <div>تاريخ الاختبار: ${date} — ${time}</div>
    <div>إذا ظهرت هذه الصفحة بشكل صحيح، الطباعة تعمل تماماً ✅</div>
  </div>
</body>
</html>`;

  printHtml(html);
}

export function printSessionReceipt(patient, session) {
  return printInvoice({ patient, session, type: 'full' });
}

export function printThermalReceipt(patient, session) {
  return printInvoice({ patient, session, type: 'thermal' });
}

function buildThermalHtml({ logoSrc, patient, session, sessionDate, amountPaid, remaining, totalCost, totalPaid, printDate, printTime, receptionist }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Cairo','Arial',sans-serif;direction:rtl;width:72mm;margin:0 auto;font-size:11px;color:#000;background:white;padding:4mm;}
    .center{text-align:center;}
    .logo{display:block;margin:0 auto 6px;width:44px;}
    .clinic-name{font-size:13px;font-weight:900;color:#000;text-align:center;}
    .sub{font-size:9px;color:#333;text-align:center;}
    .divider{border:none;border-top:1px dashed #000;margin:7px 0;}
    .title{font-size:12px;font-weight:900;text-align:center;margin:6px 0;}
    .row{display:flex;justify-content:space-between;padding:3px 0;font-size:10px;border-bottom:1px dotted #ccc;}
    .row:last-child{border:none;}
    .amt{text-align:center;border:1px dashed #000;padding:6px;margin:6px 0;}
    .amt-big{font-size:17px;font-weight:900;display:block;}
    .amt-lbl{font-size:9px;color:#333;}
    .footer{text-align:center;margin-top:8px;font-size:8px;color:#333;}
    .stamp-line{border:1.5px solid #000;display:inline-block;padding:4px 8px;font-size:9px;font-weight:800;transform:rotate(-15deg);margin:4px auto;display:block;width:fit-content;}
    @media print{body{width:72mm;}@page{size:72mm auto;margin:0;}}
  </style>
</head>
<body>
  <img src="${logoSrc}" class="logo" onerror="this.style.display='none'"/>
  <div class="clinic-name">عيادة د. وسام يوسف</div>
  <div class="sub">أخصائي تقويم الأسنان | بني مزار، المنيا</div>
  <div class="sub">01156798324</div>
  <hr class="divider"/>
  <div class="title">🧾 إيصال دفع</div>
  <hr class="divider"/>
  <div class="row"><span>المريض:</span><span>${patient?.fullName || '—'}</span></div>
  <div class="row"><span>الجوال:</span><span>${patient?.phone || '—'}</span></div>
  <div class="row"><span>تاريخ الجلسة:</span><span>${sessionDate}</span></div>
  ${receptionist ? `<div class="row"><span>الاستقبال:</span><span>${receptionist}</span></div>` : ''}
  <hr class="divider"/>
  <div class="row"><span>إجمالي التكلفة:</span><span>${Number(totalCost).toLocaleString()} ج.م</span></div>
  <div class="row"><span>المدفوع سابقاً:</span><span>${Number(totalPaid).toLocaleString()} ج.م</span></div>
  <div class="amt">
    <span class="amt-big">${Number(amountPaid).toLocaleString()} ج.م</span>
    <span class="amt-lbl">المبلغ المدفوع الآن</span>
  </div>
  ${remaining > 0
    ? `<div class="amt"><span class="amt-big" style="font-size:14px">${Number(remaining).toLocaleString()} ج.م</span><span class="amt-lbl">المتبقي</span></div>`
    : `<div class="center" style="font-size:12px;font-weight:900;padding:5px">✅ الحساب مسدد</div>`
  }
  ${session?.notes ? `<hr class="divider"/><div style="font-size:10px;line-height:1.7">ملاحظات: ${session.notes}</div>` : ''}
  <hr class="divider"/>
  <div class="stamp-line">د. وسام يوسف</div>
  <div class="footer">
    <div>شكراً لثقتكم | ${printDate}</div>
    <div>══════════════════</div>
  </div>
</body>
</html>`;
}
