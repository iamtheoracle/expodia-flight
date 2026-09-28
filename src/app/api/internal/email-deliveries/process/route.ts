import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { renderTravelEmail } from '@/lib/email/renderer';
import { sendTravelEmail } from '@/lib/email/provider';
import type { TravelEmailTemplateId } from '@/lib/email/travel-templates';

export async function POST(request: Request) {
  const expected = process.env.EMAIL_WORKER_SECRET;
  const supplied = request.headers.get('x-email-worker-secret');
  if (!expected || !supplied || supplied !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from('email_deliveries').select('id, booking_id, document_id, template_id, recipient_email, subject, metadata').eq('status','QUEUED').order('created_at',{ascending:true}).limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const row of rows ?? []) {
    try {
      const metadata = (row.metadata ?? {}) as Record<string, unknown>;
      let data = (metadata.canonicalData ?? {}) as Record<string, unknown>;
      if (row.booking_id) {
        const { data: booking } = await supabase.from('bookings').select('id,pnr').eq('id',row.booking_id).maybeSingle();
        const { data: document } = row.document_id ? await supabase.from('documents').select('metadata,document_number').eq('id',row.document_id).maybeSingle() : { data: null };
        const documentMeta = (document?.metadata ?? {}) as Record<string, unknown>;
        data = { ...documentMeta, ...data, confirmation: data.confirmation ?? booking?.pnr, documentNumber: data.documentNumber ?? document?.document_number };
      }
      if (metadata.ticketId && row.booking_id) {
        const { data: ticket } = await supabase.from('tickets').select('id,passenger_id,provider_ticket_id,e_ticket_number').eq('id',String(metadata.ticketId)).maybeSingle();
        const { data: passenger } = ticket?.passenger_id ? await supabase.from('passengers').select('given_name,family_name').eq('id',ticket.passenger_id).maybeSingle() : { data: null };
        const { data: segments } = await supabase.from('flight_segments').select('flight_number,origin_iata,destination_iata,departure_local,arrival_local').eq('booking_id',row.booking_id).order('departure_local');
        const first = segments?.[0];
        data = { ...data, passenger: data.passenger ?? (passenger ? [passenger.given_name,passenger.family_name].filter(Boolean).join(' ') : undefined), ticketNumber: data.ticketNumber ?? ticket?.e_ticket_number ?? ticket?.provider_ticket_id, route: data.route ?? (first ? `${first.origin_iata} → ${first.destination_iata}` : undefined), flightNumber: data.flightNumber ?? first?.flight_number, departureTime: data.departureTime ?? first?.departure_local, arrivalTime: data.arrivalTime ?? first?.arrival_local, departureAirport: data.departureAirport ?? first?.origin_iata, arrivalAirport: data.arrivalAirport ?? first?.destination_iata };
      }
      const rendered = renderTravelEmail({ templateId: row.template_id as TravelEmailTemplateId, data, actionUrl: typeof metadata.actionUrl === 'string' ? metadata.actionUrl : null });
      const sent = await sendTravelEmail({ to: row.recipient_email, subject: row.subject ?? rendered.subject, html: rendered.html });
      await supabase.from('email_deliveries').update({ status:'SENT', provider_message_id: sent.id ?? null, sent_at:new Date().toISOString() }).eq('id',row.id);
      if (row.document_id) await supabase.from('document_events').insert({document_id:row.document_id,booking_id:row.booking_id,event_type:'EMAIL_SENT',actor_type:'SYSTEM',metadata:{deliveryId:row.id,providerMessageId:sent.id ?? null}});
      results.push({id:row.id,status:'SENT'});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'EMAIL_SEND_FAILED';
      await supabase.from('email_deliveries').update({ status:'FAILED', error_message:message }).eq('id',row.id);
      if (row.document_id) await supabase.from('document_events').insert({document_id:row.document_id,booking_id:row.booking_id,event_type:'EMAIL_FAILED',actor_type:'SYSTEM',metadata:{deliveryId:row.id,error:message}});
      results.push({id:row.id,status:'FAILED',error:message});
    }
  }
  return NextResponse.json({ processed: results.length, results });
}
