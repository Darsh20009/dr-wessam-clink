/**
 * Renders an HTML string in a hidden iframe, screenshots each A4 page
 * with html2canvas, and assembles them into a jsPDF blob.
 */
export async function htmlToPdfBlob(htmlString, { filename = 'report.pdf', scale = 2 } = {}) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const A4_W_PX = 794;   // A4 at 96 dpi
  const A4_H_PX = 1123;
  const A4_W_MM = 210;
  const A4_H_MM = 297;

  // ── 1. Render HTML in a hidden iframe ────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${A4_W_PX}px;border:none;visibility:hidden;`;
  document.body.appendChild(iframe);

  try {
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();

    // Let fonts + images load
    await new Promise(r => setTimeout(r, 2500));

    const iBody = iframe.contentDocument.body;
    const fullH = Math.max(iBody.scrollHeight, iBody.offsetHeight, 100);
    iframe.style.height = fullH + 'px';

    // ── 2. Screenshot entire page ──────────────────────────────────────
    const canvas = await html2canvas(iBody, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: A4_W_PX,
      height: fullH,
      windowWidth: A4_W_PX,
      windowHeight: fullH,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
    });

    // ── 3. Slice canvas into A4 pages ──────────────────────────────────
    const pageH = Math.round(A4_H_PX * scale);   // canvas pixels per A4 page
    const totalH = canvas.height;
    const totalPages = Math.ceil(totalH / pageH);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) pdf.addPage();

      const srcY = p * pageH;
      const srcH = Math.min(pageH, totalH - srcY);

      // Create a full A4-height slice canvas (rest is white)
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = pageH;

      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

      const imgData = slice.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(iframe);
  }
}
