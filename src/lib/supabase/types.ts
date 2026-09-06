export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      agents: { Row: { id: string; display_name: string; email: string; created_at: string } };
      customers: { Row: { id: string; agent_id: string; email: string; phone: string | null; created_at: string; updated_at: string } };
      passengers: { Row: { id: string; customer_id: string; given_name: string; family_name: string; date_of_birth: string | null; nationality: string | null; document_number: string | null; created_at: string } };
      bookings: { Row: { id: string; agent_id: string; customer_id: string; status: string; provider_name: string | null; provider_booking_id: string | null; pnr: string | null; currency: string | null; total_amount: number | null; source: 'PRODUCTION' | 'SANDBOX'; confirmed_at: string | null; created_at: string; updated_at: string } };
      booking_passengers: { Row: { booking_id: string; passenger_id: string } };
      flight_segments: { Row: { id: string; booking_id: string; provider_name: string; provider_flight_id: string; carrier_code: string; flight_number: string; origin_iata: string; destination_iata: string; departure_local: string; arrival_local: string; duration_minutes: number | null; aircraft_code: string | null; stops: number; created_at: string } };
      tickets: { Row: { id: string; booking_id: string; passenger_id: string; provider_name: string | null; provider_ticket_id: string | null; e_ticket_number: string | null; verification_reference: string; status: 'PENDING' | 'ISSUED' | 'VOIDED'; document_version: number; issued_at: string | null; created_at: string } };
      verification_records: { Row: { id: string; ticket_id: string; verification_reference: string; active: boolean; created_at: string; last_verified_at: string | null } };
      notifications: { Row: { id: string; booking_id: string | null; passenger_id: string | null; event_key: string; channel: string; recipient: string; status: string; provider_message_id: string | null; idempotency_key: string; sent_at: string | null; created_at: string } };
      audit_events: { Row: { id: string; agent_id: string | null; booking_id: string | null; event_type: string; entity_type: string; entity_id: string; source: 'PRODUCTION' | 'SANDBOX'; provider_name: string | null; provider_request_id: string | null; metadata: Json; created_at: string } };
    };
  };
};
