import { getTravelEmailTemplate, type TravelEmailTemplateId } from '@/lib/email/travel-templates';

export type CanonicalTravelEmailData = Record<string, unknown>;

function esc(value: unknown) {
  return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

function requiredValue(data: CanonicalTravelEmailData, key: string) {
  const value = data[key];
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function row(label: string, value: unknown) {
  if (!requiredValue({ value }, 'value')) return '';
  return `<tr><td style="padding:8px 0;width:34%;font-size:12px">${esc(label)}</td><td style="padding:8px 0;font-size:12px;font-weight:700">${esc(value)}</td></tr>`;
}

function section(title: string, body: string) {
  return `<h2 style="font-size:17px;margin:26px 0 9px">${esc(title)}</h2><div style="border-top:1px solid #111;border-bottom:1px solid #111"><table role="presentation" style="width:100%;border-collapse:collapse">${body}</table></div>`;
}

function renderFlightReceipt(data: CanonicalTravelEmailData, actionUrl: string | null, template: ReturnType<typeof getTravelEmailTemplate>) {
  const passengers = Array.isArray(data.passengers) ? data.passengers as Array<Record<string, unknown>> : [];
  const segments = Array.isArray(data.segments) ? data.segments as Array<Record<string, unknown>> : [];

  const travelerRows = passengers.map((p) =>
    row('Traveler', p.name) +
    row('Passenger type', p.type) +
    row('Ticket status', p.ticketStatus) +
    row('Ticket number', p.ticketNumber ?? 'Pending') +
    row('Seat', p.seat)
  ).join('');

  const flightRows = segments.map((s) =>
    row('Flight', `${s.carrier ?? ''} ${s.flightNumber ?? ''}`.trim()) +
    row('Route', `${s.origin ?? ''} → ${s.destination ?? ''}`) +
    row('Date', s.date) +
    row('Departs', s.departure) +
    row('Arrives', s.arrival) +
    row('Terminal', [s.terminalDeparture, s.terminalArrival].filter(Boolean).join(' / ')) +
    row('Duration / stops', [s.duration, s.stops].filter(Boolean).join(' / ')) +
    row('Cabin / fare class', [s.cabin, s.fareClass].filter(Boolean).join(' / ')) +
    row('Aircraft', s.aircraft)
  ).join('');

  const priceRows = row('Total itinerary amount', data.totalAmount ? `${data.currency} ${data.totalAmount}` : undefined) +
    row('Amount paid', data.amountPaid ? `${data.currency} ${data.amountPaid}` : undefined) +
    row('Amount outstanding', data.amountOutstanding ? `${data.currency} ${data.amountOutstanding}` : undefined) +
    row('Payment status', data.paymentStatus);

  const paymentRows = row('Payment reference', data.paymentReference) + row('Payment date', data.paymentDate);
  const ticketRows = row('Provider confirmation', data.providerBookingReference) + row('Ticketing status', data.ticketingStatus) + row('Document reference', data.bookingReference);

  const action = actionUrl && actionUrl.startsWith('/') ? actionUrl : null;

  return {
    subject: template?.subject ?? 'Your flight booking receipt',
    html: `<!doctype html><html lang="en"><body style="margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif"><div style="max-width:680px;margin:0 auto;padding:24px 16px"><header style="padding:18px 0;border-bottom:1px solid #111"><div style="font-size:22px;font-weight:700;letter-spacing:-.03em">EXPODIA FLIGHTS</div></header><main style="padding:28px 0"><div style="font-size:12px;font-weight:700;letter-spacing:.05em">FLIGHT BOOKING RECEIPT</div><h1 style="font-size:28px;line-height:1.15;margin:8px 0 12px">Your flight booking receipt</h1><p style="font-size:14px;line-height:1.55;margin:0 0 22px">Your booking and payment information is shown below.</p>${section('Confirmation',row('Itinerary #',data.bookingReference)+row('Provider confirmation',data.providerBookingReference)+row('Booking status',data.bookingStatus)+row('Ticketing status',data.ticketingStatus)+row('Issue date',data.issueDate))}${section('Traveler details',travelerRows || row('Traveler','Passenger information pending'))}${section('Flight details',flightRows || row('Flight','Flight information pending'))}${section('Price summary',priceRows)}${section('Payment',paymentRows)}${section('Ticketing details',ticketRows)}${action ? `<p style="margin:28px 0"><a href="${esc(action)}" style="color:#111;font-weight:700">View your booking</a></p>` : ''}<p style="font-size:11px;line-height:1.5;border-top:1px solid #bbb;padding-top:16px;margin-top:28px">This email is issued by Expodia Flights for the travel record shown above. Airline and supplier-issued documents retain the identity of their actual issuer.</p></main><footer style="padding:16px 0;border-top:1px solid #111;font-size:11px">Expodia Flights · ${esc(data.customerEmail)}</footer></div></body></html>`,
  };
}

export function renderTravelEmail(input: { templateId: TravelEmailTemplateId; data: CanonicalTravelEmailData; actionUrl?: string | null }) {
  const template = getTravelEmailTemplate(input.templateId);
  if (!template) throw new Error('Unknown travel email template');

  const missing = template.requiredFields.filter((field) => !requiredValue(input.data, field));
  if (missing.length) throw new Error(`EMAIL_CANONICAL_DATA_MISSING: ${missing.join(',')}`);

  if (input.templateId === 'payment-receipt') {
    return renderFlightReceipt(input.data, input.actionUrl ?? null, template);
  }

  const d = input.data;
  const rows = [
    ['Passenger', d.passenger],
    ['Confirmation', d.confirmation],
    ['Itinerary', d.route],
    ['Flight', d.flightNumber],
    ['Departure', d.departureTime && d.departureAirport ? `${d.departureTime} · ${d.departureAirport}` : undefined],
    ['Arrival', d.arrivalTime && d.arrivalAirport ? `${d.arrivalTime} · ${d.arrivalAirport}` : undefined],
    ['Ticket', d.ticketNumber],
    ['Seat', d.seat],
    ['Amount', d.amount && d.currency ? `${d.amount} ${d.currency}` : undefined],
    ['Document', d.documentNumber],
  ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '');

  const details = rows.map(([label, value]) => row(String(label), value)).join('');
  const action = input.actionUrl && input.actionUrl.startsWith('/') ? input.actionUrl : null;

  return {
    subject: template.subject,
    html: `<!doctype html><html><body style="margin:0;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif"><div style="max-width:680px;margin:0 auto;padding:24px 16px"><header style="padding:18px 0;border-bottom:1px solid #111"><div style="font-size:22px;font-weight:700">EXPODIA FLIGHTS</div></header><main style="padding:28px 0"><div style="font-size:11px;font-weight:700;letter-spacing:.08em">${esc(template.eyebrow)}</div><h1 style="font-size:28px;line-height:1.1;margin:8px 0 12px">${esc(template.headline)}</h1><p style="font-size:14px;line-height:1.55">This message contains the verified travel information associated with your booking.</p><div style="border-top:1px solid #111;border-bottom:1px solid #111"><table style="width:100%;border-collapse:collapse">${details}</table></div>${action ? `<p style="margin:24px 0"><a href="${esc(action)}" style="color:#111;font-weight:700">${esc(template.actionLabel)}</a></p>` : ''}<p style="font-size:11px;line-height:1.5;border-top:1px solid #bbb;padding-top:16px;margin-top:24px">This email is generated from the canonical travel record. Provider-issued documents retain the identity of the actual airline, supplier, or booking provider.</p></main></div></body></html>`,
  };
}
