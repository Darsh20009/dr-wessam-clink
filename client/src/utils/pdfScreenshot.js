/**
 * Section-aware, image-safe HTML → PDF conversion.
 *
 * Strategy:
 *   1. Render the full HTML in a hidden iframe (794 px wide = A4 at 96 dpi).
 *   2. Capture the entire page as one tall canvas with html2canvas (scale=2).
 *   3. Collect two kinds of breakpoints from the live DOM:
 *        a. FORCED breaks  — every .new-page element starts a fresh PDF page.
 *        b. NO-CUT zones   — every .img-slot element's pixel range; the PDF
 *           slicer must never cut through these ranges.
 *   4. When a section fits on one A4 page → add as-is (no cut, ever).
 *   5. When a section is taller than one A4 page → split it, but only at
 *      positions that fall outside every no-cut zone (i.e. between images).
 *   6. The very first .new-page is merged onto the header page so the first
 *      PDF page is not nearly-empty.
 */

/** Returns the nearest Y ≤ targetY that is NOT inside any imgSlot range. */
function safeCutY(targetY, startY, imgZones) {
  // Find a zone that contains targetY
  for (let i = imgZones.length - 1; i >= 0; i--) {
    const z = imgZones[i];
    if (targetY >= z.top && targetY < z.bottom) {
      // targetY is inside this image — back up to just before the image starts
      const candidate = z.top - 2;
      if (candidate > startY) return candidate;
      // Whole first chunk is inside an image — no good split; return startY+1
      return startY + 1;
    }
  }
  return targetY; // already safe
}

function sliceCanvas(src, startY, srcH, pageH) {
  const c = document.createElement('canvas');
  c.width  = src.width;
  c.height = pageH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, 0, startY, src.width, srcH, 0, 0, src.width, srcH);
  return c;
}

export async function htmlToPdfBlob(htmlString, { filename = 'report.pdf', scale = 2 } = {}) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const A4_W_PX = 794;
  const A4_H_PX = 1123;
  const A4_W_MM = 210;
  const A4_H_MM = 297;

  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    `position:fixed;left:-9999px;top:-9999px;width:${A4_W_PX}px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  try {
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();

    // Wait for fonts and images to fully load inside the iframe
    await new Promise(r => setTimeout(r, 4000));

    const iDoc  = iframe.contentDocument;
    const iBody = iDoc.body;

    // Strip UI chrome before measuring / capturing
    iDoc.querySelectorAll('.print-toolbar,.watermark,.no-print').forEach(el => {
      el.style.display = 'none';
    });
    iBody.style.paddingTop = '0';
    iBody.style.background  = '#fff';

    const fullH = Math.max(iBody.scrollHeight, iBody.offsetHeight, 200);
    iframe.style.height = fullH + 'px';
    await new Promise(r => setTimeout(r, 400));

    // ── Capture full page as one canvas ──────────────────────────────────
    const fullCanvas = await html2canvas(iBody, {
      scale,
      useCORS:         true,
      allowTaint:      true,
      logging:         false,
      width:           A4_W_PX,
      height:          fullH,
      windowWidth:     A4_W_PX,
      windowHeight:    fullH,
      scrollX:         0,
      scrollY:         0,
      backgroundColor: '#ffffff',
      imageTimeout:    0,
    });

    const pageHPx = Math.round(A4_H_PX * scale);
    const totalH  = fullCanvas.height;

    // ── Helper: cumulative offsetTop from <body> → canvas pixels ─────────
    const domTopToPx = (el) => {
      let top = 0, node = el;
      while (node && node !== iBody) { top += node.offsetTop; node = node.offsetParent; }
      return Math.round(top * scale);
    };

    // ── 1. FORCED page breaks (.new-page positions) ───────────────────────
    const sectionEls = Array.from(iDoc.querySelectorAll('.new-page'));
    const cutSet = new Set([0]);
    sectionEls.forEach((el, idx) => {
      if (idx === 0) return;            // merge first section with header page
      const y = domTopToPx(el);
      if (y > 0 && y < totalH) cutSet.add(y);
    });
    cutSet.add(totalH);
    const cuts = Array.from(cutSet).sort((a, b) => a - b);

    // ── 2. NO-CUT zones (.img-slot positions) ─────────────────────────────
    // Every <img> inside .img-slot must not be crossed by a page cut.
    // We pad each zone by 4px on each side for safety.
    const PAD = 4;
    const imgZones = Array.from(iDoc.querySelectorAll('.img-slot'))
      .map(el => {
        const top    = domTopToPx(el) - PAD;
        const bottom = Math.round((domTopToPx(el) / scale + el.offsetHeight) * scale) + PAD;
        return { top, bottom };
      })
      .filter(z => z.bottom > z.top)
      .sort((a, b) => a.top - b.top);

    // ── 3. Build PDF ───────────────────────────────────────────────────────
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let pageIndex = 0;

    const addPdfPage = (startPx, heightPx) => {
      if (heightPx <= 0) return;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(
        sliceCanvas(fullCanvas, startPx, heightPx, pageHPx).toDataURL('image/jpeg', 0.93),
        'JPEG', 0, 0, A4_W_MM, A4_H_MM,
      );
      pageIndex++;
    };

    for (let i = 0; i < cuts.length - 1; i++) {
      const secStart = cuts[i];
      const secEnd   = cuts[i + 1];
      const secH     = secEnd - secStart;
      if (secH <= 0) continue;

      if (secH <= pageHPx) {
        // ── Fits on one page — no cut needed ────────────────────────────
        addPdfPage(secStart, secH);
      } else {
        // ── Section taller than A4: split, but respect img-slot zones ───
        let y = secStart;
        while (y < secEnd) {
          const rawEnd = Math.min(y + pageHPx, secEnd);
          const isLast = rawEnd >= secEnd;

          let cutAt;
          if (isLast) {
            cutAt = secEnd;
          } else {
            // Try to cut at rawEnd; back off if it's inside an image zone
            cutAt = safeCutY(rawEnd, y, imgZones);

            // If backing off produced no progress, force-advance past the
            // image zone that trapped us to prevent an infinite loop
            if (cutAt <= y) {
              // Find the zone that starts just after y and skip past it
              const blocking = imgZones.find(z => z.top >= y && z.top < rawEnd + pageHPx);
              cutAt = blocking ? blocking.bottom + 2 : rawEnd;
            }
          }

          addPdfPage(y, cutAt - y);
          y = cutAt;
        }
      }
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(iframe);
  }
}
