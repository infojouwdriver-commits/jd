import {create as createQr} from 'qrcode';
import type {jsPDF} from 'jspdf';

// Local vector QR: no network request, tracking pixel or third-party QR service.
// Four modules of white quiet zone are part of the requested physical size.
export function drawPdfQr(doc: jsPDF, url: string, x: number, y: number, size: number) {
  const qr = createQr(url, {errorCorrectionLevel: 'M'});
  const unit = size / (qr.modules.size + 8);
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, size, size, 'F');
  doc.setFillColor(0, 0, 0);
  for (let row = 0; row < qr.modules.size; row++) {
    for (let col = 0; col < qr.modules.size; col++) {
      if (qr.modules.get(row, col)) doc.rect(x + (col + 4) * unit, y + (row + 4) * unit, unit, unit, 'F');
    }
  }
  doc.link(x, y, size, size, {url});
}
