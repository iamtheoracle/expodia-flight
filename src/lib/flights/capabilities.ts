export type ProviderCapability =
  | 'SEARCH'
  | 'REVALIDATE'
  | 'HOLD'
  | 'BOOK'
  | 'TICKET'
  | 'MODIFY'
  | 'CANCEL'
  | 'REFUND';

export type ProviderCapabilitySet = ReadonlySet<ProviderCapability>;
