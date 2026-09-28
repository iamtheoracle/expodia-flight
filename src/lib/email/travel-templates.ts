export type TravelEmailTemplateId='booking-confirmation'|'itinerary'|'payment-receipt'|'ticket-issued'|'itinerary-changed'|'cancellation'|'refund'|'boarding-pass-ready'|'trip-reminder'|'document-ready';
export type TravelEmailTemplate={id:TravelEmailTemplateId;subject:string;headline:string;eyebrow:string;actionLabel:string;requiredFields:readonly string[];htmlPath:string};
export const TRAVEL_EMAIL_TEMPLATES:readonly TravelEmailTemplate[]=[
{id:'booking-confirmation',subject:'Your trip is booked',headline:'Your trip is booked!',eyebrow:'CONFIRMATION',actionLabel:'View trip',requiredFields:['confirmation','passenger','route','flightNumber'],htmlPath:'booking-confirmation.html'},
{id:'itinerary',subject:'Your trip itinerary',headline:'Your itinerary',eyebrow:'ITINERARY',actionLabel:'View itinerary',requiredFields:['confirmation','passenger','route'],htmlPath:'itinerary.html'},
{id:'payment-receipt',subject:'Your flight booking receipt',headline:'Your flight booking receipt',eyebrow:'FLIGHT BOOKING RECEIPT',actionLabel:'View booking',requiredFields:['confirmation','amount','currency','bookingStatus','ticketingStatus'],htmlPath:'payment-receipt.html'},
{id:'ticket-issued',subject:'Your ticket is ready',headline:'Your ticket is ready',eyebrow:'TICKET ISSUED',actionLabel:'View ticket',requiredFields:['confirmation','passenger','route','flightNumber','ticketNumber'],htmlPath:'ticket-issued.html'},
{id:'itinerary-changed',subject:'Your itinerary has changed',headline:'Your itinerary has changed',eyebrow:'ITINERARY UPDATE',actionLabel:'Review changes',requiredFields:['confirmation','passenger','route'],htmlPath:'itinerary-changed.html'},
{id:'cancellation',subject:'Your trip was cancelled',headline:'Your trip was cancelled',eyebrow:'CANCELLATION',actionLabel:'View cancellation',requiredFields:['confirmation','passenger','route'],htmlPath:'cancellation.html'},
{id:'refund',subject:'Your refund update',headline:'Your refund is being processed',eyebrow:'REFUND',actionLabel:'View refund',requiredFields:['confirmation','amount','currency'],htmlPath:'refund.html'},
{id:'boarding-pass-ready',subject:'Your boarding pass is ready',headline:'Your boarding pass is ready',eyebrow:'CHECK-IN',actionLabel:'View boarding pass',requiredFields:['confirmation','passenger','flightNumber','seat'],htmlPath:'boarding-pass-ready.html'},
{id:'trip-reminder',subject:'Your trip is coming up',headline:'Your trip is coming up',eyebrow:'TRIP REMINDER',actionLabel:'Open trip',requiredFields:['confirmation','passenger','route','departureTime'],htmlPath:'trip-reminder.html'},
{id:'document-ready',subject:'Your travel document is ready',headline:'Your travel document is ready',eyebrow:'DOCUMENT',actionLabel:'Open document',requiredFields:['confirmation','passenger','documentNumber'],htmlPath:'document-ready.html'}
];
export function getTravelEmailTemplate(id:TravelEmailTemplateId){return TRAVEL_EMAIL_TEMPLATES.find(t=>t.id===id);}
