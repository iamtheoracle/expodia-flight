import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { FlightReceiptData } from './flight-receipt-template';

const BLACK = rgb(0.05, 0.05, 0.05);
const DARK = rgb(0.20, 0.20, 0.20);
const MID = rgb(0.42, 0.42, 0.42);
const LIGHT = rgb(0.72, 0.72, 0.72);
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

function safe(value: unknown): string {
  return String(value ?? '').replace(/[\\\n\r]/g, ' ').trim();
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
    else if (line) { lines.push(line); line = word; }
    else {
      let chunk = '';
      for (const ch of word) {
        const nextChunk = chunk + ch;
        if (font.widthOfTextAtSize(nextChunk, size) > maxWidth && chunk) { lines.push(chunk); chunk = ch; }
        else chunk = nextChunk;
      }
      line = chunk;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function text(page: PDFPage, value: unknown, x: number, y: number, font: PDFFont, size: number, color = DARK, maxWidth?: number): number {
  const lines = maxWidth ? wrap(safe(value), font, size, maxWidth) : [safe(value)];
  lines.forEach((line, i) => page.drawText(line, { x, y: y - i * (size + 3), size, font, color }));
  return y - Math.max(1, lines.length) * (size + 3);
}

function rule(page: PDFPage, y: number, thickness = 0.7, color = LIGHT) {
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness, color });
}

function heading(page: PDFPage, label: string, y: number, bold: PDFFont): number {
  page.drawText(label.toUpperCase(), { x: MARGIN, y, size: 10, font: bold, color: BLACK });
  rule(page, y - 7);
  return y - 28;
}

function field(page: PDFPage, label: string, value: unknown, y: number, regular: PDFFont, bold: PDFFont): number {
  page.drawText(label, { x: MARGIN, y, size: 8.5, font: regular, color: MID });
  text(page, value, MARGIN + 150, y, bold, 9.5, BLACK, CONTENT_W - 150);
  return y - 25;
}

function tableRow(page: PDFPage, cells: string[], widths: number[], y: number, regular: PDFFont, bold: PDFFont, header = false): number {
  let x = MARGIN;
  const size = header ? 7.2 : 8.2;
  const font = header ? bold : regular;
  const color = header ? BLACK : DARK;
  cells.forEach((cell, i) => {
    text(page, cell, x + 5, y, font, size, color, widths[i] - 10);
    x += widths[i];
  });
  const height = header ? 22 : 32;
  page.drawLine({ start: { x: MARGIN, y: y - height + 8 }, end: { x: PAGE_W - MARGIN, y: y - height + 8 }, thickness: 0.45, color: LIGHT });
  return y - height;
}

function addFooter(page: PDFPage, pageNumber: number, totalPages: number, regular: PDFFont) {
  rule(page, 35, 0.6, LIGHT);
  page.drawText('EXPODIA FLIGHTS', { x: MARGIN, y: 21, size: 7.5, font: regular, color: MID });
  page.drawText(`Page ${pageNumber} of ${totalPages}`, { x: PAGE_W - MARGIN - 60, y: 21, size: 7.5, font: regular, color: MID });
}

function segmentLabel(segment: FlightReceiptData['segments'][number]) {
  return segment.direction === 'RETURN' ? 'Return flight' : segment.direction === 'OUTBOUND' ? 'Departure flight' : 'Flight';
}

export async function renderExpodiaFlightReceiptPdf(data: FlightReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pages: PDFPage[] = [];
  const newPage = () => {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    return page;
  };

  let page = newPage();
  let y = PAGE_H - 55;

  page.drawText('EXPODIA FLIGHTS', { x: MARGIN, y, size: 20, font: bold, color: BLACK });
  page.drawText('FLIGHT BOOKING CONFIRMATION / RECEIPT', { x: MARGIN, y: y - 22, size: 9, font: regular, color: MID });
  y -= 58;
  rule(page, y, 1, BLACK);
  y -= 28;

  page.drawText('Your flight is booked.', { x: MARGIN, y, size: 19, font: bold, color: BLACK });
  y -= 32;
  y = text(page, 'Your booking information is shown below. Keep this receipt for your travel records.', MARGIN, y, regular, 10, DARK, CONTENT_W);
  y -= 15;

  y = heading(page, 'Confirmation', y, bold);
  y = field(page, 'Itinerary #', data.bookingReference, y, regular, bold);
  y = field(page, 'Provider confirmation', data.providerBookingReference || 'Not available', y, regular, bold);
  y = field(page, 'Booking status', data.bookingStatus, y, regular, bold);
  y = field(page, 'Ticketing status', data.ticketingStatus, y, regular, bold);
  y = field(page, 'Issue date', data.issueDate, y, regular, bold);

  y -= 8;
  y = heading(page, 'Traveler details', y, bold);
  const passengerWidths = [155, 65, 115, 115, 85];
  y = tableRow(page, ['Traveler', 'Type', 'Ticket status', 'Ticket number', 'Seat'], passengerWidths, y, regular, bold, true);
  for (const passenger of data.passengers) {
    y = tableRow(page, [
      passenger.name,
      passenger.type,
      passenger.ticketStatus,
      passenger.ticketNumber || 'Pending',
      passenger.seat || 'Not assigned',
    ], passengerWidths, y, regular, bold);
    if (y < 115) { addFooter(page, pages.length, 0, regular); page = newPage(); y = PAGE_H - 55; }
  }

  if (y < 260) { addFooter(page, pages.length, 0, regular); page = newPage(); y = PAGE_H - 55; }

  y = heading(page, 'Flight itinerary', y, bold);
  const segWidths = [58, 82, 82, 64, 82, 70, 65];
  y = tableRow(page, ['Date', 'From', 'To', 'Flight', 'Departs', 'Arrives', 'Cabin'], segWidths, y, regular, bold, true);
  for (const segment of data.segments) {
    y = tableRow(page, [
      safe(segment.date),
      safe(segment.origin),
      safe(segment.destination),
      safe(segment.flightNumber),
      safe(segment.departure),
      safe(segment.arrival),
      safe(segment.cabin || 'Not supplied'),
    ], segWidths, y, regular, bold);
    y -= 3;
    page.drawText(segmentLabel(segment), { x: MARGIN + 5, y, size: 7.5, font: bold, color: MID });
    y -= 17;
    y = field(page, 'Airline / carrier', segment.carrier, y, regular, bold);
    y = field(page, 'Terminal', [segment.terminalDeparture && `Departure ${segment.terminalDeparture}`, segment.terminalArrival && `Arrival ${segment.terminalArrival}`].filter(Boolean).join(' / ') || 'Not supplied', y, regular, bold);
    y = field(page, 'Duration / stops', [segment.duration, segment.stops].filter(Boolean).join(' / ') || 'Not supplied', y, regular, bold);
    y = field(page, 'Aircraft / fare class', [segment.aircraft, segment.fareClass].filter(Boolean).join(' / ') || 'Not supplied', y, regular, bold);
    y -= 7;
    if (y < 160 && data.segments.indexOf(segment) < data.segments.length - 1) {
      addFooter(page, pages.length, 0, regular);
      page = newPage();
      y = PAGE_H - 55;
      y = heading(page, 'Flight itinerary continued', y, bold);
    }
  }

  addFooter(page, pages.length, 0, regular);
  page = newPage();
  y = PAGE_H - 55;
  page.drawText('EXPODIA FLIGHTS', { x: MARGIN, y, size: 16, font: bold, color: BLACK });
  y -= 34;

  y = heading(page, 'Price summary', y, bold);
  y = field(page, 'Total itinerary amount', `${data.currency} ${data.totalAmount}`, y, regular, bold);
  y = field(page, 'Amount paid', `${data.currency} ${data.amountPaid}`, y, regular, bold);
  y = field(page, 'Amount outstanding', `${data.currency} ${data.amountOutstanding}`, y, regular, bold);
  y = field(page, 'Payment status', data.paymentStatus, y, regular, bold);
  y = field(page, 'Payment reference', data.paymentReference || 'Not supplied', y, regular, bold);
  y = field(page, 'Payment date', data.paymentDate || 'Not supplied', y, regular, bold);

  y -= 10;
  y = heading(page, 'Ticketing details', y, bold);
  for (const passenger of data.passengers) {
    y = field(page, passenger.name, [
      passenger.providerConfirmation ? `Airline confirmation ${passenger.providerConfirmation}` : null,
      passenger.ticketNumber ? `E-ticket ${passenger.ticketNumber}` : 'E-ticket pending',
      passenger.baggage ? `Baggage ${passenger.baggage}` : null,
    ].filter(Boolean).join(' · '), y, regular, bold);
  }

  y -= 8;
  y = heading(page, 'Important information', y, bold);
  const important = [
    'Check-in and boarding requirements are determined by the operating airline and the applicable provider record.',
    'Passport, visa, transit and entry requirements are the traveler’s responsibility unless a separate Expodia service explicitly states otherwise.',
    'Terminal, gate, seat, baggage and schedule information is shown only when verified from the authoritative booking or provider record.',
    'A reservation, payment and ticket issuance are separate states. This receipt does not create an airline ticket where one has not been issued.',
  ];
  for (const note of important) {
    page.drawText('•', { x: MARGIN, y, size: 9, font: bold, color: BLACK });
    y = text(page, note, MARGIN + 12, y, regular, 8.8, DARK, CONTENT_W - 12) - 7;
  }

  y -= 4;
  y = heading(page, 'Rules and restrictions', y, bold);
  y = text(page, 'Cancellation, changes, refunds, no-show conditions, baggage allowances and other restrictions are governed by the applicable fare and provider record. Expodia does not replace or alter those conditions.', MARGIN, y, regular, 8.8, DARK, CONTENT_W);
  y -= 18;

  if (data.notes?.length) {
    y = heading(page, 'Additional information', y, bold);
    for (const note of data.notes) {
      y = text(page, `• ${note}`, MARGIN, y, regular, 8.8, DARK, CONTENT_W) - 5;
    }
  }

  y -= 8;
  y = heading(page, 'Issuer and support', y, bold);
  y = field(page, 'Issued by', data.issuer, y, regular, bold);
  y = field(page, 'Passenger email', data.customerEmail, y, regular, bold);
  y = field(page, 'Authorized agent', data.agentName || 'Not supplied', y, regular, bold);
  y = field(page, 'Agent email', data.agentEmail || 'Not supplied', y, regular, bold);
  y = field(page, 'Document reference', data.bookingReference, y, regular, bold);

  addFooter(page, pages.length, 0, regular);

  // Set the final page count now that all pages exist.
  pages.forEach((p, i) => addFooter(p, i + 1, pages.length, regular));
  return pdf.save();
}

// Backward-compatible alias for existing callers.
export async function renderExpodiaReceiptPdf(data: {
  documentNumber: string;
  bookingId: string;
  customerEmail: string;
  currency: string;
  amount: string;
  paymentStatus: string;
  issuedAt: string;
}): Promise<Uint8Array> {
  return renderExpodiaFlightReceiptPdf({
    issuer: 'Expodia Flights',
    documentTitle: 'Flight Booking Confirmation / Receipt',
    bookingReference: data.documentNumber,
    bookingStatus: 'PAYMENT_CONFIRMED',
    ticketingStatus: 'PENDING',
    issueDate: data.issuedAt,
    currency: data.currency,
    passengers: [{ name: 'Passenger information pending', type: 'Traveler', ticketStatus: 'PENDING' }],
    segments: [],
    totalAmount: data.amount,
    amountPaid: data.amount,
    amountOutstanding: '0.00',
    paymentStatus: data.paymentStatus,
    customerEmail: data.customerEmail,
  });
}
