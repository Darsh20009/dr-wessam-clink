export function printInvoice({ patient, session, logoUrl = '/logo-transparent.png', type = 'full' }) {
  const date = session?.sessionDate ? new Date(session.sessionDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const amountPaid = session?.amountPaid ?? patient?.financials?.totalPaid ?? 0;
  const remaining = patient?.financials?.remaining ?? 0;
  const totalCost = patient?.financials?.totalCost ?? 0;

  const thermalStyles = type === 'thermal' ? `
    body { font-size: 11px; width: 72mm; margin: 0 auto; }
    .header-logo { width: 40px; }
    .divider { border-top: 1px dashed #000; }
    .big-amount { font-size: 16px; }
  ` : `
    body { font-size: 14px; }
    .header-logo { width: 70px; }
    .divider { border-top: 2px solid #e2e8f0; }
    .big-amount { font-size: 24px; }
  `;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة - ${patient?.fullName || ''}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', 'Arial', sans-serif; direction: rtl; background: white; color: #0f172a; ${type === 'thermal' ? 'width:72mm;margin:0 auto;' : 'max-width:700px;margin:20px auto;padding:24px;'} }
    .header { text-align: center; padding-bottom: 16px; margin-bottom: 16px; }
    .header-logo { height: auto; display: block; margin: 0 auto 8px; }
    .clinic-name { font-size: ${type === 'thermal' ? '13px' : '20px'}; font-weight: 900; color: #1e40af; margin-bottom: 2px; }
    .clinic-sub { font-size: ${type === 'thermal' ? '10px' : '12px'}; color: #64748b; }
    .divider { margin: 12px 0; }
    .invoice-title { text-align: center; font-size: ${type === 'thermal' ? '12px' : '16px'}; font-weight: 800; color: #1e40af; margin: 8px 0; background: ${type === 'thermal' ? 'none' : '#eff6ff'}; padding: 6px; border-radius: 6px; }
    .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: ${type === 'thermal' ? '11px' : '13px'}; }
    .row label { color: #64748b; font-weight: 600; }
    .row span { font-weight: 700; }
    .amount-box { text-align: center; background: ${type === 'thermal' ? 'none' : '#f0fdf4'}; border: ${type === 'thermal' ? '1px dashed #000' : '2px solid #86efac'}; border-radius: 8px; padding: 10px; margin: 10px 0; }
    .big-amount { font-weight: 900; color: #16a34a; display: block; }
    .amount-label { font-size: ${type === 'thermal' ? '10px' : '11px'}; color: #64748b; margin-top: 2px; }
    .remaining-box { text-align: center; background: ${type === 'thermal' ? 'none' : '#fef2f2'}; border: ${type === 'thermal' ? '1px dashed #000' : '2px solid #fca5a5'}; border-radius: 8px; padding: 8px; margin: 6px 0; }
    .remaining-amount { font-weight: 900; color: #dc2626; font-size: ${type === 'thermal' ? '14px' : '18px'}; }
    .footer { text-align: center; margin-top: 16px; font-size: ${type === 'thermal' ? '9px' : '11px'}; color: #94a3b8; }
    .notes-box { background: ${type === 'thermal' ? 'none' : '#f8fafc'}; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin: 8px 0; font-size: ${type === 'thermal' ? '10px' : '12px'}; }
    .sign-area { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #000; }
    .sign-box { text-align: center; font-size: 11px; color: #64748b; }
    .sign-line { border-top: 1px solid #000; width: 100px; margin: 20px auto 4px; }
    @media print { body { margin: 0 !important; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" class="header-logo" alt="شعار العيادة" onerror="this.style.display='none'" />
    <div class="clinic-name">عيادة د. وسام يوسف</div>
    <div class="clinic-sub">أخصائي تقويم الأسنان | بني مزار، المنيا</div>
    <div class="clinic-sub">📞 01156798324</div>
  </div>

  <div class="divider"></div>
  <div class="invoice-title">🧾 فاتورة / إيصال دفع</div>
  <div class="divider"></div>

  <div class="row"><label>اسم المريض:</label><span>${patient?.fullName || '—'}</span></div>
  <div class="row"><label>رقم الجوال:</label><span>${patient?.phone || '—'}</span></div>
  ${patient?.age ? `<div class="row"><label>العمر:</label><span>${patient.age} سنة</span></div>` : ''}
  <div class="row"><label>تاريخ الجلسة:</label><span>${date}</span></div>
  ${session?.notes ? `<div class="row"><label>ملاحظات الجلسة:</label><span style="max-width:60%;text-align:left;font-size:11px">${session.notes}</span></div>` : ''}

  <div class="divider"></div>

  <div class="row"><label>التكلفة الإجمالية:</label><span>${(totalCost).toLocaleString('ar-EG')} ج.م</span></div>
  <div class="row"><label>إجمالي المدفوع:</label><span style="color:#16a34a">${(patient?.financials?.totalPaid || 0).toLocaleString('ar-EG')} ج.م</span></div>

  <div class="amount-box">
    <span class="big-amount">${amountPaid.toLocaleString('ar-EG')} ج.م</span>
    <div class="amount-label">المبلغ المدفوع في هذه الجلسة</div>
  </div>

  ${remaining > 0 ? `
  <div class="remaining-box">
    <div class="remaining-amount">${remaining.toLocaleString('ar-EG')} ج.م</div>
    <div class="amount-label">المبلغ المتبقي</div>
  </div>` : `<div style="text-align:center;color:#16a34a;font-weight:800;padding:6px">✅ الحساب مسدد بالكامل</div>`}

  <div class="divider"></div>

  ${type !== 'thermal' ? `
  <div class="sign-area">
    <div class="sign-box"><div class="sign-line"></div><div>توقيع المريض</div></div>
    <div class="sign-box"><div class="sign-line"></div><div>توقيع الطبيب</div></div>
  </div>` : ''}

  <div class="footer">
    <div>شكراً لثقتكم بعيادة د. وسام يوسف</div>
    <div>تم إصدار هذه الفاتورة بتاريخ: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=600');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة في متصفحك'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

export function printSessionReceipt(patient, session) {
  printInvoice({ patient, session, type: 'full' });
}

export function printThermalReceipt(patient, session) {
  printInvoice({ patient, session, type: 'thermal' });
}
