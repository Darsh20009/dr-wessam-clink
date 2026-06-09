/**
 * Renders an HTML string in a hidden iframe, screenshots each A4 page
 * with html2canvas, and assembles them into a jsPDF blob.
 * Smart page breaking: scans for whitespace rows near boundaries to avoid mid-text cuts.
 */

function findBestCutRow(imageData, canvasWidth, targetY, canvasHeight, searchWindow = 90) {
  const start = Math.max(0, targetY - searchWindow);
  const end   = Math.min(canvasHeight - 1, targetY + Math.round(searchWindow * 0.4));

  let bestY     = targetY;
  let bestScore = -1;

  for (let y = end; y >= start; y--) {
    const rowStart = y * canvasWidth * 4;
    let whiteCount = 0;
    for (let x = 0; x < canvasWidth; x++) {
      const i = rowStart + x * 4;
      if (imageData.data[i] > 242 && imageData.data[i + 1] > 242 && imageData.data[i + 2] > 242) {
        whiteCount++;
      }
    }
    const score = whiteCount / canvasWidth;
    if (score > bestScore) {
      bestScore = score;
      bestY = y;
    }
    if (score > 0.98) break;
  }
  return bestY;
}

export async function htmlToPdfBlob(htmlString, { filename = 'report.pdf', scale = 2 } = {}) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
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

    await new Promise(r => setTimeout(r, 3000));

    const iBody = iframe.contentDocument.body;
    const fullH = Math.max(iBody.scrollHeight, iBody.offsetHeight, 100);
    iframe.style.height = fullH + 'px';

    await new Promise(r => setTimeout(r, 500));

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

    const pageH    = Math.round(A4_H_PX * scale);
    const totalH   = canvas.height;
    const fullCtx  = canvas.getContext('2d');
    const fullData = fullCtx.getImageData(0, 0, canvas.width, canvas.height);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let currentY   = 0;
    let pageIndex  = 0;

    while (currentY < totalH) {
      const rawEndY    = currentY + pageH;
      const isLastPage = rawEndY >= totalH;
      const actualEndY = isLastPage
        ? totalH
        : findBestCutRow(fullData, canvas.width, rawEndY, totalH, 90);

      const srcH = actualEndY - currentY;

      const slice = document.createElement('canvas');
      slice.width  = canvas.width;
      slice.height = pageH;

      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, currentY, canvas.width, srcH, 0, 0, canvas.width, srcH);

      const imgData = slice.toDataURL('image/jpeg', 0.93);

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_W_MM, A4_H_MM);

      currentY = actualEndY;
      pageIndex++;
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(iframe);
  }
}
