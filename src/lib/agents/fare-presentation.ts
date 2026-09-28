export interface FarePresentationInput {
  supplierAmount: number;
  supplierCurrency: string;
  approvedCustomerPrice?: number;
  approvedCustomerCurrency?: string;
  discountAmount?: number;
  discountCurrency?: string;
  source: 'SUPPLIER' | 'APPROVED_MARKUP' | 'APPROVED_DISCOUNT' | 'AGENT_CONFIGURED';
}

export interface FarePresentation {
  supplierAmount: number;
  supplierCurrency: string;
  customerAmount: number;
  customerCurrency: string;
  discountAmount?: number;
  discountCurrency?: string;
  source: FarePresentationInput['source'];
}

export function presentFare(input: FarePresentationInput): FarePresentation {
  if (input.approvedCustomerPrice == null) {
    return {
      supplierAmount: input.supplierAmount,
      supplierCurrency: input.supplierCurrency,
      customerAmount: input.supplierAmount,
      customerCurrency: input.supplierCurrency,
      source: 'SUPPLIER',
    };
  }

  if (input.approvedCustomerPrice < 0) {
    throw new Error('Customer price cannot be negative.');
  }

  return {
    supplierAmount: input.supplierAmount,
    supplierCurrency: input.supplierCurrency,
    customerAmount: input.approvedCustomerPrice,
    customerCurrency: input.approvedCustomerCurrency ?? input.supplierCurrency,
    discountAmount: input.discountAmount,
    discountCurrency: input.discountCurrency,
    source: input.source,
  };
}
