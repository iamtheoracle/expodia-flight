import type { SupabaseClient } from '@supabase/supabase-js';
import { getTravelEmailTemplate, type TravelEmailTemplateId } from '@/lib/email/travel-templates';

export type DocumentWorkflowEvent = 'DOCUMENT_CREATED'|'DOCUMENT_VERIFIED'|'DOCUMENT_PUBLISHED'|'DOCUMENT_DOWNLOADED'|'DOCUMENT_SUPERSEDED'|'EMAIL_QUEUED'|'EMAIL_SENT'|'EMAIL_FAILED';

export async function recordDocumentEvent(supabase: SupabaseClient,input:{documentId:string;bookingId?:string|null;eventType:DocumentWorkflowEvent;actorType:'AI'|'HUMAN_AGENT'|'SYSTEM';actorId?:string|null;metadata?:Record<string,unknown>}) {
  return supabase.from('document_events').insert({document_id:input.documentId,booking_id:input.bookingId??null,event_type:input.eventType,actor_type:input.actorType,actor_id:input.actorId??null,metadata:input.metadata??{}});
}

export async function queueTravelEmail(supabase:SupabaseClient,input:{templateId:TravelEmailTemplateId;documentId?:string|null;bookingId?:string|null;recipientEmail:string;subject?:string;canonicalData?:Record<string,unknown>;metadata?:Record<string,unknown>}) {
  const template=getTravelEmailTemplate(input.templateId);
  if(!template) throw new Error('Unknown travel email template');
  const missing=input.canonicalData ? template.requiredFields.filter((field)=>input.canonicalData?.[field]===undefined||input.canonicalData?.[field]===null||String(input.canonicalData?.[field]).trim()==='') : [];
  if(missing.length) throw new Error(`EMAIL_CANONICAL_DATA_MISSING: ${missing.join(',')}`);
  return supabase.from('email_deliveries').insert({document_id:input.documentId??null,booking_id:input.bookingId??null,template_id:template.id,template_version:'1.0',recipient_email:input.recipientEmail,subject:input.subject??template.subject,status:'QUEUED',metadata:{...(input.metadata??{}),canonicalData:input.canonicalData}}).select('id').single();
}

export function documentWorkflowTemplate(input:{documentType:string;event:string}):TravelEmailTemplateId|null {
  const map:Record<string,TravelEmailTemplateId>={BOOKING_CONFIRMED:'booking-confirmation',ITINERARY_READY:'itinerary',PAYMENT_SETTLED:'payment-receipt',TICKET_ISSUED:'ticket-issued',ITINERARY_CHANGED:'itinerary-changed',BOOKING_CANCELLED:'cancellation',REFUND_CONFIRMED:'refund',BOARDING_PASS_READY:'boarding-pass-ready',TRIP_REMINDER:'trip-reminder',DOCUMENT_READY:'document-ready'};
  return map[input.event]??null;
}
