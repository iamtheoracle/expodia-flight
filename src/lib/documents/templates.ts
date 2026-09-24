export type DocumentField = {
  key: string;
  label: string;
  required: boolean;
};

export type DocumentTemplate = {
  id: string;
  documentType: 'EXPODIA_RECEIPT' | 'EXPODIA_INVOICE';
  issuerType: 'EXPODIA';
  issuerName: 'Expodia';
  countryCode: string | null;
  languageCode: string;
  version: string;
  fields: readonly DocumentField[];
};

export const EXPODIA_RECEIPT_TEMPLATE: DocumentTemplate = {
  id: 'expodia-receipt',
  documentType: 'EXPODIA_RECEIPT',
  issuerType: 'EXPODIA',
  issuerName: 'Expodia',
  countryCode: null,
  languageCode: 'en',
  version: '1.0',
  fields: [
    { key: 'documentNumber', label: 'Receipt number', required: true },
    { key: 'bookingId', label: 'Booking ID', required: true },
    { key: 'customerEmail', label: 'Customer email', required: true },
    { key: 'currency', label: 'Currency', required: true },
    { key: 'amount', label: 'Amount', required: true },
    { key: 'paymentStatus', label: 'Payment status', required: true },
    { key: 'issuedAt', label: 'Issued at', required: true },
  ],
};

export function validateDocumentFields(
  template: DocumentTemplate,
  data: Record<string, unknown>,
): string[] {
  return template.fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = data[field.key];
      return value === undefined || value === null || String(value).trim() === '';
    })
    .map((field) => field.label);
}
