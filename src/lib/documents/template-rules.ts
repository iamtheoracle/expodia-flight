import type { TicketTemplateContext, TicketTemplateSelection } from './contracts';

export function selectTicketTemplate(context: TicketTemplateContext): TicketTemplateSelection {
  const normalizedProvider = context.providerName.trim().toLowerCase();
  const normalizedCarrier = context.carrierCode.trim().toUpperCase();

  if (!normalizedProvider || !normalizedCarrier) {
    throw new Error('Provider and carrier are required for ticket template selection');
  }

  // Provider-required and carrier-specific templates can be registered here when their documented formats are supplied.
  // Until then, use only the controlled Expodia standard e-ticket document.
  return {
    templateId: 'expodia-standard-eticket-v1',
    reason: 'No provider-required or carrier-specific documented template is configured; controlled standard e-ticket template selected.',
  };
}
