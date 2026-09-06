import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import type { DocumentArtifact, TicketDocumentSnapshot } from './contracts';
import { selectTicketTemplate } from './template-rules';

function qrDataToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = Buffer.from(base64, 'base64');
  return new Uint8Array(binary);
}

export async function renderTicketDocument(snapshot: TicketDocumentSnapshot): Promise<DocumentArtifact> {
  if (!snapshot.ticketId || !snapshot.bookingId || !snapshot.passengerId || !snapshot.providerTicketId) {
    throw new Error('A ticket document requires authoritative ticket, booking, passenger, and provider ticket identities');
  }
  if (snapshot.segments.length === 0) {
    throw new Error('A ticket document requires at least one flight segment');
  }

  selectTicketTemplate({
    providerName: snapshot.providerName,
    carrierCode: snapshot.segments[0].carrierCode,
    documentType: 'ETICKET',
    currency: snapshot.currency,
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 790;
  const left = 42;

  page.drawText('EXPODIA FLIGHTS — ELECTRONIC TICKET', { x: left, y, size: 15, font: bold, color: rgb(0.07, 0.08, 0.1) });
  y -= 28;
  page.drawText(`Passenger: ${snapshot.passengerName}`, { x: left, y, size: 11, font: bold });
  y -= 18;
  page.drawText(`Provider: ${snapshot.providerName}`, { x: left, y, size: 9, font });
  page.drawText(`Booking ID: ${snapshot.bookingId}`, { x: 330, y, size: 9, font });
  y -= 16;
  page.drawText(`Provider ticket: ${snapshot.providerTicketId}`, { x: left, y, size: 9, font });
  if (snapshot.eTicketNumber) page.drawText(`E-ticket: ${snapshot.eTicketNumber}`, { x: 330, y, size: 9, font });
  y -= 28;

  page.drawText('ITINERARY', { x: left, y, size: 10, font: bold });
  y -= 18;
  for (const segment of snapshot.segments) {
    page.drawText(`${segment.carrierCode}${segment.flightNumber}`, { x: left, y, size: 10, font: bold });
    page.drawText(`${segment.originIata} → ${segment.destinationIata}`, { x: 115, y, size: 10, font });
    y -= 15;
    page.drawText(`Departure: ${segment.departureLocal}`, { x: left, y, size: 9, font });
    page.drawText(`Arrival: ${segment.arrivalLocal}`, { x: 300, y, size: 9, font });
    y -= 15;
    if (segment.cabin || segment.baggage) {
      page.drawText(`Cabin: ${segment.cabin ?? 'Provider supplied'}    Baggage: ${segment.baggage ?? 'Provider supplied'}`, { x: left, y, size: 9, font });
      y -= 15;
    }
    y -= 8;
  }

  page.drawText('FARE / PAYMENT', { x: left, y, size: 10, font: bold });
  y -= 18;
  page.drawText(snapshot.totalAmount !== undefined ? `Total: ${snapshot.totalAmount.toFixed(2)} ${snapshot.currency ?? ''}` : 'Total: Provider-supplied fare information', { x: left, y, size: 9, font });
  y -= 35;

  page.drawText('VERIFICATION', { x: left, y, size: 10, font: bold });
  y -= 16;
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/verify/${snapshot.verificationReference}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 2, width: 160 });
  const qrImage = await pdf.embedPng(qrDataToBytes(qrDataUrl));
  page.drawImage(qrImage, { x: left, y: y - 125, width: 125, height: 125 });
  page.drawText('Scan to resolve this document to the current Expodia verification record.', { x: 185, y: y - 20, size: 9, font, maxWidth: 350 });
  page.drawText(`Verification reference: ${snapshot.verificationReference}`, { x: 185, y: y - 38, size: 9, font: bold, maxWidth: 350 });
  page.drawText('This QR code is an Expodia verification link, not an airline boarding credential unless separately authorized by the provider/airline.', { x: 185, y: y - 72, size: 8, font, maxWidth: 350 });

  y -= 155;
  page.drawText('IMPORTANT TRAVEL INFORMATION', { x: left, y, size: 10, font: bold });
  y -= 17;
  page.drawText('Flight times, gates, terminals, and operational status may change after ticket issuance. Confirm current information with the booking/tracking record and the operating carrier.', { x: left, y, size: 8, font, maxWidth: 510, lineHeight: 11 });
  y -= 42;
  page.drawText(`Document version ${snapshot.documentVersion} · Generated ${snapshot.generatedAt}`, { x: left, y, size: 8, font });

  const bytes = await pdf.save();
  return {
    documentId: `doc_${snapshot.ticketId}_v${snapshot.documentVersion}`,
    filename: `${snapshot.passengerName.replace(/[^a-z0-9]+/gi, '_')}_${snapshot.ticketId}_v${snapshot.documentVersion}.pdf`,
    mimeType: 'application/pdf',
    version: snapshot.documentVersion,
    snapshot,
    bytes,
  };
}
