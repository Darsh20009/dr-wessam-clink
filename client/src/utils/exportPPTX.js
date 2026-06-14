import PptxGenJS from 'pptxgenjs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
        resolve(c.toDataURL('image/jpeg', quality));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });
}

/* ─── Slide building blocks ──────────────────────────────── */
function addHeaderBar(slide, clinicName, subtitle, isRtl) {
  // Navy gradient bar
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: C.navy } });
  // Accent stripe
  slide.addShape('rect', { x: 0, y: 0.65, w: '100%', h: 0.06, fill: { color: C.lblue } });

  const align = isRtl ? 'right' : 'left';
  const rtl   = isRtl ? true : false;
  const xName = isRtl ? 0.2 : 0.3;
  const xSub  = isRtl ? 0.2 : 0.3;
  const wName = 8.5;

  slide.addText(clinicName, {
    x: xName, y: 0.07, w: wName, h: 0.32,
    fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri',
    align, rtlMode: rtl,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: xSub, y: 0.36, w: wName, h: 0.22,
      fontSize: 9, color: C.sky, fontFace: 'Calibri',
      align, rtlMode: rtl,
    });
  }
}

function addSectionTitle(slide, title, isRtl) {
  slide.addShape('rect', { x: 0, y: 0.71, w: '100%', h: 0.5, fill: { color: C.lgray } });
  slide.addShape('rect', { x: isRtl ? 12.8 : 0, y: 0.71, w: 0.16, h: 0.5, fill: { color: C.lblue } });
  slide.addText(title, {
    x: isRtl ? 0.3 : 0.3, y: 0.74, w: 12.7, h: 0.42,
    fontSize: 14, bold: true, color: C.navy, fontFace: 'Calibri',
    align: isRtl ? 'right' : 'left', rtlMode: isRtl,
  });
}

function addInfoRow(slide, label, value, y, isRtl, shade) {
  if (!value) return;
  slide.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.36, fill: { color: shade ? C.lgray : C.offwhite }, line: { color: C.silver, width: 0.3 } });
  if (isRtl) {
    slide.addText(label, { x: 9.5, y: y + 0.05, w: 3.2, h: 0.26, fontSize: 10, bold: true, color: C.navy, fontFace: 'Calibri', align: 'right', rtlMode: true });
    slide.addText(String(value), { x: 0.4, y: y + 0.05, w: 9.0, h: 0.26, fontSize: 10, color: C.dark, fontFace: 'Calibri', align: 'right', rtlMode: true });
  } else {
    slide.addText(label, { x: 0.4, y: y + 0.05, w: 3.2, h: 0.26, fontSize: 10, bold: true, color: C.navy, fontFace: 'Calibri', align: 'left' });
    slide.addText(String(value), { x: 3.8, y: y + 0.05, w: 9.0, h: 0.26, fontSize: 10, color: C.dark, fontFace: 'Calibri', align: 'left' });
  }
}

/* ─── One image per slide — maximum quality ──────────────── */
// PPTX WIDE = 13.33" × 7.5"
const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const HEADER_H = 0.71;  // header bar height
const TITLE_H  = 0.5;   // section title bar height
const CONTENT_TOP = HEADER_H + TITLE_H;  // 1.21"

async function addSingleImageSlides(pptx, images, sectionTitle, clinicName, clinicSub, isRtl) {
  for (const imgObj of images) {
    const { base64, label, notes } = imgObj;
    if (!base64) continue;

    const noteText   = stripHtml(notes || '');
    const hasNotes   = noteText.length > 0;
    // Estimate lines needed for notes (approx 90 chars per line at fontSize 10)
    const noteLines  = hasNotes ? Math.ceil(noteText.length / 90) : 0;
    const noteH      = hasNotes ? Math.max(0.45, noteLines * 0.28 + 0.16) : 0;
    const labelBarH  = label ? 0.3 : 0;

    // Usable image height on this slide
    const margin     = 0.15;
    const availH     = SLIDE_H - CONTENT_TOP - noteH - labelBarH - margin * 2;
    const availW     = SLIDE_W - margin * 2;
    const imgX       = margin;
    const imgY       = CONTENT_TOP + margin;

    /* ── Image slide ── */
    const s = pptx.addSlide();
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
    addHeaderBar(s, clinicName, clinicSub, isRtl);
    addSectionTitle(s, sectionTitle, isRtl);

    // Image — full width, maximum height
    s.addShape('rect', {
      x: imgX, y: imgY, w: availW, h: availH,
      fill: { color: '0a0a0a' },
    });
    try {
      s.addImage({
        data: base64,
        x: imgX, y: imgY, w: availW, h: availH,
        sizing: { type: 'contain', w: availW, h: availH },
      });
    } catch {}

    // Label bar directly below image
    if (label) {
      const labelY = imgY + availH;
      s.addShape('rect', { x: imgX, y: labelY, w: availW, h: labelBarH, fill: { color: C.navy } });
      s.addText(label, {
        x: imgX, y: labelY + 0.04, w: availW, h: labelBarH - 0.06,
        fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri',
        align: 'center',
      });
    }

    // Notes — on same slide if short, else overflow to next slide
    if (hasNotes) {
      const noteFitsOnSlide = noteH <= 1.2 && noteLines <= 4;

      if (noteFitsOnSlide) {
        const noteY = imgY + availH + labelBarH;
        s.addShape('rect', {
          x: imgX, y: noteY, w: availW, h: noteH,
          fill: { color: 'fffbeb' }, line: { color: 'fde68a', width: 0.5 },
        });
        s.addText(noteText, {
          x: imgX + 0.12, y: noteY + 0.06, w: availW - 0.24, h: noteH - 0.1,
          fontSize: 10, color: '78350f', fontFace: 'Calibri',
          align: isRtl ? 'right' : 'left', rtlMode: isRtl,
          wrap: true, valign: 'top',
        });
      } else {
        // Long notes → dedicated notes slide
        const ns = pptx.addSlide();
        ns.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
        addHeaderBar(ns, clinicName, clinicSub, isRtl);
        addSectionTitle(ns, `${sectionTitle}  —  ${isRtl ? 'ملاحظات' : 'Notes'}: ${label || ''}`, isRtl);

        ns.addShape('rect', {
          x: 0.3, y: CONTENT_TOP + 0.2, w: SLIDE_W - 0.6, h: SLIDE_H - CONTENT_TOP - 0.5,
          fill: { color: 'fffbeb' }, line: { color: 'fde68a', width: 0.5 },
        });
        ns.addText(noteText, {
          x: 0.5, y: CONTENT_TOP + 0.3, w: SLIDE_W - 1.0, h: SLIDE_H - CONTENT_TOP - 0.7,
          fontSize: 12, color: '78350f', fontFace: 'Calibri',
          align: isRtl ? 'right' : 'left', rtlMode: isRtl,
          wrap: true, valign: 'top',
        });
      }
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
      s.addText(clinicName, {
        x: 0.6, y: 1.0, w: 12, h: 0.8,
        fontSize: 38, bold: true, color: C.white, fontFace: 'Calibri',
        align: 'center', rtlMode: rtl,
      });
      s.addText(clinicSub, {
        x: 0.6, y: 1.88, w: 12, h: 0.45,
        fontSize: 16, color: C.sky, fontFace: 'Calibri',
        align: 'center', rtlMode: rtl,
      });
      s.addShape('line', { x: 2.5, y: 2.55, w: 8.3, h: 0, line: { color: C.sky, width: 0.8 } });
    }

    // Patient name block
    s.addText(patient.fullName || '', {
      x: 0.6, y: 5.05, w: 12, h: 0.68,
      fontSize: 30, bold: true, color: C.white, fontFace: 'Calibri',
      align: 'center', rtlMode: rtl,
    });
    s.addText(t.reportTitle, {
      x: 0.6, y: 5.75, w: 12, h: 0.38,
      fontSize: 15, color: C.sky, fontFace: 'Calibri',
      align: 'center', rtlMode: rtl,
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
      [t.patientName,  patient.fullName],
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
     SLIDE 3 — Diagnosis
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

        // Label chip
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.26, fill: { color: C.navy } });
        s.addText(lbl, {
          x: isRtl ? 0.4 : 0.4, y: y + 0.03, w: 12.4, h: 0.2,
          fontSize: 9, bold: true, color: C.white, fontFace: 'Calibri',
          align, rtlMode: rtl,
        });
        y += 0.28;

        // Value
        const lines = Math.min(Math.ceil(text.length / 100) + 1, 3);
        const valH  = lines * 0.26;
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: valH, fill: { color: C.offwhite }, line: { color: C.silver, width: 0.3 } });
        s.addText(text, {
          x: 0.45, y: y + 0.03, w: 12.3, h: valH - 0.05,
          fontSize: 10, color: C.dark, fontFace: 'Calibri',
          align, rtlMode: rtl, wrap: true, valign: 'top',
        });
        y += valH + 0.1;
      });
    }
  }

  /* ══════════════════════════════════════
     Photos — one full slide per image
  ══════════════════════════════════════ */
  const processPhotoSection = async (imgArr, sectionTitle, category) => {
    const imgs = await Promise.all(
      imgArr.map(async img => ({
        base64: img.penNote || await toBase64(img.url),
        label:  slotLabel(img.type, category, lang),
        notes:  img.notes || '',
      }))
    );
    await addSingleImageSlides(pptx, imgs, `📸  ${sectionTitle}`, clinicName, clinicSub, isRtl);
  };

  if (o.includePhotos) {
    if (o.includeFacePhotos && (patient.faceImages || []).length)
      await processPhotoSection(patient.faceImages, t.extraoral, 'face');
    if (o.includeIntraOralPhotos && (patient.intraOralImages || []).length)
      await processPhotoSection(patient.intraOralImages, t.intraoral, 'intraoral');
    if (o.includeXrays && (patient.xrays || []).length)
      await processPhotoSection(patient.xrays, t.radiographs, 'xray');
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

      /* ── Session info slide (notes + details) ── */
      // Each field gets its own block; if total content overflows → new slide
      const sFields = [
        [t.sessionNotes, session.notes],
        [t.nextStep,     session.nextStep],
        [t.amountPaid,   session.amountPaid ? `${session.amountPaid} ${t.currency}` : null],
      ].filter(([, v]) => v);

      const addSessionInfoSlide = () => {
        const s = pptx.addSlide();
        s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: C.white } });
        addHeaderBar(s, clinicName, clinicSub, isRtl);
        addSectionTitle(s, `📋  ${heading}`, isRtl);
        return { s, y: CONTENT_TOP + 0.12 };
      };

      let { s, y } = addSessionInfoSlide();

      sFields.forEach(([lbl, val]) => {
        const text = stripHtml(String(val));
        if (!text) return;

        const lines  = Math.ceil(text.length / 100);
        const valH   = Math.max(0.4, lines * 0.3 + 0.12);
        const blockH = 0.28 + valH + 0.12;

        // Overflow to new slide if needed
        if (y + blockH > SLIDE_H - 0.2) {
          ({ s, y } = addSessionInfoSlide());
        }

        // Label chip
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: 0.28, fill: { color: C.lblue } });
        s.addText(lbl, {
          x: 0.4, y: y + 0.04, w: 12.4, h: 0.22,
          fontSize: 9, bold: true, color: C.white, fontFace: 'Calibri',
          align, rtlMode: rtl,
        });
        y += 0.3;

        // Value block
        s.addShape('rect', { x: 0.3, y, w: 12.6, h: valH, fill: { color: C.offwhite }, line: { color: C.silver, width: 0.3 } });
        s.addText(text, {
          x: 0.45, y: y + 0.05, w: 12.3, h: valH - 0.08,
          fontSize: 11, color: C.dark, fontFace: 'Calibri',
          align, rtlMode: rtl, wrap: true, valign: 'top',
        });
        y += valH + 0.12;
      });

      /* ── Session images — one full slide each ── */
      if (o.includeSessionImages && (session.images || []).length) {
        const sessionImgs = await Promise.all(
          (session.images || []).map(async img => ({
            base64: img.penNote || await toBase64(img.url),
            label:  slotLabel(img.type, 'session', lang),
            notes:  img.notes || '',
          }))
        );
        await addSingleImageSlides(
          pptx, sessionImgs,
          `📸  ${t.sessionPhotosTitle(num, dateStr)}`,
          clinicName, clinicSub, isRtl
        );
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
