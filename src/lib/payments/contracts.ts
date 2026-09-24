export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'SUCCEEDED' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';

export type PaymentRequest = {
  bookingId: string;
  amount: number;
  currency: string;
  customerReference?: string;
};

export type PaymentResult = {
  status: PaymentStatus;
  providerName: string;
  providerTransactionId?: string;
  amount: number;
  currency: string;
};

export interface PaymentProvider {
  readonly name: string;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(providerTransactionId: string): Promise<PaymentResult>;
  refund(providerTransactionId: string, amount?: number): Promise<PaymentResult>;
}
