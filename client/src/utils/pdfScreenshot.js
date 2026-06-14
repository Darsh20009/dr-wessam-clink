/**
 * Section-aware HTML → PDF conversion.
 *
 * Strategy:
 *   1. Render the full HTML in a hidden iframe.
 *   2. Capture the entire page as one tall canvas (html2canvas).
 *   3. Query every `.new-page` element for its exact pixel Y-offset.
 *   4. Use those Y-offsets as forced page boundaries in the PDF — each
 *      section starts at the TOP of a fresh PDF page, so nothing inside
 *      a section is ever cut across a page.
 *   5. If a single section is taller than one A4 page (e.g. a very long
 *      TTT table) we split it further but still only at blank/white rows.
 */

function findBestCutRow(imageData, canvasWidth, targetY, endY, searchWindow = 80) {
  const start = Math.max(0, targetY - searchWindow);
  const end   = Math.min(endY - 1, targetY + Math.round(searchWindow * 0.3));
  let bestY = targetY, bestScore = -1;
  for (let y = end; y >= start; y--) {
    const base = y * canvasWidth * 4;
    let white = 0;
    for (let x = 0; x < canvasWidth; x++) {
      const i = base + x * 4;
      if (imageData.data[i] > 240 && imageData.data[i+1] > 240 && imageData.data[i+2] > 240) white++;
    }
    const score = white / canvasWidth;
    if (score > bestScore) { bestScore = score; bestY = y; }
    if (score > 0.98) break;
  }
  return bestY;
}

function sliceCanvas(src, startY, heightPx, targetPageH) {
  const c = document.createElement('canvas');
  c.width  = src.width;
  c.height = targetPageH;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(src, 0, startY, src.width, heightPx, 0, 0, src.width, heightPx);
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
  iframe.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${A4_W_PX}px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  try {
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();

    // Wait for fonts + images inside iframe
    await new Promise(r => setTimeout(r, 3500));

    const iDoc  = iframe.contentDocument;
    const iBody = iDoc.body;

    // Strip UI chrome before measuring / capturing
    iDoc.querySelectorAll('.print-toolbar, .watermark, .no-print').forEach(el => {
      el.style.display = 'none';
    });
    iBody.style.paddingTop = '0';
    iBody.style.background = '#fff';

    // Measure full content height
    const fullH = Math.max(iBody.scrollHeight, iBody.offsetHeight, 200);
    iframe.style.height = fullH + 'px';
    await new Promise(r => setTimeout(r, 300));

    // ── Capture the whole page as one canvas ──
    const fullCanvas = await html2canvas(iBody, {
      scale,
      useCORS:      true,
      allowTaint:   true,
      logging:      false,
      width:        A4_W_PX,
      height:       fullH,
      windowWidth:  A4_W_PX,
      windowHeight: fullH,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
    });

    const pageHPx = Math.round(A4_H_PX * scale);   // one A4 page in canvas pixels
    const totalH  = fullCanvas.height;

    // ── Compute section boundaries from .new-page elements ──
    // We compute cumulative offsetTop from iBody.
    const getTopFromBody = (el) => {
      let top = 0;
      let node = el;
      while (node && node !== iBody) {
        top  += node.offsetTop;
        node  = node.offsetParent;
      }
      return Math.round(top * scale);
    };

    // Collect cut points: start of every .new-page div
    const sectionEls  = Array.from(iDoc.querySelectorAll('.new-page'));
    const cutSet = new Set([0]); // always start at 0
    sectionEls.forEach(el => {
      const y = getTopFromBody(el);
      if (y > 0 && y < totalH) cutSet.add(y);
    });
    cutSet.add(totalH); // sentinel

    const cuts = Array.from(cutSet).sort((a, b) => a - b);

    // Pre-fetch image data for white-row detection (only used inside sections)
    const fullCtx  = fullCanvas.getContext('2d');
    const fullData = fullCtx.getImageData(0, 0, fullCanvas.width, totalH);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let pageIndex = 0;

    const addPage = (canvasSlice) => {
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(canvasSlice.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
      pageIndex++;
    };

    for (let i = 0; i < cuts.length - 1; i++) {
      const secStart = cuts[i];
      const secEnd   = cuts[i + 1];
      const secH     = secEnd - secStart;
      if (secH <= 0) continue;

      if (secH <= pageHPx) {
        // ── Section fits on one page — perfect, no cut ──
        addPage(sliceCanvas(fullCanvas, secStart, secH, pageHPx));
      } else {
        // ── Section taller than one A4 page — split further ──
        // This happens only for very long text tables (TTT).
        // We split at the nearest white row to avoid cutting mid-row text.
        let y = secStart;
        while (y < secEnd) {
          const rawEnd  = y + pageHPx;
          const isLast  = rawEnd >= secEnd;
          const cutAt   = isLast ? secEnd : findBestCutRow(fullData, fullCanvas.width, rawEnd, secEnd, 80);
          const chunkH  = cutAt - y;
          addPage(sliceCanvas(fullCanvas, y, chunkH, pageHPx));
          y = cutAt;
        }
      }
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(iframe);
  }
}
