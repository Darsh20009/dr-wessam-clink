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

const SLOTS = {
  en: {
    session: [
      { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
      { type: 'right_lateral',     label: 'Right Lateral' },
      { type: 'left_lateral',      label: 'Left Lateral' },
      { type: 'upper_jaw',         label: 'Upper Jaw' },
      { type: 'lower_jaw',         label: 'Lower Jaw' },
    ],
    face: [
      { type: 'frontal_rest',   label: 'Frontal - Rest' },
      { type: 'frontal_smile',  label: 'Frontal - Smile' },
      { type: 'lateral',        label: 'Lateral - Rest' },
    ],
    intraoral: [
      { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
      { type: 'upper_jaw',         label: 'Upper Jaw' },
      { type: 'lower_jaw',         label: 'Lower Jaw' },
      { type: 'right_lateral',     label: 'Right Lateral' },
      { type: 'left_lateral',      label: 'Left Lateral' },
    ],
    xray: [
      { type: 'panorama', label: 'Panoramic X-Ray' },
      { type: 'lateral',  label: 'Lateral Ceph' },
      { type: 'cbct',     label: 'CBCT' },
    ],
  },
  ar: {
    session: [
      { type: 'frontal_occlusion', label: 'إطباق أمامي' },
      { type: 'right_lateral',     label: 'جانبي أيمن' },
      { type: 'left_lateral',      label: 'جانبي أيسر' },
      { type: 'upper_jaw',         label: 'الفك العلوي' },
      { type: 'lower_jaw',         label: 'الفك السفلي' },
    ],
    face: [
      { type: 'frontal_rest',   label: 'أمامي - راحة' },
      { type: 'frontal_smile',  label: 'أمامي - ابتسامة' },
      { type: 'lateral',        label: 'جانبي - راحة' },
    ],
    intraoral: [
      { type: 'frontal_occlusion', label: 'إطباق أمامي' },
      { type: 'upper_jaw',         label: 'الفك العلوي' },
      { type: 'lower_jaw',         label: 'الفك السفلي' },
      { type: 'right_lateral',     label: 'جانبي أيمن' },
      { type: 'left_lateral',      label: 'جانبي أيسر' },
    ],
    xray: [
      { type: 'panorama', label: 'أشعة بانورامية' },
      { type: 'lateral',  label: 'أشعة جانبية' },
      { type: 'cbct',     label: 'CBCT' },
    ],
  },
};

const L = {
  en: {
    dir: 'ltr',
    reportTitle:       'Medical File',
    reportDate:        'Report Date',
    patientName:       'Patient Name',
    phone:             'Phone',
    age:               'Age',
    address:           'Address',
    years:             'y/o',
    currency:          'EGP',
    diagnosisSection:  '🩺 Diagnosis & Treatment Plan',
    diagnosis:         'Diagnosis',
    treatmentPlan:     'Treatment Plan',
    treatmentStages:   'Treatment Stages',
    instructions:      'Instructions',
    treatmentNotes:    'Treatment Notes',
    photosSection:     '📸 Patient Photographs',
    extraoral:         'Extra-Oral Photos',
    intraoral:         'Intra-Oral Photos',
    radiographs:       'Radiographs',
    sessionTitle:      (n, d) => `📋 Session #${n} — ${d}`,
    sessionNotes:      'Session Notes',
    nextStep:          'Next Step',
    nextAppointment:   'Next Appointment',
    amountPaid:        'Amount Paid',
    sessionPhotos:     'Session Photos',
    financialSection:  '💰 Financial Summary',
    totalCost:         'Total Treatment Cost',
    totalPaid:         'Total Paid',
    remaining:         'Remaining',
    accountStatus:     'Account Status',
    statusMap:         { paid: 'Paid', partial: 'Partial', overdue: 'Overdue', pending: 'Pending' },
    penNote:           '✎ Pen Note',
    dateFormat:        (d) => format(d, 'd MMMM yyyy'),
  },
  ar: {
    dir: 'ltr',
    reportTitle:       'الملف الطبي',
    reportDate:        'تاريخ التقرير',
    patientName:       'اسم المريض',
    phone:             'رقم الجوال',
    age:               'سنة',
    address:           'العنوان',
    years:             'سنة',
    currency:          'ج.م',
    diagnosisSection:  '🩺 التشخيص وخطة العلاج',
    diagnosis:         'التشخيص',
    treatmentPlan:     'خطة العلاج',
    treatmentStages:   'مراحل العلاج',
    instructions:      'التعليمات',
    treatmentNotes:    'ملاحظات العلاج',
    photosSection:     '📸 صور المريض',
    extraoral:         'صور خارج الفم',
    intraoral:         'صور داخل الفم',
    radiographs:       'الأشعة',
    sessionTitle:      (n, d) => `📋 جلسة #${n} — ${d}`,
    sessionNotes:      'ملاحظات الجلسة',
    nextStep:          'الخطوة القادمة',
    nextAppointment:   'موعد المتابعة',
    amountPaid:        'المبلغ المدفوع',
    sessionPhotos:     'صور الجلسة',
    financialSection:  '💰 البيانات المالية',
    totalCost:         'إجمالي تكلفة العلاج',
    totalPaid:         'إجمالي المدفوع',
    remaining:         'المتبقي',
    accountStatus:     'حالة الحساب',
    statusMap:         { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' },
    penNote:           '✎ نوت القلم',
    dateFormat:        (d) => format(d, 'd MMMM yyyy', { locale: ar }),
  },
};

function buildHTML({ patient, sessions, ttt, siteInfo, opts, imgMap }) {
  const lang           = opts.lang || 'en';
  const t              = L[lang];
  const slots          = SLOTS[lang];
  const clinicName     = siteInfo?.clinicName || 'عيادة د. وسام يوسف';
  const clinicSubtitle = siteInfo?.clinicSubtitle || 'أخصائي تقويم الأسنان — بني مزار، المنيا';
  const clinicPhone    = siteInfo?.phone || '+20 115 679 8324';
  const patientName    = patient.fullName || '';
  const generated      = t.dateFormat(new Date());
  const fin            = patient.financials || {};

  const o = {
    includeTTT: true,
    includePhotos: true,
    includeFacePhotos: true,
    includeIntraOralPhotos: true,
    includeXrays: true,
    includeSessions: true,
    includeSessionImages: true,
    includeFinancials: false,
    includeClinicHeader: true,
    includePatientCard: true,
    includeDiagnosis: true,
    includeTTTObjectives: true,
    includeTTTBolton: true,
    includeTTTSpace: true,
    ...opts,
  };

  const imgTag = (url, style = '') => {
    const src = imgMap[url] || url;
    return `<img src="${src}" style="max-width:100%;height:auto;border-radius:6px;border:1px solid #e2e8f0;${style}" onerror="this.style.display='none'" />`;
  };

  const sectionTitle = (txt) => `<div class="sec-title">${txt}</div>`;

  const slotGrid = (slotDefs, images) => slotDefs.map(slot => {
    const imgs = images.filter(i => i.type === slot.type);
    if (!imgs.length) return '';
    return `<div class="img-slot">
      ${imgs.map(i => `
        <div style="margin-bottom:6px;text-align:center">
          ${imgTag(i.url, 'width:220px;display:block;margin:0 auto')}
          ${i.notes ? `<div style="font-size:9px;color:#475569;margin-top:1px">${i.notes}</div>` : ''}
          ${i.penNote ? `<div style="margin-top:5px;text-align:center"><div style="font-size:8px;color:#2563eb;font-weight:700;margin-bottom:2px">${t.penNote}</div><img src="${i.penNote}" style="max-width:100%;border-radius:3px;border:1px solid #bfdbfe;display:block;margin:0 auto" onerror="this.style.display='none'"/></div>` : ''}
        </div>
      `).join('')}
    </div>`;
  }).join('');

  const diagnosisSection = () => {
    if (!o.includeDiagnosis) return '';
    const hasAny = patient.diagnosis || patient.treatmentPlan || patient.treatmentStages || patient.instructions || patient.treatmentNotes;
    if (!hasAny) return '';
    return `
      <div class="page-break">
        ${sectionTitle(t.diagnosisSection)}
        <table class="ttt-table">
          ${patient.diagnosis      ? `<tr><td class="label">${t.diagnosis}</td><td style="white-space:pre-wrap">${patient.diagnosis}</td></tr>` : ''}
          ${patient.treatmentPlan  ? `<tr><td class="label">${t.treatmentPlan}</td><td style="white-space:pre-wrap">${patient.treatmentPlan}</td></tr>` : ''}
          ${patient.treatmentStages? `<tr><td class="label">${t.treatmentStages}</td><td style="white-space:pre-wrap">${patient.treatmentStages}</td></tr>` : ''}
          ${patient.instructions   ? `<tr><td class="label">${t.instructions}</td><td style="white-space:pre-wrap">${patient.instructions}</td></tr>` : ''}
          ${patient.treatmentNotes ? `<tr><td class="label">${t.treatmentNotes}</td><td style="white-space:pre-wrap">${patient.treatmentNotes}</td></tr>` : ''}
        </table>
      </div>`;
  };

  const tttSection = () => {
    if (!o.includeTTT || !ttt) return '';
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

        ${o.includeTTTObjectives ? `
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
        </table>` : ''}

        ${o.includeTTTBolton ? `
        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="2" class="th-head">Bolton Analysis</th></tr>
          <tr><td class="label">Anterior Ratio (%)</td><td>${v('boltonAnterior') || '—'}</td></tr>
          <tr><td class="label">Overall Ratio (%)</td><td>${v('boltonOverall') || '—'}</td></tr>
        </table>` : ''}

        ${o.includeTTTSpace ? `
        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="4" class="th-head">Tooth Size &amp; Arch Length Analysis</th></tr>
          <tr><th></th><th>Total Arch Length</th><th>Total Tooth Size</th><th>Discrepancy</th></tr>
          <tr><td class="label">Upper</td><td>${v('upperArchLength') || '—'}</td><td>${v('upperToothSize') || '—'}</td><td>${v('upperDiscrepancy') || '—'}</td></tr>
          <tr><td class="label">Lower</td><td>${v('lowerArchLength') || '—'}</td><td>${v('lowerToothSize') || '—'}</td><td>${v('lowerDiscrepancy') || '—'}</td></tr>
        </table>
        <table class="ttt-table" style="margin-top:16px">
          <tr><th colspan="2" class="th-head">Summary of Space Requirements</th></tr>
          <tr><td class="label">Crowding &amp; Spacing</td><td>${v('srCrowding') || '—'}</td></tr>
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
        </div>` : ''}
      </div>`;
  };

  const photosSection = () => {
    if (!o.includePhotos) return '';
    const faceImgs  = o.includeFacePhotos      ? (patient.faceImages || [])     : [];
    const intraImgs = o.includeIntraOralPhotos ? (patient.intraOralImages || []) : [];
    const xrayImgs  = o.includeXrays           ? (patient.xrays || [])          : [];
    if (!faceImgs.length && !intraImgs.length && !xrayImgs.length) return '';

    const xrayGrid = slots.xray.map(slot => {
      const imgs = xrayImgs.filter(i => i.type === slot.type);
      if (!imgs.length) return '';
      return `<div class="img-slot">
        ${imgs.map(i => `
          <div style="margin-bottom:6px;text-align:center">
            ${imgTag(i.url, 'width:280px;display:block;margin:0 auto')}
          </div>
        `).join('')}
      </div>`;
    }).join('');

    return `
      <div class="page-break">
        ${sectionTitle(t.photosSection)}
        ${faceImgs.length  ? `<div class="subsec">${t.extraoral}</div><div class="img-grid">${slotGrid(slots.face, faceImgs)}</div>` : ''}
        ${intraImgs.length ? `<div class="subsec">${t.intraoral}</div><div class="img-grid">${slotGrid(slots.intraoral, intraImgs)}</div>` : ''}
        ${xrayImgs.length  ? `<div class="subsec">${t.radiographs}</div><div class="img-grid">${xrayGrid}</div>` : ''}
      </div>`;
  };

  const sessionsSection = () => {
    if (!o.includeSessions) return '';
    let toShow = sessions;
    if (opts.sessionIds && opts.sessionIds.length > 0) {
      toShow = sessions.filter(s => opts.sessionIds.includes(s._id));
    } else if (opts.sessionId) {
      toShow = sessions.filter(s => s._id === opts.sessionId);
    }
    if (!toShow.length) return '';

    return toShow.map((s, i) => {
      const imgs    = o.includeSessionImages ? (s.images || []) : [];
      const dateStr = t.dateFormat(new Date(s.sessionDate));
      return `
        <div class="page-break">
          ${sectionTitle(t.sessionTitle(s.sessionNumber || i + 1, dateStr))}
          ${s.notes           ? `<div class="field-row"><span class="fl">${t.sessionNotes}:</span><span class="fv">${s.notes}</span></div>` : ''}
          ${s.nextStep        ? `<div class="field-row"><span class="fl">${t.nextStep}:</span><span class="fv">${s.nextStep}</span></div>` : ''}
          ${s.nextAppointment ? `<div class="field-row"><span class="fl">${t.nextAppointment}:</span><span class="fv">${t.dateFormat(new Date(s.nextAppointment))}</span></div>` : ''}
          ${s.amountPaid > 0  ? `<div class="field-row"><span class="fl">${t.amountPaid}:</span><span class="fv" style="color:#10b981;font-weight:700">${s.amountPaid.toLocaleString()} ${t.currency}</span></div>` : ''}
          ${imgs.length ? `
            <div class="subsec" style="margin-top:12px">${t.sessionPhotos}</div>
            <div class="img-grid">${slots.session.map(slot => {
              const slotImgs = imgs.filter(im => im.type === slot.type);
              if (!slotImgs.length) return '';
              return `<div class="img-slot">
                ${slotImgs.map(im => `
                  <div style="margin-bottom:6px;text-align:center">
                    ${imgTag(im.url, 'width:200px;display:block;margin:0 auto')}
                    ${im.notes ? `<div style="font-size:9px;color:#475569;margin-top:2px;padding:0 4px">${im.notes}</div>` : ''}
                    ${im.penNote ? `<div style="margin-top:5px;text-align:center"><div style="font-size:8px;color:#2563eb;font-weight:700;margin-bottom:2px">${t.penNote}</div><img src="${im.penNote}" style="max-width:100%;border-radius:3px;border:1px solid #bfdbfe;display:block;margin:0 auto" onerror="this.style.display='none'"/></div>` : ''}
                  </div>
                `).join('')}
              </div>`;
            }).join('')}</div>` : ''}
        </div>`;
    }).join('');
  };

  const financialSection = () => {
    if (!o.includeFinancials) return '';
    return `
      <div class="page-break">
        ${sectionTitle(t.financialSection)}
        <table class="ttt-table">
          <tr><td class="label">${t.totalCost}</td><td><strong>${(fin.totalCost || 0).toLocaleString()} ${t.currency}</strong></td></tr>
          <tr><td class="label">${t.totalPaid}</td><td style="color:#10b981;font-weight:700">${(fin.totalPaid || 0).toLocaleString()} ${t.currency}</td></tr>
          <tr><td class="label">${t.remaining}</td><td style="color:#ef4444;font-weight:700">${(fin.remaining || 0).toLocaleString()} ${t.currency}</td></tr>
          <tr><td class="label">${t.accountStatus}</td><td>${t.statusMap[fin.status] || '—'}</td></tr>
        </table>
      </div>`;
  };

  const fontLink = lang === 'ar'
    ? `<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>`
    : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet"/>`;
  const fontFamily = lang === 'ar' ? "'Cairo',Arial,sans-serif" : "'Inter',Arial,sans-serif";

  return `<!DOCTYPE html>
<html dir="ltr" lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${t.reportTitle} — ${patientName}</title>
  ${fontLink}
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:${fontFamily}; color:#0f172a; background:white; direction:ltr; font-size:13px; line-height:1.6; }
    .page { max-width:210mm; margin:0 auto; padding:14mm 16mm 20mm; }
    @media print {
      body { font-size:11px; }
      .no-print { display:none !important; }
      .page-break { page-break-inside:avoid; break-inside:avoid; }
      @page { margin:12mm 10mm; size:A4; }
    }
    .clinic-header { display:flex; align-items:center; gap:18px; padding-bottom:16px; border-bottom:3px solid #2563eb; margin-bottom:20px; }
    .clinic-logo { width:72px; height:72px; object-fit:contain; border-radius:12px; }
    .clinic-info h1 { font-size:20px; font-weight:900; color:#1e3a8a; }
    .clinic-info p { font-size:12px; color:#64748b; margin-top:2px; }
    .patient-card { background:#eff6ff; border-radius:10px; padding:14px 18px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; border:1px solid #bfdbfe; }
    .patient-card .pf { font-size:11px; color:#64748b; }
    .patient-card .pv { font-weight:700; color:#1e293b; font-size:13px; }
    .sec-title { font-size:15px; font-weight:900; color:#1e40af; border-left:4px solid #2563eb; padding-left:10px; margin:18px 0 12px; text-align:left; }
    .subsec { font-size:12px; font-weight:700; color:#475569; margin:10px 0 6px; text-align:left; }
    .ttt-table { width:100%; border-collapse:collapse; font-size:12px; }
    .ttt-table td, .ttt-table th { border:1px solid #e2e8f0; padding:7px 10px; text-align:left; }
    .ttt-table .label { background:#f8fafc; font-weight:700; color:#334155; width:38%; text-align:left; }
    .ttt-table .th-head { background:#1e3a8a; color:white; font-weight:900; font-size:13px; text-align:center; }
    .img-grid { display:flex; flex-wrap:wrap; gap:12px; margin:8px 0; justify-content:flex-start; }
    .img-slot { display:flex; flex-direction:column; align-items:center; }
    .slot-label { font-size:10px; font-weight:700; color:#334155; margin-bottom:4px; font-family:monospace; text-align:center; }
    .field-row { display:flex; gap:12px; margin-bottom:8px; align-items:flex-start; text-align:left; }
    .fl { font-weight:700; color:#334155; min-width:160px; font-size:12px; text-align:left; }
    .fv { color:#475569; font-size:12px; flex:1; text-align:left; }
    .page-break { margin-bottom:28px; padding-bottom:8px; }
    .footer { margin-top:30px; padding-top:12px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:11px; }
    .print-toolbar { position:fixed; top:0; left:0; right:0; background:#1e3a8a; color:white; padding:10px 20px; display:flex; align-items:center; justify-content:space-between; z-index:9999; font-family:${fontFamily}; direction:ltr; }
    .print-toolbar button { background:#2563eb; color:white; border:none; border-radius:8px; padding:8px 20px; font-size:14px; font-weight:700; cursor:pointer; }
    body { padding-top: 50px; }
  </style>
</head>
<body>
  <div class="print-toolbar no-print">
    <span style="font-weight:700;font-size:15px">📄 ${t.reportTitle} — ${patientName}</span>
  </div>
  <div class="page">
    ${o.includeClinicHeader ? `
    <div class="clinic-header">
      <img src="/logo.png" class="clinic-logo" onerror="this.style.display='none'" />
      <div class="clinic-info">
        <h1>${clinicName}</h1>
        <p>${clinicSubtitle}</p>
        <p>📞 ${clinicPhone}</p>
      </div>
      <div style="margin-left:auto;text-align:right;font-size:11px;color:#94a3b8">
        <div>${t.reportDate}: ${generated}</div>
      </div>
    </div>` : ''}

    ${o.includePatientCard ? `
    <div class="patient-card">
      <div><div class="pf">${t.patientName}</div><div class="pv">${patient.fullName || '—'}</div></div>
      <div><div class="pf">${t.phone}</div><div class="pv" style="direction:ltr">${patient.phone || '—'}</div></div>
      ${patient.age ? `<div><div class="pf">${lang === 'ar' ? 'العمر' : 'Age'}</div><div class="pv">${patient.age} ${t.years}</div></div>` : '<div></div>'}
      ${patient.address ? `<div><div class="pf">${t.address}</div><div class="pv">${patient.address}</div></div>` : ''}
    </div>` : ''}

    ${photosSection()}
    ${tttSection()}
    ${diagnosisSection()}
    ${sessionsSection()}
    ${financialSection()}

    <div class="footer">
      ${clinicName} — ${clinicSubtitle} — ${clinicPhone}
    </div>
  </div>
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
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  return { blobUrl, html };
}
