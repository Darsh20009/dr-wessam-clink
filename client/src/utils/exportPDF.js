import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function imgToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch { resolve(url); }
    };
    img.onerror = () => resolve(url);
    img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  });
}

async function resolveImages(sections) {
  const results = {};
  const all = [];
  sections.forEach(s => {
    if (!s.images) return;
    s.images.forEach(img => {
      if (img.url) all.push({ key: img._id || img.url, url: img.url });
    });
  });
  await Promise.all(all.map(async ({ key, url }) => {
    results[key] = await imgToBase64(url);
  }));
  return results;
}

const SESSION_SLOTS = [
  { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
  { type: 'right_lateral', label: 'Right Lateral' },
  { type: 'left_lateral', label: 'Left Lateral' },
  { type: 'upper_jaw', label: 'Upper Jaw' },
  { type: 'lower_jaw', label: 'Lower Jaw' },
];
const FACE_SLOTS = [
  { type: 'frontal_rest', label: 'Frontal - Rest' },
  { type: 'frontal_smile', label: 'Frontal - Smile' },
  { type: 'lateral', label: 'Lateral - Rest' },
];
const INTRAORAL_SLOTS = [
  { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
  { type: 'upper_jaw', label: 'Upper Jaw' },
  { type: 'lower_jaw', label: 'Lower Jaw' },
  { type: 'right_lateral', label: 'Right Lateral' },
  { type: 'left_lateral', label: 'Left Lateral' },
];
const XRAY_TYPES = [
  { type: 'panorama', label: 'Panoramic X-Ray' },
  { type: 'lateral', label: 'Lateral Ceph' },
  { type: 'cbct', label: 'CBCT' },
];

function buildHTML({ patient, sessions, ttt, siteInfo, opts, imgMap }) {
  const clinicName = siteInfo?.clinicName || 'عيادة د. وسام يوسف';
  const clinicSubtitle = siteInfo?.clinicSubtitle || 'أخصائي تقويم الأسنان — بني مزار، المنيا';
  const clinicPhone = siteInfo?.phone || '+20 115 679 8324';
  const logoUrl = '/logo.png';
  const patientName = patient.fullName || '';
  const generated = format(new Date(), 'd MMMM yyyy', { locale: ar });
  const fin = patient.financials || {};

  const imgTag = (url, style = '') => {
    const src = imgMap[url] || url;
    return `<img src="${src}" style="max-width:100%;height:auto;border-radius:6px;border:1px solid #e2e8f0;${style}" onerror="this.style.display='none'" />`;
  };

  const sectionTitle = (t) => `<div class="sec-title">${t}</div>`;

  const tttSection = () => {
    if (!opts.includeTTT || !ttt) return '';
    const v = (k) => ttt[k] || '';
    const chk = (k) => ttt[k] ? '✓' : '☐';
    return `
      <div class="page-break">
        ${sectionTitle('TTT FILE — Orthodontic Treatment Planning')}
        <table class="ttt-table">
          <tr><th colspan="2" class="th-head">Problem List</th></tr>
          <tr><td class="label">1. OH</td><td>${v('oh') || '—'}</td></tr>
          <tr><td class="label">2. Skeletal — AP</td><td>${v('skeletalAP') || '—'}</td></tr>
          <tr><td class="label">Skeletal — V (Vertical)</td><td>${v('skeletalV') || '—'}</td></tr>
          <tr><td class="label">Skeletal — T (Transverse)</td><td>${v('skeletalT') || '—'}</td></tr>
          <tr><td class="label">3. Dental — AP</td><td>${v('dentalAP') || '—'}</td></tr>
          <tr><td class="label">Dental — V</td><td>${v('dentalV') || '—'}</td></tr>
          <tr><td class="label">Dental — T</td><td>${v('dentalT') || '—'}</td></tr>
          <tr><td class="label">4. S.T</td><td>${v('st') || '—'}</td></tr>
          <tr><td class="label">5. Habit</td><td>${v('habit') || '—'}</td></tr>
        </table>

        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="2" class="th-head">TTT Objectives</th></tr>
          <tr><td class="label">1. OH</td><td>${v('obj1') || '—'}</td></tr>
          <tr><td class="label">2. Skeletal</td><td>${v('obj2') || '—'}</td></tr>
          <tr><td class="label">3.</td><td>${v('obj3') || 'Align and level both arches.'}</td></tr>
          <tr><td class="label">4.</td><td>${v('obj4') || 'Maintain/ Correct OJ.'}</td></tr>
          <tr><td class="label">5.</td><td>${v('obj5') || 'Maintain/ Correct OB.'}</td></tr>
          <tr><td class="label">6.</td><td>${v('obj6') || 'Maintain/ Correct Midline'}</td></tr>
          <tr><td class="label">7.</td><td>${v('obj7') || 'Achieve Class I Canine and Incisors.'}</td></tr>
          <tr><td class="label">8.</td><td>${v('obj8') || 'Achieve Class I Molar Relationship'}</td></tr>
          <tr><td class="label">9.</td><td>${v('obj9') || 'Coordinate both arches with good Buccal Interdigitation.'}</td></tr>
          <tr><td class="label">10.</td><td>${v('obj10') || 'Retention.'}</td></tr>
        </table>

        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="2" class="th-head">Bolton Analysis</th></tr>
          <tr><td class="label">Anterior Ratio (%)</td><td>${v('boltonAnterior') || '—'}</td></tr>
          <tr><td class="label">Overall Ratio (%)</td><td>${v('boltonOverall') || '—'}</td></tr>
        </table>

        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="4" class="th-head">Tooth Size & Arch Length Analysis</th></tr>
          <tr><th></th><th>Total Arch Length</th><th>Total Tooth Size</th><th>Discrepancy</th></tr>
          <tr><td class="label">Upper</td><td>${v('upperArchLength') || '—'}</td><td>${v('upperToothSize') || '—'}</td><td>${v('upperDiscrepancy') || '—'}</td></tr>
          <tr><td class="label">Lower</td><td>${v('lowerArchLength') || '—'}</td><td>${v('lowerToothSize') || '—'}</td><td>${v('lowerDiscrepancy') || '—'}</td></tr>
        </table>

        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="2" class="th-head">Summary of Space Requirements</th></tr>
          <tr><td class="label">Crowding & Spacing</td><td>${v('srCrowding') || '—'}</td></tr>
          <tr><td class="label">Levelling Occlusal Curve</td><td>${v('srLevelling') || '—'}</td></tr>
          <tr><td class="label">Arch Width Change</td><td>${v('srArchWidth') || '—'}</td></tr>
          <tr><td class="label">Incisor Sagittal Position Change</td><td>${v('srIncisorSagittal') || '—'}</td></tr>
          <tr><td class="label">Incisor Inclination</td><td>${v('srIncisorInclination') || '—'}</td></tr>
        </table>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
          <table class="ttt-table">
            <tr><th colspan="2" class="th-head">Space Gaining — Upper</th></tr>
            <tr><td>${chk('upperArchLengthening')} Arch lengthening</td><td></td></tr>
            <tr><td>${chk('upperTransverse')} Transverse arch expansion</td><td></td></tr>
            <tr><td>${chk('upperIER')} Interdental enamel reduction</td><td></td></tr>
            <tr><td>${chk('upperExtractions')} Dental extractions</td><td></td></tr>
            <tr><td class="label">Timing of Extractions</td><td>${v('upperTimingExtr') || '—'}</td></tr>
            <tr><td class="label">Teeth of Extractions</td><td>${v('upperTeethExtr') || '—'}</td></tr>
            <tr><td class="label">Timing of Bonding</td><td>${v('upperTimingBond') || '—'}</td></tr>
            <tr><td class="label">BOND</td><td>${v('upperTeethBond') || '—'}</td></tr>
            <tr><td class="label">SKIP</td><td>${v('upperTeethSkip') || '—'}</td></tr>
          </table>
          <table class="ttt-table">
            <tr><th colspan="2" class="th-head">Space Gaining — Lower</th></tr>
            <tr><td>${chk('lowerArchLengthening')} Arch lengthening</td><td></td></tr>
            <tr><td>${chk('lowerTransverse')} Transverse arch expansion</td><td></td></tr>
            <tr><td>${chk('lowerIER')} Interdental enamel reduction</td><td></td></tr>
            <tr><td>${chk('lowerExtractions')} Dental extractions</td><td></td></tr>
            <tr><td class="label">Timing of Extractions</td><td>${v('lowerTimingExtr') || '—'}</td></tr>
            <tr><td class="label">Teeth of Extractions</td><td>${v('lowerTeethExtr') || '—'}</td></tr>
            <tr><td class="label">Timing of Bonding</td><td>${v('lowerTimingBond') || '—'}</td></tr>
            <tr><td class="label">BOND</td><td>${v('lowerTeethBond') || '—'}</td></tr>
            <tr><td class="label">SKIP</td><td>${v('lowerTeethSkip') || '—'}</td></tr>
          </table>
        </div>
      </div>`;
  };

  const photosSection = () => {
    if (!opts.includePhotos) return '';
    const faceImgs = (patient.faceImages || []);
    const intraImgs = (patient.intraOralImages || []);
    const xrayImgs = (patient.xrays || []);
    if (!faceImgs.length && !intraImgs.length && !xrayImgs.length) return '';

    const slotGrid = (slots, images) => slots.map(slot => {
      const imgs = images.filter(i => i.type === slot.type);
      if (!imgs.length) return '';
      return `<div class="img-slot">
        <div class="slot-label">${slot.label}</div>
        ${imgs.map(i => `<div>${imgTag(i.url, 'width:100px;height:78px;object-fit:cover;')}</div>`).join('')}
      </div>`;
    }).join('');

    return `
      <div class="page-break">
        ${sectionTitle('📸 Patient Photographs')}
        ${faceImgs.length ? `<div class="subsec">Extra-Oral Photos</div><div class="img-grid">${slotGrid(FACE_SLOTS, faceImgs)}</div>` : ''}
        ${intraImgs.length ? `<div class="subsec">Intra-Oral Photos</div><div class="img-grid">${slotGrid(INTRAORAL_SLOTS, intraImgs)}</div>` : ''}
        ${xrayImgs.length ? `<div class="subsec">Radiographs</div><div class="img-grid">${slotGrid(XRAY_TYPES, xrayImgs)}</div>` : ''}
      </div>`;
  };

  const sessionsSection = () => {
    if (!opts.includeSessions) return '';
    const toShow = opts.sessionId
      ? sessions.filter(s => s._id === opts.sessionId)
      : sessions;
    if (!toShow.length) return '';

    return toShow.map((s, i) => {
      const imgs = s.images || [];
      return `
        <div class="page-break">
          ${sectionTitle(`📋 جلسة #${s.sessionNumber || i + 1} — ${format(new Date(s.sessionDate), 'd MMMM yyyy', { locale: ar })}`)}
          ${s.notes ? `<div class="field-row"><span class="fl">ملاحظات الجلسة:</span><span class="fv">${s.notes}</span></div>` : ''}
          ${s.nextStep ? `<div class="field-row"><span class="fl">الخطوة القادمة:</span><span class="fv">${s.nextStep}</span></div>` : ''}
          ${s.nextAppointment ? `<div class="field-row"><span class="fl">موعد المتابعة:</span><span class="fv">${format(new Date(s.nextAppointment), 'd MMMM yyyy', { locale: ar })}</span></div>` : ''}
          ${s.amountPaid > 0 ? `<div class="field-row"><span class="fl">المبلغ المدفوع:</span><span class="fv" style="color:#10b981;font-weight:700">${s.amountPaid.toLocaleString()} ج.م</span></div>` : ''}
          ${imgs.length ? `
            <div class="subsec" style="margin-top:12px">Session Photos</div>
            <div class="img-grid">${SESSION_SLOTS.map(slot => {
              const slotImgs = imgs.filter(im => im.type === slot.type);
              if (!slotImgs.length) return '';
              return `<div class="img-slot">
                <div class="slot-label">${slot.label}</div>
                ${slotImgs.map(im => `<div>${imgTag(im.url, 'width:100px;height:78px;object-fit:cover;')}</div>`).join('')}
                ${slotImgs[0].notes ? `<div style="font-size:10px;color:#64748b;margin-top:3px">${slotImgs[0].notes}</div>` : ''}
              </div>`;
            }).join('')}</div>` : ''}
        </div>`;
    }).join('');
  };

  const financialSection = () => {
    if (!opts.includeFinancials) return '';
    return `
      <div class="page-break">
        ${sectionTitle('💰 البيانات المالية')}
        <table class="ttt-table">
          <tr><td class="label">إجمالي تكلفة العلاج</td><td><strong>${(fin.totalCost || 0).toLocaleString()} ج.م</strong></td></tr>
          <tr><td class="label">إجمالي المدفوع</td><td style="color:#10b981;font-weight:700">${(fin.totalPaid || 0).toLocaleString()} ج.م</td></tr>
          <tr><td class="label">المتبقي</td><td style="color:#ef4444;font-weight:700">${(fin.remaining || 0).toLocaleString()} ج.م</td></tr>
          <tr><td class="label">حالة الحساب</td><td>${{ paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' }[fin.status] || '—'}</td></tr>
        </table>
      </div>`;
  };

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>ملف ${patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',Arial,sans-serif; color:#0f172a; background:white; direction:rtl; font-size:13px; line-height:1.6; }
    .page { max-width:210mm; margin:0 auto; padding:20mm 18mm; }
    @media print {
      body { font-size:11px; }
      .no-print { display:none; }
      .page-break { page-break-before:auto; }
      @page { margin:15mm 12mm; size:A4; }
    }
    .clinic-header { display:flex; align-items:center; gap:18px; padding-bottom:16px; border-bottom:3px solid #2563eb; margin-bottom:20px; }
    .clinic-logo { width:72px; height:72px; object-fit:contain; border-radius:12px; }
    .clinic-info h1 { font-size:20px; font-weight:900; color:#1e3a8a; }
    .clinic-info p { font-size:12px; color:#64748b; margin-top:2px; }
    .patient-card { background:#eff6ff; border-radius:10px; padding:14px 18px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; border:1px solid #bfdbfe; }
    .patient-card .pf { font-size:11px; color:#64748b; }
    .patient-card .pv { font-weight:700; color:#1e293b; font-size:13px; }
    .sec-title { font-size:15px; font-weight:900; color:#1e40af; border-right:4px solid #2563eb; padding-right:10px; margin:18px 0 12px; }
    .subsec { font-size:12px; font-weight:700; color:#475569; margin:10px 0 6px; }
    .ttt-table { width:100%; border-collapse:collapse; font-size:12px; }
    .ttt-table td, .ttt-table th { border:1px solid #e2e8f0; padding:7px 10px; text-align:right; }
    .ttt-table .label { background:#f8fafc; font-weight:700; color:#334155; width:38%; }
    .ttt-table .th-head { background:#1e3a8a; color:white; font-weight:900; font-size:13px; text-align:center; }
    .img-grid { display:flex; flex-wrap:wrap; gap:12px; margin:8px 0; }
    .img-slot { display:flex; flex-direction:column; align-items:center; }
    .slot-label { font-size:10px; font-weight:700; color:#334155; margin-bottom:4px; font-family:monospace; text-align:center; }
    .field-row { display:flex; gap:12px; margin-bottom:8px; align-items:flex-start; }
    .fl { font-weight:700; color:#334155; min-width:160px; font-size:12px; }
    .fv { color:#475569; font-size:12px; flex:1; }
    .page-break { margin-bottom:24px; }
    .footer { margin-top:30px; padding-top:12px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:11px; }
    .print-btn { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#2563eb; color:white; border:none; border-radius:12px; padding:12px 32px; font-size:15px; font-weight:700; cursor:pointer; font-family:'Cairo',sans-serif; box-shadow:0 4px 20px rgba(37,99,235,0.4); z-index:999; }
  </style>
</head>
<body>
  <div class="page">
    <div class="clinic-header">
      <img src="/logo.png" class="clinic-logo" onerror="this.style.display='none'" />
      <div class="clinic-info">
        <h1>${clinicName}</h1>
        <p>${clinicSubtitle}</p>
        <p>📞 ${clinicPhone}</p>
      </div>
      <div style="margin-right:auto;text-align:left;font-size:11px;color:#94a3b8">
        <div>تاريخ التقرير: ${generated}</div>
      </div>
    </div>

    <div class="patient-card">
      <div><div class="pf">اسم المريض</div><div class="pv">${patient.fullName || '—'}</div></div>
      <div><div class="pf">رقم الجوال</div><div class="pv" style="direction:ltr">${patient.phone || '—'}</div></div>
      ${patient.age ? `<div><div class="pf">العمر</div><div class="pv">${patient.age} سنة</div></div>` : '<div></div>'}
      ${patient.address ? `<div><div class="pf">العنوان</div><div class="pv">${patient.address}</div></div>` : ''}
      ${patient.diagnosis ? `<div style="grid-column:1/-1"><div class="pf">التشخيص</div><div class="pv">${patient.diagnosis}</div></div>` : ''}
    </div>

    ${tttSection()}
    ${photosSection()}
    ${sessionsSection()}
    ${financialSection()}

    <div class="footer">
      ${clinicName} — ${clinicSubtitle} — ${clinicPhone}
    </div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
</body>
</html>`;
}

export async function exportPatientPDF({ patient, sessions = [], ttt = {}, siteInfo = {}, opts = {} }) {
  const allImages = [
    ...(patient.faceImages || []),
    ...(patient.intraOralImages || []),
    ...(patient.xrays || []),
    ...(sessions.flatMap(s => s.images || [])),
  ];
  const imgMap = {};
  await Promise.all(allImages.map(async img => {
    if (img.url) imgMap[img.url] = await imgToBase64(img.url);
  }));

  const html = buildHTML({ patient, sessions, ttt, siteInfo, opts, imgMap });
  const win = window.open('', '_blank');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة للمتصفح'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  return win;
}
