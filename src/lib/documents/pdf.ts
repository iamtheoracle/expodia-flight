import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type ExpodiaReceiptData = {
  documentNumber: string;
  bookingId: string;
  customerEmail: string;
  currency: string;
  amount: string;
  paymentStatus: string;
  issuedAt: string;
};

function safeText(value: string): string {
  return value.replace(/[\\\n\r]/g, ' ').trim();
}

export async function renderExpodiaReceiptPdf(data: ExpodiaReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText('EXPODIA', { x: 48, y: 780, size: 25, font: bold, color: rgb(0.06, 0.06, 0.06) });
  page.drawText('Payment receipt', { x: 48, y: 750, size: 13, font: regular, color: rgb(0.35, 0.35, 0.33) });

  page.drawRectangle({ x: 48, y: 705, width: 499, height: 1, color: rgb(0.85, 0.85, 0.82) });

  const rows: Array<[string, string]> = [
    ['Receipt number', data.documentNumber],
    ['Booking ID', data.bookingId],
    ['Customer email', data.customerEmail],
    ['Amount', `${data.currency} ${data.amount}`],
    ['Payment status', data.paymentStatus],
    ['Issued at', data.issuedAt],
  ];

  let y = 665;
  for (const [label, value] of rows) {
    page.drawText(label, { x: 48, y, size: 9, font: regular, color: rgb(0.42, 0.42, 0.4) });
    page.drawText(safeText(value), { x: 190, y, size: 10, font: bold, color: rgb(0.08, 0.08, 0.08), maxWidth: 350 });
    y -= 42;
  }

  page.drawRectangle({ x: 48, y: y - 10, width: 499, height: 58, color: rgb(0.96, 0.96, 0.94) });
  page.drawText('This is an Expodia-issued payment receipt.', {
    x: 62, y: y + 14, size: 9, font: regular, color: rgb(0.28, 0.28, 0.26),
  });
  page.drawText('It does not represent an airline, government, visa authority, or carrier-issued ticket.', {
    x: 62, y: y - 2, size: 8, font: regular, color: rgb(0.28, 0.28, 0.26),
    maxWidth: 470,
  });

  return pdf.save();
}
