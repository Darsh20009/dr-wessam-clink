import PptxGenJS from 'pptxgenjs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/** Prepend RTL-embedding mark so Arabic text renders correctly in PowerPoint */
const rtlStr = (s) => /[\u0600-\u06FF]/.test(s || '') ? '\u202B' + s : (s || '');

/** Always prepend RTL-embedding mark — for names (clinic/patient) so they ALWAYS render right-to-left regardless of language */
const nameRtl = (s) => '\u202B' + (s || '');

/* ─── Color palette ─────────────────────────────────────── */
const C = {
  navy:    '0f2d6e',
  blue:    '1d4ed8',
  lblue:   '3b82f6',
  sky:     'bfdbfe',
  white:   'FFFFFF',
  offwhite:'f8fafc',
  silver:  'e2e8f0',
  mid:     '94a3b8',
  dark:    '1e293b',
  gray:    '475569',
  lgray:   'f1f5f9',
  teal:    '0d9488',
  accent:  '06b6d4',
};

/* ─── Bilingual labels (mirrors exportPDF.js) ────────────── */
const SLOTS = {
  en: {
    session:   [
      { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
      { type: 'right_lateral',     label: 'Right Lateral' },
      { type: 'left_lateral',      label: 'Left Lateral' },
      { type: 'upper_jaw',         label: 'Upper Jaw' },
      { type: 'lower_jaw',         label: 'Lower Jaw' },
    ],
    face: [
      { type: 'frontal_rest',   label: 'Frontal — Rest' },
      { type: 'frontal_smile',  label: 'Frontal — Smile' },
      { type: 'lateral',        label: 'Lateral — Rest' },
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
    session:   [
      { type: 'frontal_occlusion', label: 'إطباق أمامي' },
      { type: 'right_lateral',     label: 'جانبي أيمن' },
      { type: 'left_lateral',      label: 'جانبي أيسر' },
      { type: 'upper_jaw',         label: 'الفك العلوي' },
      { type: 'lower_jaw',         label: 'الفك السفلي' },
    ],
    face: [
      { type: 'frontal_rest',   label: 'أمامي — راحة' },
      { type: 'frontal_smile',  label: 'أمامي — ابتسامة' },
      { type: 'lateral',        label: 'جانبي — راحة' },
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
    isRtl:          false,
    reportTitle:    'Medical File',
    reportDate:     'Report Date',
    patientInfo:    'Patient Information',
    patientName:    'Patient Name',
    phone:          'Phone',
    age:            'Age',
    address:        'Address',
    patientId:      'Patient ID',
    years:          'y/o',
    currency:       'EGP',
    diagnosisTitle: 'Diagnosis & Treatment Plan',
    diagnosis:      'Diagnosis',
    treatmentPlan:  'Treatment Plan',
    treatmentStages:'Treatment Stages',
    instructions:   'Instructions',
    treatmentNotes: 'Treatment Notes',
    extraoral:      'Extra-Oral Photographs',
    intraoral:      'Intra-Oral Photographs',
    radiographs:    'Radiographs',
    sessionTitle:   (n, d) => `Session #${n}  —  ${d}`,
    sessionPhotosTitle: (n, d) => `Session #${n} Photos`,
    sessionNotes:   'Session Notes',
    nextStep:       'Next Step',
    amountPaid:     'Amount Paid',
    financialTitle: 'Financial Summary',
    totalCost:      'Total Treatment Cost',
    totalPaid:      'Total Paid',
    remaining:      'Remaining',
    accountStatus:  'Account Status',
    statusMap:      { paid: 'Paid', partial: 'Partial', overdue: 'Overdue', pending: 'Pending' },
    notes:          'Notes',
    dateFormat:     (d) => format(d, 'd MMMM yyyy'),
  },
  ar: {
    isRtl:          true,
    reportTitle:    'الملف الطبي',
    reportDate:     'تاريخ التقرير',
    patientInfo:    'بيانات المريض',
    patientName:    'الاسم الكامل',
    phone:          'رقم الجوال',
    age:            'العمر',
    address:        'العنوان',
    patientId:      'رقم المريض',
    years:          'سنة',
    currency:       'ج.م',
    diagnosisTitle: 'التشخيص وخطة العلاج',
    diagnosis:      'التشخيص',
    treatmentPlan:  'خطة العلاج',
    treatmentStages:'مراحل العلاج',
    instructions:   'التعليمات',
    treatmentNotes: 'ملاحظات العلاج',
    extraoral:      'صور خارج الفم — Extraoral',
    intraoral:      'صور داخل الفم — Intraoral',
    radiographs:    'الأشعة التشخيصية',
    sessionTitle:   (n, d) => `جلسة #${n}  —  ${d}`,
    sessionPhotosTitle: (n) => `صور الجلسة #${n}`,
    sessionNotes:   'ملاحظات الجلسة',
    nextStep:       'الخطوة القادمة',
    amountPaid:     'المبلغ المدفوع',
    financialTitle: 'البيانات المالية',
    totalCost:      'إجمالي تكلفة العلاج',
    totalPaid:      'إجمالي المدفوع',
    remaining:      'المتبقي',
    accountStatus:  'حالة الحساب',
    statusMap:      { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' },
    notes:          'ملاحظات',
    dateFormat:     (d) => format(d, 'd MMMM yyyy', { locale: ar }),
  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function slotLabel(type, category, lang) {
  const list = SLOTS[lang]?.[category] || [];
  return list.find(s => s.type === type)?.label || type?.replace(/_/g, ' ') || '';
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function toBase64(url, quality = 0.96) {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const ratio = img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 0.75;
        resolve({ data: c.toDataURL('image/jpeg', quality), ratio });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });
}

async function getDimsFromBase64(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth > 0 ? img.naturalHeight / img.naturalWidth : 0.75;
      resolve({ data: dataUrl, ratio });
    };
    img.onerror = () => resolve({ data: dataUrl, ratio: 0.75 });
    img.src = dataUrl;
  });
}

/* ─── Slide building blocks ──────────────────────────────── */
function addHeaderBar(slide, clinicName, subtitle, isRtl) {
  // Navy gradient bar
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: C.navy } });
  // Accent stripe
  slide.addShape('rect', { x: 0, y: 0.65, w: '100%', h: 0.06, fill: { color: C.lblue } });

  const align = isRtl ? 'right' : 'left';
  const xName = 0.3;
  const wName = 8.5;

  slide.addText(nameRtl(clinicName), {
    x: xName, y: 0.07, w: wName, h: 0.32,
    fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri',
    align, rtlMode: true,
  });
  if (subtitle) {
    slide.addText(nameRtl(subtitle), {
      x: xName, y: 0.36, w: wName, h: 0.22,
      fontSize: 9, color: C.sky, fontFace: 'Calibri',
      align, rtlMode: true,
    });
  }
}

function addSectionTitle(slide, title, isRtl) {
  slide.addShape('rect', { x: 0, y: 0.71, w: '100%', h: 0.5, fill: { color: C.lgray } });
  slide.addShape('rect', { x: isRtl ? 12.8 : 0, y: 0.71, w: 0.16, h: 0.5, fill: { color: C.lblue } });
  slide.addText(rtlStr(title), {
    x: 0.3, y: 0.74, w: 12.7, h: 0.42,
    fontSize: 14, bold: true, color: C.navy, fontFace: 'Calibri',
    align: isRtl ? 'right' : 'left', rtlMode: true,
  });
}

function addInfoRow(slide, label, value, y, isRtl, shade) {
  if (!value) return;
  slide.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.36, fill: { color: shade ? C.lgray : C.offwhite }, line: { color: C.silver, width: 0.3 } });
  if (isRtl) {
    slide.addText(rtlStr(label),        { x: 9.5, y: y + 0.05, w: 3.2, h: 0.26, fontSize: 10, bold: true, color: C.navy, fontFace: 'Calibri', align: 'right', rtlMode: true });
    slide.addText(rtlStr(String(value)),{ x: 0.4, y: y + 0.05, w: 9.0, h: 0.26, fontSize: 10, color: C.dark, fontFace: 'Calibri', align: 'right', rtlMode: true });
  } else {
    slide.addText(rtlStr(label),        { x: 0.4, y: y + 0.05, w: 3.2, h: 0.26, fontSize: 10, bold: true, color: C.navy, fontFace: 'Calibri', align: 'left', rtlMode: true });
    slide.addText(rtlStr(String(value)),{ x: 3.8, y: y + 0.05, w: 9.0, h: 0.26, fontSize: 10, color: C.dark, fontFace: 'Calibri', align: 'left', rtlMode: true });
  }
}

/* ─── Image grid with notes below each image ─────────────── */
async function buildImageGrid(slide, images, startY, totalW, totalH, isRtl) {
  const valid = images.filter(i => i.base64);
  if (!valid.length) return;

  const cols  = Math.min(valid.length, 3);
  const rows  = Math.ceil(valid.length / cols);
  const pad   = 0.1;
  const cellW = totalW / cols;
  const cellH = totalH / rows;

  for (let i = 0; i < valid.length; i++) {
    const { base64, ratio = 0.75, label, notes } = valid[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x   = 0.15 + col * cellW + pad;
    const y   = startY + row * cellH + pad;
    const iW  = cellW - pad * 2;

    // Dynamic note height based on text length
    const noteText = stripHtml(notes || '');
    const noteH    = noteText ? Math.min(0.9, 0.18 + Math.ceil(noteText.length / 55) * 0.2) : 0;
    const labelH   = label ? 0.24 : 0;
    const imgAreaH = Math.max(0.5, cellH - noteH - labelH - pad * 2);

    // ── Maintain natural aspect ratio (contain) ──────────────
    // ratio = naturalHeight / naturalWidth
    let dispW = iW;
    let dispH = iW * ratio;
    if (dispH > imgAreaH) {
      dispH = imgAreaH;
      dispW = imgAreaH / ratio;
    }
    const imgX = x + (iW - dispW) / 2;
    const imgY = y + (imgAreaH - dispH) / 2;

    // Frame background
    slide.addShape('rect', { x, y, w: iW, h: imgAreaH, fill: { color: C.lgray }, line: { color: C.silver, width: 0.5 } });

    try {
      slide.addImage({ data: base64, x: imgX, y: imgY, w: dispW, h: dispH });
    } catch {}

    // Type label
    if (label) {
      slide.addShape('rect', { x, y: y + imgAreaH, w: iW, h: labelH, fill: { color: C.navy } });
      slide.addText(label, {
        x, y: y + imgAreaH + 0.02, w: iW, h: labelH - 0.04,
        fontSize: 8, bold: true, color: C.white, fontFace: 'Calibri',
        align: 'center',
      });
    }

    // Notes text
    if (noteText) {
      const noteY = y + imgAreaH + labelH;
      slide.addShape('rect', { x, y: noteY, w: iW, h: noteH, fill: { color: 'fffbeb' }, line: { color: 'fde68a', width: 0.4 } });
      slide.addText(noteText, {
        x: x + 0.05, y: noteY + 0.03, w: iW - 0.1, h: noteH - 0.05,
        fontSize: 7, color: '78350f', fontFace: 'Calibri',
        align: isRtl ? 'right' : 'left', rtlMode: isRtl,
        wrap: true, valign: 'top', shrinkText: true,
      });
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT FUNCTION
═══════════════════════════════════════════════════════════ */
export async function exportPatientPPTX({ patient, sessions = [], ttt = {}, siteInfo = {}, opts = {} }) {
  const o = {
    lang: 'en',
    includeClinicHeader: true,
    includePatientCard: true,
    includeDiagnosis: true,
    includeTTT: true,
    includeTTTObjectives: true,
    includeTTTBolton: true,
    includeTTTSpace: true,
    includePhotos: true,
    includeFacePhotos: true,
    includeIntraOralPhotos: true,
    includeXrays: true,
    includeSessions: true,
    includeSessionImages: true,
    includeFinancials: false,
    sessionIds: [],
    ...opts,
  };

  const lang  = o.lang || 'en';
  const t     = L[lang];
  const isRtl = t.isRtl;

  const clinicName  = siteInfo?.clinicName      || 'عيادة د. وسام يوسف';
  const clinicSub   = siteInfo?.clinicSubtitle  || (lang === 'en' ? 'Orthodontic Specialist — Beni Mazar, Minya' : 'أخصائي تقويم الأسنان — بني مزار، المنيا');
  const clinicPhone = siteInfo?.phone           || '+20 115 679 8324';
  const fin         = patient.financials        || {};
  const today       = t.dateFormat(new Date());

  const filteredSessions = sessions
    .filter(s => !o.sessionIds?.length || o.sessionIds.includes(s._id))
    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

  const pptx    = new PptxGenJS();
  pptx.layout   = 'LAYOUT_WIDE';
  pptx.author   = clinicName;
  pptx.subject  = `${t.reportTitle} — ${patient.fullName}`;
  pptx.rtlMode  = isRtl;

  const align   = isRtl ? 'right' : 'left';
  const rtl     = isRtl;

  /* ══════════════════════════════════════
     SLIDE 1 — Cover
  ══════════════════════════════════════ */
  {
    const s = pptx.addSlide();
    // Full navy background
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.navy } });
    // Decorative horizontal bands
    s.addShape('rect', { x: 0, y: 4.8, w: '100%', h: 0.08, fill: { color: C.lblue } });
    s.addShape('rect', { x: 0, y: 4.88, w: '100%', h: 2.72, fill: { color: '0a1f4e' } });
    // Left accent bar
    s.addShape('rect', { x: 0, y: 0, w: 0.28, h: '100%', fill: { color: C.lblue } });

    if (o.includeClinicHeader) {
      s.addText(nameRtl(clinicName), {
        x: 0.6, y: 1.0, w: 12, h: 0.8,
        fontSize: 38, bold: true, color: C.white, fontFace: 'Calibri',
        align: 'center', rtlMode: true,
      });
      s.addText(nameRtl(clinicSub), {
        x: 0.6, y: 1.88, w: 12, h: 0.45,
        fontSize: 16, color: C.sky, fontFace: 'Calibri',
        align: 'center', rtlMode: true,
      });
      s.addShape('line', { x: 2.5, y: 2.55, w: 8.3, h: 0, line: { color: C.sky, width: 0.8 } });
    }

    // Patient name block
    s.addText(nameRtl(patient.fullName || ''), {
      x: 0.6, y: 5.05, w: 12, h: 0.68,
      fontSize: 30, bold: true, color: C.white, fontFace: 'Calibri',
      align: 'center', rtlMode: true,
    });
    s.addText(rtlStr(t.reportTitle), {
      x: 0.6, y: 5.75, w: 12, h: 0.38,
      fontSize: 15, color: C.sky, fontFace: 'Calibri',
      align: 'center', rtlMode: true,
    });
    s.addText(`${t.reportDate}: ${today}`, {
      x: 0.6, y: 6.85, w: 12, h: 0.28,
      fontSize: 11, color: C.mid, fontFace: 'Calibri',
      align: 'center',
    });
    s.addText(clinicPhone, {
      x: 0.6, y: 7.18, w: 12, h: 0.26,
      fontSize: 11, color: C.mid, fontFace: 'Calibri',
      align: 'center',
    });
  }

  /* ══════════════════════════════════════
     SLIDE 2 — Patient Information
  ══════════════════════════════════════ */
  if (o.includePatientCard) {
    const s = pptx.addSlide();
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
    addHeaderBar(s, clinicName, clinicSub, isRtl);
    addSectionTitle(s, `👤  ${t.patientInfo}`, isRtl);

    const age = patient.dateOfBirth
      ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000) + ' ' + t.years
      : patient.age ? patient.age + ' ' + t.years : '';

    const rows = [
      [t.patientName,  nameRtl(patient.fullName)],
      [t.phone,        patient.phone],
      [t.age,          age],
      [t.address,      patient.address],
      [t.patientId,    patient.patientId],
    ];
    let y = 1.32;
    rows.forEach(([lbl, val], i) => {
      if (!val) return;
      addInfoRow(s, lbl, val, y, isRtl, i % 2 === 0);
      y += 0.42;
    });
  }

  /* ══════════════════════════════════════
     Photo helper — one slide per section
  ══════════════════════════════════════ */
  const photoSlide = async (imgArr, sectionTitle, category) => {
    const imgs = await Promise.all(
      imgArr.map(async img => {
        const result = img.penNote
          ? await getDimsFromBase64(img.penNote)
          : await toBase64(img.url);
        return {
          base64: result?.data || null,
          ratio:  result?.ratio || 0.75,
          label:  slotLabel(img.type, category, lang),
          notes:  img.notes || '',
        };
      })
    );
    const valid = imgs.filter(i => i.base64);
    if (!valid.length) return;

    const s = pptx.addSlide();
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
    addHeaderBar(s, clinicName, clinicSub, isRtl);
    addSectionTitle(s, `📸  ${sectionTitle}`, isRtl);
    await buildImageGrid(s, valid, 1.28, 12.9, 6.3, isRtl);
  };

  if (o.includePhotos) {
    if (o.includeFacePhotos && (patient.faceImages || []).length)
      await photoSlide(patient.faceImages, t.extraoral, 'face');
    if (o.includeIntraOralPhotos && (patient.intraOralImages || []).length)
      await photoSlide(patient.intraOralImages, t.intraoral, 'intraoral');
    if (o.includeXrays && (patient.xrays || []).length)
      await photoSlide(patient.xrays, t.radiographs, 'xray');
  }

  /* ══════════════════════════════════════
     TTT FILE SLIDES
  ══════════════════════════════════════ */
  if (o.includeTTT && ttt && Object.keys(ttt).length > 0) {
    const v  = (k) => ttt[k] ? String(ttt[k]) : '';
    const chk = (k) => (ttt[k] ? '✓' : '☐');

    /* Helper: add a 2-column table row on a slide */
    const addRow = (slide, label, value, y, shade) => {
      if (!value) return;
      slide.addShape('rect', { x: 0.3, y, w: 4.5, h: 0.34, fill: { color: shade ? C.lgray : C.offwhite }, line: { color: C.silver, width: 0.3 } });
      slide.addShape('rect', { x: 4.8, y, w: 8.1, h: 0.34, fill: { color: shade ? 'f0f9ff' : C.white   }, line: { color: C.silver, width: 0.3 } });
      slide.addText(label, { x: 0.35, y: y + 0.06, w: 4.4,  h: 0.24, fontSize: 9,  bold: true, color: C.navy, fontFace: 'Calibri', wrap: true });
      slide.addText(value, { x: 4.85, y: y + 0.06, w: 7.95, h: 0.24, fontSize: 9,  color: C.dark, fontFace: 'Calibri', wrap: true, shrinkText: true });
    };

    const addSectionHead = (slide, title, y) => {
      slide.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.3, fill: { color: C.navy } });
      slide.addText(title, { x: 0.4, y: y + 0.04, w: 12.4, h: 0.22, fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri' });
    };

    /* ── Slide A: Problem List ── */
    {
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, '📋  TTT FILE — Problem List', isRtl);

      let y = 1.32;
      addSectionHead(s, 'Problem List', y); y += 0.34;
      [
        ['1. OH',                    v('oh')],
        ['2. Skeletal — AP',         v('skeletalAP')],
        ['Skeletal — V (Vertical)',  v('skeletalV')],
        ['Skeletal — T (Transverse)',v('skeletalT')],
        ['3. Dental — AP',           v('dentalAP')],
        ['Dental — V',               v('dentalV')],
        ['Dental — T',               v('dentalT')],
        ['4. S.T',                   v('st')],
        ['5. Habit',                 v('habit')],
      ].forEach(([lbl, val], i) => { addRow(s, lbl, val || '—', y, i % 2 === 0); y += 0.36; });
    }

    /* ── Slide B: TTT Objectives ── */
    if (o.includeTTTObjectives) {
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, '🎯  TTT Objectives', isRtl);

      let y = 1.32;
      addSectionHead(s, 'TTT Objectives', y); y += 0.34;
      [
        ['1. OH',                    v('obj1') || '—'],
        ['2. Skeletal',              v('obj2') || '—'],
        ['3. Align & Level',         v('obj3') || 'Align and level both arches.'],
        ['4. OJ',                    v('obj4') || 'Maintain/ Correct OJ.'],
        ['5. OB',                    v('obj5') || 'Maintain/ Correct OB.'],
        ['6. Midline',               v('obj6') || 'Maintain/ Correct Midline'],
        ['7. Canine / Incisors',     v('obj7') || 'Achieve Class I Canine and Incisors.'],
        ['8. Molar Relationship',    v('obj8') || 'Achieve Class I Molar Relationship'],
        ['9. Buccal Interdigitation',v('obj9') || 'Coordinate both arches with good Buccal Interdigitation.'],
        ['10. Retention',            v('obj10') || 'Retention.'],
      ].forEach(([lbl, val], i) => { addRow(s, lbl, val, y, i % 2 === 0); y += 0.36; });
    }

    /* ── Slide C: Bolton + Space Analysis ── */
    if (o.includeTTTBolton || o.includeTTTSpace) {
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, '📐  Bolton Analysis & Space Requirements', isRtl);
      let y = 1.32;

      if (o.includeTTTBolton) {
        addSectionHead(s, 'Bolton Analysis', y); y += 0.34;
        addRow(s, 'Anterior Ratio (%)', v('boltonAnterior') || '—', y, true);  y += 0.36;
        addRow(s, 'Overall Ratio (%)',  v('boltonOverall')  || '—', y, false); y += 0.36;
        y += 0.1;
      }

      if (o.includeTTTSpace) {
        addSectionHead(s, 'Tooth Size & Arch Length Analysis', y); y += 0.34;

        // 4-col header
        ['', 'Arch Length', 'Tooth Size', 'Discrepancy'].forEach((h, i) => {
          const xs = [0.3, 3.6, 6.8, 10.0];
          const ws = [3.2, 3.1, 3.1, 2.8];
          s.addShape('rect', { x: xs[i], y, w: ws[i], h: 0.28, fill: { color: C.lblue } });
          s.addText(h, { x: xs[i] + 0.05, y: y + 0.04, w: ws[i] - 0.1, h: 0.2, fontSize: 8.5, bold: true, color: C.white, fontFace: 'Calibri', align: 'center' });
        });
        y += 0.3;

        [['Upper', 'upperArchLength', 'upperToothSize', 'upperDiscrepancy'],
         ['Lower', 'lowerArchLength', 'lowerToothSize', 'lowerDiscrepancy']].forEach(([row, k1, k2, k3], ri) => {
          const bg = ri % 2 === 0 ? C.lgray : C.white;
          [0.3, 3.6, 6.8, 10.0].forEach((x, ci) => {
            const ws = [3.2, 3.1, 3.1, 2.8];
            const vals = [row, v(k1) || '—', v(k2) || '—', v(k3) || '—'];
            s.addShape('rect', { x, y, w: ws[ci], h: 0.3, fill: { color: bg }, line: { color: C.silver, width: 0.3 } });
            s.addText(vals[ci], { x: x + 0.05, y: y + 0.05, w: ws[ci] - 0.1, h: 0.22, fontSize: 9, bold: ci === 0, color: C.dark, fontFace: 'Calibri', align: 'center' });
          });
          y += 0.32;
        });
        y += 0.1;

        addSectionHead(s, 'Summary of Space Requirements', y); y += 0.34;
        [
          ['Crowding & Spacing',            v('srCrowding')           || '—'],
          ['Levelling Occlusal Curve',       v('srLevelling')          || '—'],
          ['Arch Width Change',              v('srArchWidth')          || '—'],
          ['Incisor Sagittal Position',      v('srIncisorSagittal')    || '—'],
          ['Incisor Inclination',            v('srIncisorInclination') || '—'],
        ].forEach(([lbl, val], i) => { addRow(s, lbl, val, y, i % 2 === 0); y += 0.36; });
      }
    }

    /* ── Slide D: Space Gaining ── */
    if (o.includeTTTSpace) {
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, '🦷  Space Gaining Methods', isRtl);

      const addHalfTable = (xOff, wCol, archLabel, checks, fields) => {
        let y = 1.32;
        s.addShape('rect', { x: xOff, y, w: wCol, h: 0.3, fill: { color: C.navy } });
        s.addText(`Space Gaining — ${archLabel}`, { x: xOff + 0.05, y: y + 0.04, w: wCol - 0.1, h: 0.22, fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri' });
        y += 0.32;

        checks.forEach(([key, label], i) => {
          s.addShape('rect', { x: xOff, y, w: wCol, h: 0.3, fill: { color: i % 2 === 0 ? C.lgray : C.offwhite }, line: { color: C.silver, width: 0.3 } });
          s.addText(`${chk(key)}  ${label}`, { x: xOff + 0.08, y: y + 0.05, w: wCol - 0.16, h: 0.22, fontSize: 9, color: C.dark, fontFace: 'Calibri' });
          y += 0.32;
        });
        y += 0.08;
        fields.forEach(([lbl, val], i) => {
          if (!val) return;
          s.addShape('rect', { x: xOff,       y, w: wCol * 0.52, h: 0.3, fill: { color: i % 2 === 0 ? C.lgray : C.offwhite }, line: { color: C.silver, width: 0.3 } });
          s.addShape('rect', { x: xOff + wCol * 0.52, y, w: wCol * 0.48, h: 0.3, fill: { color: i % 2 === 0 ? 'f0f9ff' : C.white }, line: { color: C.silver, width: 0.3 } });
          s.addText(lbl, { x: xOff + 0.05, y: y + 0.05, w: wCol * 0.5, h: 0.22, fontSize: 8.5, bold: true, color: C.navy, fontFace: 'Calibri' });
          s.addText(val, { x: xOff + wCol * 0.54, y: y + 0.05, w: wCol * 0.44, h: 0.22, fontSize: 8.5, color: C.dark, fontFace: 'Calibri', shrinkText: true });
          y += 0.32;
        });
      };

      addHalfTable(0.2, 6.3, 'Upper',
        [['upperArchLengthening', 'Arch lengthening'], ['upperTransverse', 'Transverse arch expansion'],
         ['upperIER', 'Interdental enamel reduction'], ['upperExtractions', 'Dental extractions']],
        [['Timing of Extractions', v('upperTimingExtr')], ['Teeth of Extractions', v('upperTeethExtr')],
         ['Timing of Bonding',    v('upperTimingBond')], ['BOND',               v('upperTeethBond')],
         ['SKIP',                 v('upperTeethSkip')]],
      );

      addHalfTable(6.7, 6.3, 'Lower',
        [['lowerArchLengthening', 'Arch lengthening'], ['lowerTransverse', 'Transverse arch expansion'],
         ['lowerIER', 'Interdental enamel reduction'], ['lowerExtractions', 'Dental extractions']],
        [['Timing of Extractions', v('lowerTimingExtr')], ['Teeth of Extractions', v('lowerTeethExtr')],
         ['Timing of Bonding',    v('lowerTimingBond')], ['BOND',               v('lowerTeethBond')],
         ['SKIP',                 v('lowerTeethSkip')]],
      );
    }
  }

  /* ══════════════════════════════════════
     Diagnosis
  ══════════════════════════════════════ */
  if (o.includeDiagnosis) {
    const fields = [
      [t.diagnosis,       patient.diagnosis],
      [t.treatmentPlan,   patient.treatmentPlan],
      [t.treatmentStages, patient.treatmentStages],
      [t.instructions,    patient.instructions],
      [t.treatmentNotes,  patient.treatmentNotes],
    ].filter(([, v]) => v);

    if (fields.length) {
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, `🩺  ${t.diagnosisTitle}`, isRtl);

      let y = 1.35;
      fields.forEach(([lbl, val]) => {
        const text = stripHtml(val);
        if (!text || y > 7.0) return;
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.26, fill: { color: C.navy } });
        s.addText(rtlStr(lbl), {
          x: 0.4, y: y + 0.03, w: 12.4, h: 0.2,
          fontSize: 9, bold: true, color: C.white, fontFace: 'Calibri',
          align, rtlMode: true,
        });
        y += 0.28;
        const valH = Math.min(2.5, Math.max(0.4, Math.ceil(text.length / 80) * 0.3 + 0.1));
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: valH, fill: { color: C.offwhite }, line: { color: C.silver, width: 0.3 } });
        s.addText(rtlStr(text), {
          x: 0.45, y: y + 0.03, w: 12.3, h: valH - 0.05,
          fontSize: 10, color: C.dark, fontFace: 'Calibri',
          align, rtlMode: true, wrap: true, valign: 'top',
        });
        y += valH + 0.1;
      });
    }
  }

  /* ══════════════════════════════════════
     Sessions
  ══════════════════════════════════════ */
  if (o.includeSessions) {
    for (const [idx, session] of filteredSessions.entries()) {
      const num     = session.sessionNumber || idx + 1;
      const dateStr = session.sessionDate
        ? t.dateFormat(new Date(session.sessionDate))
        : '';
      const heading = t.sessionTitle(num, dateStr);

      /* ── Session info slide ── */
      const s = pptx.addSlide();
      s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
      addHeaderBar(s, clinicName, clinicSub, isRtl);
      addSectionTitle(s, `📋  ${heading}`, isRtl);

      let y = 1.35;
      const sFields = [
        [t.sessionNotes, session.notes],
        [t.nextStep,     session.nextStep],
        [t.amountPaid,   session.amountPaid ? `${session.amountPaid} ${t.currency}` : null],
      ].filter(([, v]) => v);

      sFields.forEach(([lbl, val]) => {
        const text = stripHtml(String(val));
        if (!text || y > 6.8) return;
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.24, fill: { color: C.lblue } });
        s.addText(lbl, {
          x: 0.4, y: y + 0.03, w: 12.4, h: 0.18,
          fontSize: 8.5, bold: true, color: C.white, fontFace: 'Calibri',
          align, rtlMode: rtl,
        });
        y += 0.26;
        const valH = Math.min(2.5, Math.max(0.4, Math.ceil(text.length / 80) * 0.3 + 0.1));
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: valH, fill: { color: C.offwhite }, line: { color: C.silver, width: 0.3 } });
        s.addText(text, {
          x: 0.45, y: y + 0.03, w: 12.3, h: valH - 0.05,
          fontSize: 10, color: C.dark, fontFace: 'Calibri',
          align, rtlMode: rtl, wrap: true, valign: 'top',
        });
        y += valH + 0.1;
      });

      /* ── Session images slide ── */
      if (o.includeSessionImages && (session.images || []).length) {
        const sessionImgs = await Promise.all(
          (session.images || []).map(async img => {
            const result = img.penNote
              ? await getDimsFromBase64(img.penNote)
              : await toBase64(img.url);
            return {
              base64: result?.data || null,
              ratio:  result?.ratio || 0.75,
              label:  slotLabel(img.type, 'session', lang),
              notes:  img.notes || '',
            };
          })
        );
        const valid = sessionImgs.filter(i => i.base64);
        if (valid.length) {
          const imgSlide = pptx.addSlide();
          imgSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
          addHeaderBar(imgSlide, clinicName, clinicSub, isRtl);
          addSectionTitle(imgSlide, `📸  ${t.sessionPhotosTitle(num, dateStr)}`, isRtl);
          await buildImageGrid(imgSlide, valid, 1.28, 12.9, 6.3, isRtl);
        }
      }
    }
  }

  /* ══════════════════════════════════════
     Financial Summary
  ══════════════════════════════════════ */
  if (o.includeFinancials) {
    const s = pptx.addSlide();
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
    addHeaderBar(s, clinicName, clinicSub, isRtl);
    addSectionTitle(s, `💰  ${t.financialTitle}`, isRtl);

    const statusMap = t.statusMap;
    const rows = [
      [t.totalCost,     fin.totalCost != null ? `${fin.totalCost} ${t.currency}` : null],
      [t.totalPaid,     fin.totalPaid != null ? `${fin.totalPaid} ${t.currency}` : null],
      [t.remaining,     fin.remaining != null ? `${fin.remaining} ${t.currency}` : null],
      [t.accountStatus, statusMap[fin.accountStatus] || fin.accountStatus],
    ];
    let y = 1.5;
    rows.forEach(([lbl, val], i) => {
      if (!val) return;
      addInfoRow(s, lbl, val, y, isRtl, i % 2 === 0);
      y += 0.48;
    });
  }

  /* ══════════════════════════════════════
     Save file
  ══════════════════════════════════════ */
  const dateStamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName  = `Patient-${patient.fullName}-${dateStamp}.pptx`;
  await pptx.writeFile({ fileName });
}
