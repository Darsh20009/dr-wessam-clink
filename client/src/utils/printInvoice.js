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

export async function printInvoice({ patient, session, logoUrl, type = 'full' }) {
  const absLogoUrl = logoUrl || getAbsoluteLogoUrl();
  const logoData = await fetchLogoBase64(absLogoUrl);
  const logoSrc = logoData || absLogoUrl;

  const date = session?.sessionDate
    ? new Date(session.sessionDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const amountPaid = session?.amountPaid ?? patient?.financials?.totalPaid ?? 0;
  const remaining   = patient?.financials?.remaining ?? Math.max(0, (patient?.financials?.totalCost || 0) - (patient?.financials?.totalPaid || 0));
  const totalCost   = patient?.financials?.totalCost ?? 0;

  const isThermal = type === 'thermal';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>فاتورة - ${patient?.fullName || ''}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Arial', 'Tahoma', sans-serif;
      direction: rtl;
      background: white;
      color: #0f172a;
      ${isThermal ? 'width:72mm; margin:0 auto; font-size:11px;' : 'max-width:720px; margin:20px auto; padding:28px; font-size:14px;'}
    }
    .header { text-align: center; padding-bottom: ${isThermal ? '10px' : '18px'}; margin-bottom: ${isThermal ? '10px' : '16px'}; ${!isThermal ? 'border-bottom: 2px solid #e2e8f0;' : ''} }
    .header-logo { height: auto; display: block; margin: 0 auto ${isThermal ? '6px' : '10px'}; width: ${isThermal ? '44px' : '76px'}; }
    .clinic-name { font-size: ${isThermal ? '13px' : '21px'}; font-weight: 900; color: #1e40af; margin-bottom: 2px; }
    .clinic-sub  { font-size: ${isThermal ? '9px'  : '12px'}; color: #64748b; }
    .divider { border: none; border-top: ${isThermal ? '1px dashed #000' : '1.5px solid #e2e8f0'}; margin: ${isThermal ? '8px 0' : '14px 0'}; }
    .invoice-title { text-align: center; font-size: ${isThermal ? '11px' : '16px'}; font-weight: 800; color: #1e40af; margin: 8px 0; ${!isThermal ? 'background:#eff6ff; padding:8px; border-radius:8px;' : ''} }
    .row { display: flex; justify-content: space-between; padding: ${isThermal ? '3px 0' : '6px 0'}; font-size: ${isThermal ? '10px' : '13px'}; border-bottom: 1px dotted #e2e8f0; }
    .row:last-child { border-bottom: none; }
    .row label { color: #64748b; font-weight: 600; }
    .row span   { font-weight: 700; }
    .amount-box {
      text-align: center;
      ${isThermal ? 'border: 1px dashed #000;' : 'background:#f0fdf4; border: 2px solid #86efac; border-radius:10px;'}
      padding: ${isThermal ? '6px' : '14px'};
      margin: ${isThermal ? '6px 0' : '12px 0'};
    }
    .big-amount   { font-weight: 900; color: #16a34a; display: block; font-size: ${isThermal ? '16px' : '26px'}; }
    .amount-label { font-size: ${isThermal ? '9px' : '11px'}; color: #64748b; margin-top: 3px; }
    .remaining-box {
      text-align: center;
      ${isThermal ? 'border: 1px dashed #000;' : 'background:#fef2f2; border: 2px solid #fca5a5; border-radius:10px;'}
      padding: ${isThermal ? '5px' : '10px'};
      margin: ${isThermal ? '4px 0' : '8px 0'};
    }
    .remaining-amount { font-weight: 900; color: #dc2626; font-size: ${isThermal ? '14px' : '20px'}; }
    .settled { text-align:center; color:#16a34a; font-weight:800; padding:6px; font-size:${isThermal ? '11px' : '14px'}; }
    .notes-box { ${!isThermal ? 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;' : ''} padding: ${isThermal ? '4px 0' : '10px'}; margin: ${isThermal ? '4px 0' : '8px 0'}; font-size: ${isThermal ? '10px' : '12px'}; line-height:1.6; }
    .sign-area { display:flex; justify-content:space-between; margin-top:24px; padding-top:14px; border-top:1px dashed #94a3b8; }
    .sign-box  { text-align:center; font-size:11px; color:#64748b; }
    .sign-line { border-top:1px solid #000; width:100px; margin:22px auto 5px; }
    .footer { text-align:center; margin-top:${isThermal ? '10px' : '18px'}; font-size:${isThermal ? '8px' : '11px'}; color:#94a3b8; line-height:1.8; }
    @media print {
      body { margin:0 !important; }
      @page { margin: ${isThermal ? '2mm' : '10mm'}; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoSrc}" class="header-logo" alt="شعار العيادة" onerror="this.style.display='none'" />
    <div class="clinic-name">عيادة د. وسام يوسف</div>
    <div class="clinic-sub">أخصائي تقويم الأسنان | بني مزار، المنيا</div>
    <div class="clinic-sub">📞 01156798324</div>
  </div>

  <hr class="divider" />
  <div class="invoice-title">🧾 فاتورة / إيصال دفع</div>
  <hr class="divider" />

  <div class="row"><label>اسم المريض:</label><span>${patient?.fullName || '—'}</span></div>
  <div class="row"><label>رقم الجوال:</label><span>${patient?.phone || '—'}</span></div>
  ${patient?.age ? `<div class="row"><label>العمر:</label><span>${patient.age} سنة</span></div>` : ''}
  <div class="row"><label>تاريخ الجلسة:</label><span>${date}</span></div>
  <div class="row"><label>نوع الفاتورة:</label><span>${isThermal ? '🖨️ إيصال حراري' : '📄 فاتورة رسمية'}</span></div>

  <hr class="divider" />

  <div class="row"><label>التكلفة الإجمالية:</label><span>${Number(totalCost).toLocaleString('ar-EG')} ج.م</span></div>
  <div class="row"><label>إجمالي المدفوع:</label><span style="color:#16a34a">${Number(patient?.financials?.totalPaid || 0).toLocaleString('ar-EG')} ج.م</span></div>

  <div class="amount-box">
    <span class="big-amount">${Number(amountPaid).toLocaleString('ar-EG')} ج.م</span>
    <div class="amount-label">المبلغ المدفوع في هذه الجلسة</div>
  </div>

  ${remaining > 0
    ? `<div class="remaining-box">
        <div class="remaining-amount">${Number(remaining).toLocaleString('ar-EG')} ج.م</div>
        <div class="amount-label">المبلغ المتبقي</div>
      </div>`
    : `<div class="settled">✅ الحساب مسدد بالكامل</div>`
  }

  ${session?.notes
    ? `<div class="notes-box"><strong>ملاحظات الجلسة:</strong> ${session.notes}</div>`
    : ''
  }

  <hr class="divider" />

  ${!isThermal
    ? `<div class="sign-area">
        <div class="sign-box"><div class="sign-line"></div><div>توقيع المريض</div></div>
        <div class="sign-box"><div class="sign-line"></div><div>توقيع الطبيب</div></div>
       </div>`
    : ''
  }

  <div class="footer">
    <div>شكراً لثقتكم بعيادة د. وسام يوسف</div>
    <div>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    ${isThermal ? '<div>══════════════════</div>' : ''}
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=850,height=680');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة في متصفحك'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { try { win.print(); } catch {} }, 700);
}

export async function printTestPage() {
  const logoData = await fetchLogoBase64(getAbsoluteLogoUrl());
  const logoSrc  = logoData || getAbsoluteLogoUrl();

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>صفحة اختبار الطباعة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo','Arial','Tahoma',sans-serif; direction:rtl; padding:30px; max-width:600px; margin:0 auto; color:#0f172a; }
    .logo { display:block; margin:0 auto 12px; width:70px; height:auto; }
    h1  { text-align:center; font-size:22px; font-weight:900; color:#1e40af; margin-bottom:6px; }
    .sub { text-align:center; color:#64748b; font-size:13px; margin-bottom:20px; }
    .box { border:2px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:14px; }
    .box h2 { font-size:15px; font-weight:800; color:#0f172a; margin-bottom:10px; }
    .row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; border-bottom:1px dotted #e2e8f0; }
    .row:last-child { border:none; }
    .arabic-test { font-size:14px; line-height:2; color:#1e293b; }
    .ok { color:#16a34a; font-weight:800; }
    .footer { text-align:center; margin-top:24px; font-size:11px; color:#94a3b8; }
    @media print { body { margin:0; } @page { margin:8mm; } }
  </style>
</head>
<body>
  <img src="${logoSrc}" class="logo" alt="logo" onerror="this.style.display='none'" />
  <h1>عيادة د. وسام يوسف</h1>
  <div class="sub">🖨️ صفحة اختبار الطباعة</div>

  <div class="box">
    <h2>✅ اختبار الأحرف العربية</h2>
    <div class="arabic-test">
      أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي<br/>
      الأرقام: ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ٠<br/>
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
    <h2>🎨 اختبار الألوان والأحجام</h2>
    <div style="color:#16a34a;font-weight:900;font-size:18px">مدفوع ✅</div>
    <div style="color:#ef4444;font-weight:900;font-size:16px">متأخر ⚠️</div>
    <div style="color:#1e40af;font-weight:800;font-size:15px">النظام يعمل بشكل صحيح</div>
  </div>

  <div class="footer">
    <div>تاريخ الاختبار: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <div>الوقت: ${new Date().toLocaleTimeString('ar-EG')}</div>
    <div>إذا ظهرت هذه الصفحة بشكل صحيح، الطباعة تعمل تماماً ✅</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=700,height=600');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة في متصفحك'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { try { win.print(); } catch {} }, 700);
}

export function printSessionReceipt(patient, session) {
  return printInvoice({ patient, session, type: 'full' });
}

export function printThermalReceipt(patient, session) {
  return printInvoice({ patient, session, type: 'thermal' });
}
