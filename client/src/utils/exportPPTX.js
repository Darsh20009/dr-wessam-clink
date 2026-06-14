import PptxGenJS from 'pptxgenjs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const BLUE   = '1e3a8a';
const LBLUE  = '2563eb';
const WHITE  = 'FFFFFF';
const GRAY   = '64748b';
const LGRAY  = 'f1f5f9';
const DARK   = '0f172a';

async function toBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/jpeg', 0.85));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function addHeader(slide, clinicName, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.7, fill: { color: BLUE } });
  slide.addText(clinicName, {
    x: 0.2, y: 0.08, w: 7, h: 0.35,
    fontSize: 18, bold: true, color: WHITE, fontFace: 'Arial',
    align: 'right', rtlMode: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.2, y: 0.38, w: 7, h: 0.25,
      fontSize: 10, color: 'bfdbfe', fontFace: 'Arial',
      align: 'right', rtlMode: true,
    });
  }
}

function addSlideTitle(slide, title) {
  slide.addShape('rect', { x: 0, y: 0.7, w: '100%', h: 0.45, fill: { color: 'eff6ff' } });
  slide.addText(title, {
    x: 0.3, y: 0.72, w: 9, h: 0.38,
    fontSize: 14, bold: true, color: BLUE, fontFace: 'Arial',
    align: 'right', rtlMode: true,
  });
}

function infoRow(slide, label, value, y) {
  if (!value) return;
  slide.addText(label + ':', {
    x: 6.2, y, w: 3.2, h: 0.28,
    fontSize: 10, bold: true, color: DARK, fontFace: 'Arial',
    align: 'right', rtlMode: true,
  });
  slide.addText(String(value), {
    x: 0.3, y, w: 5.8, h: 0.28,
    fontSize: 10, color: GRAY, fontFace: 'Arial',
    align: 'right', rtlMode: true,
  });
}

async function buildImageGrid(slide, images, startY, maxW, maxH) {
  const count = images.length;
  if (!count) return;
  const cols = Math.min(count, 3);
  const rows = Math.ceil(count / cols);
  const cellW = maxW / cols;
  const cellH = maxH / rows;
  const pad = 0.05;
  for (let i = 0; i < images.length; i++) {
    const { base64, label } = images[i];
    if (!base64) continue;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 0.3 + col * cellW;
    const y = startY + row * cellH;
    const imgW = cellW - pad * 2;
    const imgH = cellH - 0.25 - pad * 2;
    try {
      slide.addImage({ data: base64, x: x + pad, y: y + pad, w: imgW, h: imgH, sizing: { type: 'contain', w: imgW, h: imgH } });
    } catch {}
    if (label) {
      slide.addText(label, {
        x: x + pad, y: y + pad + imgH + 0.01, w: imgW, h: 0.2,
        fontSize: 7, color: GRAY, fontFace: 'Arial', align: 'center',
      });
    }
  }
}

export async function exportPatientPPTX({ patient, sessions = [], ttt = {}, siteInfo = {}, opts = {} }) {
  const o = {
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

  const clinicName  = siteInfo?.clinicName  || 'عيادة د. وسام يوسف';
  const clinicSub   = siteInfo?.clinicSubtitle || 'أخصائي تقويم الأسنان — بني مزار، المنيا';
  const clinicPhone = siteInfo?.phone || '+20 115 679 8324';
  const fin         = patient.financials || {};
  const today       = format(new Date(), 'd MMMM yyyy', { locale: ar });

  const filteredSessions = sessions.filter(s =>
    !o.sessionIds?.length || o.sessionIds.includes(s._id)
  ).sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author  = clinicName;
  pptx.subject = `ملف المريض — ${patient.fullName}`;

  /* ─── Slide 1: Cover ─────────────────────────────────── */
  {
    const s = pptx.addSlide();
    s.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: BLUE } });
    s.addShape('rect', { x: 0, y: 4.2, w: '100%', h: 3.3, fill: { color: LBLUE } });

    if (o.includeClinicHeader) {
      s.addText(clinicName, {
        x: 0.5, y: 1.2, w: 12.3, h: 0.8,
        fontSize: 36, bold: true, color: WHITE, fontFace: 'Arial',
        align: 'center', rtlMode: true,
      });
      s.addText(clinicSub, {
        x: 0.5, y: 2.0, w: 12.3, h: 0.45,
        fontSize: 16, color: 'bfdbfe', fontFace: 'Arial',
        align: 'center', rtlMode: true,
      });
      s.addShape('line', { x: 3, y: 2.6, w: 7.3, h: 0, line: { color: 'bfdbfe', width: 1 } });
    }

    s.addText(patient.fullName || '', {
      x: 0.5, y: 4.5, w: 12.3, h: 0.6,
      fontSize: 28, bold: true, color: WHITE, fontFace: 'Arial',
      align: 'center', rtlMode: true,
    });
    s.addText('الملف الطبي الكامل', {
      x: 0.5, y: 5.1, w: 12.3, h: 0.35,
      fontSize: 14, color: 'bfdbfe', fontFace: 'Arial',
      align: 'center', rtlMode: true,
    });
    s.addText(`تاريخ التقرير: ${today}`, {
      x: 0.5, y: 6.6, w: 12.3, h: 0.3,
      fontSize: 11, color: 'bfdbfe', fontFace: 'Arial',
      align: 'center', rtlMode: true,
    });
    s.addText(clinicPhone, {
      x: 0.5, y: 6.95, w: 12.3, h: 0.28,
      fontSize: 11, color: 'bfdbfe', fontFace: 'Arial',
      align: 'center',
    });
  }

  /* ─── Slide 2: Patient Info ──────────────────────────── */
  if (o.includePatientCard) {
    const s = pptx.addSlide();
    addHeader(s, clinicName, clinicSub);
    addSlideTitle(s, '👤 بيانات المريض');

    const age = patient.dateOfBirth
      ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000) + ' سنة'
      : patient.age ? patient.age + ' سنة' : '';

    let y = 1.35;
    const rows = [
      ['الاسم الكامل', patient.fullName],
      ['رقم الجوال', patient.phone],
      ['العمر', age],
      ['العنوان', patient.address],
      ['رقم المريض', patient.patientId],
    ];
    rows.forEach(([lbl, val]) => {
      if (!val) return;
      s.addShape('rect', { x: 0.3, y, w: 9, h: 0.32, fill: { color: 'f8fafc' }, line: { color: 'e2e8f0', width: 0.5 } });
      s.addText(lbl + ':', { x: 6.2, y: y + 0.04, w: 2.8, h: 0.24, fontSize: 10, bold: true, color: DARK, fontFace: 'Arial', align: 'right', rtlMode: true });
      s.addText(String(val), { x: 0.4, y: y + 0.04, w: 5.7, h: 0.24, fontSize: 10, color: GRAY, fontFace: 'Arial', align: 'right', rtlMode: true });
      y += 0.38;
    });
  }

  /* ─── Slide 3: Diagnosis ─────────────────────────────── */
  if (o.includeDiagnosis) {
    const fields = [
      ['التشخيص', patient.diagnosis],
      ['خطة العلاج', patient.treatmentPlan],
      ['مراحل العلاج', patient.treatmentStages],
      ['التعليمات', patient.instructions],
      ['ملاحظات العلاج', patient.treatmentNotes],
    ].filter(([, v]) => v);

    if (fields.length) {
      const s = pptx.addSlide();
      addHeader(s, clinicName, clinicSub);
      addSlideTitle(s, '🩺 التشخيص وخطة العلاج');
      let y = 1.38;
      fields.forEach(([lbl, val]) => {
        const text = stripHtml(val);
        s.addText(lbl + ':', { x: 6.5, y, w: 2.8, h: 0.26, fontSize: 10, bold: true, color: BLUE, fontFace: 'Arial', align: 'right', rtlMode: true });
        y += 0.28;
        s.addShape('rect', { x: 0.3, y, w: 9, h: 0.01, line: { color: 'e2e8f0', width: 0.5 } });
        s.addText(text, { x: 0.3, y, w: 9, h: 0.5, fontSize: 9, color: DARK, fontFace: 'Arial', align: 'right', rtlMode: true, wrap: true });
        y += 0.55;
        if (y > 6.8) return;
      });
    }
  }

  /* ─── Photos: Face ───────────────────────────────────── */
  if (o.includePhotos && o.includeFacePhotos && (patient.faceImages || []).length) {
    const imgs = await Promise.all(
      (patient.faceImages || []).map(async img => ({
        base64: img.penNote || await toBase64(img.url),
        label: img.type?.replace(/_/g, ' ') || '',
      }))
    );
    const valid = imgs.filter(i => i.base64);
    if (valid.length) {
      const s = pptx.addSlide();
      addHeader(s, clinicName, clinicSub);
      addSlideTitle(s, '📸 صور خارج الفم (Extraoral)');
      await buildImageGrid(s, valid, 1.25, 9.7, 5.5);
    }
  }

  /* ─── Photos: Intraoral ──────────────────────────────── */
  if (o.includePhotos && o.includeIntraOralPhotos && (patient.intraOralImages || []).length) {
    const imgs = await Promise.all(
      (patient.intraOralImages || []).map(async img => ({
        base64: img.penNote || await toBase64(img.url),
        label: img.type?.replace(/_/g, ' ') || '',
      }))
    );
    const valid = imgs.filter(i => i.base64);
    if (valid.length) {
      const s = pptx.addSlide();
      addHeader(s, clinicName, clinicSub);
      addSlideTitle(s, '📸 صور داخل الفم (Intraoral)');
      await buildImageGrid(s, valid, 1.25, 9.7, 5.5);
    }
  }

  /* ─── Photos: Xrays ──────────────────────────────────── */
  if (o.includePhotos && o.includeXrays && (patient.xrays || []).length) {
    const imgs = await Promise.all(
      (patient.xrays || []).map(async img => ({
        base64: await toBase64(img.url),
        label: img.type?.replace(/_/g, ' ') || '',
      }))
    );
    const valid = imgs.filter(i => i.base64);
    if (valid.length) {
      const s = pptx.addSlide();
      addHeader(s, clinicName, clinicSub);
      addSlideTitle(s, '🩻 الأشعة التشخيصية');
      await buildImageGrid(s, valid, 1.25, 9.7, 5.5);
    }
  }

  /* ─── Sessions ───────────────────────────────────────── */
  if (o.includeSessions) {
    for (const [idx, session] of filteredSessions.entries()) {
      const dateStr = session.sessionDate
        ? format(new Date(session.sessionDate), 'd MMMM yyyy', { locale: ar })
        : '';
      const sessionLabel = `جلسة #${session.sessionNumber || idx + 1}  —  ${dateStr}`;

      const s = pptx.addSlide();
      addHeader(s, clinicName, clinicSub);
      addSlideTitle(s, `📋 ${sessionLabel}`);

      let y = 1.38;
      const fields = [
        ['ملاحظات', session.notes],
        ['الخطوة القادمة', session.nextStep],
        ['المبلغ المدفوع', session.amountPaid ? session.amountPaid + ' ج.م' : null],
      ];
      fields.forEach(([lbl, val]) => {
        if (!val) return;
        const text = stripHtml(String(val));
        s.addText(lbl + ': ' + text, {
          x: 0.3, y, w: 9, h: 0.3,
          fontSize: 10, color: DARK, fontFace: 'Arial',
          align: 'right', rtlMode: true, wrap: true,
        });
        y += 0.34;
      });

      /* Session images on same slide if few, else new slide */
      if (o.includeSessionImages && (session.images || []).length) {
        const sessionImgs = await Promise.all(
          (session.images || []).map(async img => ({
            base64: img.penNote || await toBase64(img.url),
            label: img.type?.replace(/_/g, ' ') || '',
          }))
        );
        const valid = sessionImgs.filter(i => i.base64);
        if (valid.length) {
          const remainH = 7.5 - y - 0.1;
          if (remainH >= 1.5) {
            await buildImageGrid(s, valid, y + 0.05, 9.7, remainH);
          } else {
            const imgSlide = pptx.addSlide();
            addHeader(imgSlide, clinicName, clinicSub);
            addSlideTitle(imgSlide, `📸 صور ${sessionLabel}`);
            await buildImageGrid(imgSlide, valid, 1.25, 9.7, 5.5);
          }
        }
      }
    }
  }

  /* ─── Financial Summary ──────────────────────────────── */
  if (o.includeFinancials) {
    const s = pptx.addSlide();
    addHeader(s, clinicName, clinicSub);
    addSlideTitle(s, '💰 البيانات المالية');
    const statusMap = { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' };
    const rows = [
      ['إجمالي تكلفة العلاج', fin.totalCost != null ? fin.totalCost + ' ج.م' : null],
      ['إجمالي المدفوع',       fin.totalPaid != null ? fin.totalPaid + ' ج.م' : null],
      ['المتبقي',              fin.remaining != null ? fin.remaining + ' ج.م' : null],
      ['حالة الحساب',          statusMap[fin.accountStatus] || fin.accountStatus],
    ];
    let y = 1.5;
    rows.forEach(([lbl, val]) => {
      if (!val) return;
      s.addShape('rect', { x: 0.3, y, w: 9, h: 0.38, fill: { color: 'f0f9ff' }, line: { color: 'bfdbfe', width: 0.5 } });
      s.addText(lbl + ':', { x: 6.2, y: y + 0.06, w: 2.8, h: 0.26, fontSize: 11, bold: true, color: BLUE, fontFace: 'Arial', align: 'right', rtlMode: true });
      s.addText(String(val),  { x: 0.4, y: y + 0.06, w: 5.7, h: 0.26, fontSize: 11, color: DARK, fontFace: 'Arial', align: 'right', rtlMode: true });
      y += 0.46;
    });
  }

  /* ─── Save ───────────────────────────────────────────── */
  const fileName = `ملف-${patient.fullName}-${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.pptx`;
  await pptx.writeFile({ fileName });
}
