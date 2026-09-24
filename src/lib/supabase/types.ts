export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          action: string
          agent_id: string | null
          agent_name: string
          booking_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          input_metadata: Json
          output_metadata: Json
          search_id: string | null
          status: string
        }
        Insert: {
          action: string
          agent_id?: string | null
          agent_name: string
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          input_metadata?: Json
          output_metadata?: Json
          search_id?: string | null
          status: string
        }
        Update: {
          action?: string
          agent_id?: string | null
          agent_name?: string
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          input_metadata?: Json
          output_metadata?: Json
          search_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_runs_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "flight_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          agent_id: string | null
          booking_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          provider_name: string | null
          provider_request_id: string | null
          source: Database["public"]["Enums"]["data_source"]
        }
        Insert: {
          agent_id?: string | null
          booking_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          provider_name?: string | null
          provider_request_id?: string | null
          source?: Database["public"]["Enums"]["data_source"]
        }
        Update: {
          agent_id?: string | null
          booking_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          provider_name?: string | null
          provider_request_id?: string | null
          source?: Database["public"]["Enums"]["data_source"]
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_events: {
        Row: {
          actor_type: string
          agent_id: string
          booking_id: string
          created_at: string
          from_status: string | null
          id: string
          metadata: Json
          to_status: string
        }
        Insert: {
          actor_type: string
          agent_id: string
          booking_id: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          to_status: string
        }
        Update: {
          actor_type?: string
          agent_id?: string
          booking_id?: string
          created_at?: string
          from_status?: string | null
          id?: string
          metadata?: Json
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_passengers: {
        Row: {
          booking_id: string
          passenger_id: string
        }
        Insert: {
          booking_id: string
          passenger_id: string
        }
        Update: {
          booking_id?: string
          passenger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_passengers_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agent_id: string
          confirmed_at: string | null
          created_at: string
          currency: string | null
          customer_id: string
          id: string
          pnr: string | null
          provider_booking_id: string | null
          provider_name: string | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id: string
          id?: string
          pnr?: string | null
          provider_booking_id?: string | null
          provider_name?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string
          id?: string
          pnr?: string | null
          provider_booking_id?: string | null
          provider_name?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          offer_id: string
          quantity: number
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          offer_id: string
          quantity?: number
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          offer_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "flight_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          agent_id: string
          created_at: string
          currency: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          currency: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          currency?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          agent_id: string
          created_at: string
          email: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          country_code: string | null
          created_at: string
          document_type: string
          id: string
          issuer_name: string | null
          issuer_type: string
          language_code: string
          required_fields: Json
          source_reference: string | null
          status: string
          version: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          document_type: string
          id: string
          issuer_name?: string | null
          issuer_type: string
          language_code?: string
          required_fields?: Json
          source_reference?: string | null
          status?: string
          version: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          document_type?: string
          id?: string
          issuer_name?: string | null
          issuer_type?: string
          language_code?: string
          required_fields?: Json
          source_reference?: string | null
          status?: string
          version?: string
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          content_hash: string | null
          created_at: string
          document_id: string
          id: string
          status: string
          storage_path: string | null
          version: number
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          document_id: string
          id?: string
          status: string
          storage_path?: string | null
          version: number
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          document_id?: string
          id?: string
          status?: string
          storage_path?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          agent_id: string
          booking_id: string | null
          content_hash: string | null
          country_code: string | null
          created_at: string
          document_number: string
          document_type: string
          document_version: number
          id: string
          issued_at: string | null
          issuer_name: string | null
          issuer_type: string
          language_code: string
          metadata: Json
          mime_type: string
          status: string
          storage_path: string | null
          supersedes_document_id: string | null
          template_id: string | null
          template_version: string | null
        }
        Insert: {
          agent_id: string
          booking_id?: string | null
          content_hash?: string | null
          country_code?: string | null
          created_at?: string
          document_number: string
          document_type: string
          document_version?: number
          id?: string
          issued_at?: string | null
          issuer_name?: string | null
          issuer_type?: string
          language_code?: string
          metadata?: Json
          mime_type?: string
          status?: string
          storage_path?: string | null
          supersedes_document_id?: string | null
          template_id?: string | null
          template_version?: string | null
        }
        Update: {
          agent_id?: string
          booking_id?: string | null
          content_hash?: string | null
          country_code?: string | null
          created_at?: string
          document_number?: string
          document_type?: string
          document_version?: number
          id?: string
          issued_at?: string | null
          issuer_name?: string | null
          issuer_type?: string
          language_code?: string
          metadata?: Json
          mime_type?: string
          status?: string
          storage_path?: string | null
          supersedes_document_id?: string | null
          template_id?: string | null
          template_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_supersedes_document_id_fkey"
            columns: ["supersedes_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      external_references: {
        Row: {
          agent_id: string
          booking_id: string | null
          created_at: string
          id: string
          provider_name: string
          reference_type: string
          reference_value: string
        }
        Insert: {
          agent_id: string
          booking_id?: string | null
          created_at?: string
          id?: string
          provider_name: string
          reference_type: string
          reference_value: string
        }
        Update: {
          agent_id?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          provider_name?: string
          reference_type?: string
          reference_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_references_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_references_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_offer_segments: {
        Row: {
          aircraft_code: string | null
          arrival_local: string
          carrier_code: string
          created_at: string
          departure_local: string
          destination_iata: string
          duration_minutes: number | null
          flight_number: string
          id: string
          offer_id: string
          origin_iata: string
          provider_flight_id: string
          segment_order: number
          stops: number
        }
        Insert: {
          aircraft_code?: string | null
          arrival_local: string
          carrier_code: string
          created_at?: string
          departure_local: string
          destination_iata: string
          duration_minutes?: number | null
          flight_number: string
          id?: string
          offer_id: string
          origin_iata: string
          provider_flight_id: string
          segment_order: number
          stops?: number
        }
        Update: {
          aircraft_code?: string | null
          arrival_local?: string
          carrier_code?: string
          created_at?: string
          departure_local?: string
          destination_iata?: string
          duration_minutes?: number | null
          flight_number?: string
          id?: string
          offer_id?: string
          origin_iata?: string
          provider_flight_id?: string
          segment_order?: number
          stops?: number
        }
        Relationships: [
          {
            foreignKeyName: "flight_offer_segments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "flight_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_offers: {
        Row: {
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          provider_name: string
          provider_offer_id: string
          raw_offer: Json
          search_id: string | null
          source: Database["public"]["Enums"]["data_source"]
          total_amount: number
        }
        Insert: {
          created_at?: string
          currency: string
          expires_at?: string | null
          id: string
          provider_name: string
          provider_offer_id: string
          raw_offer?: Json
          search_id?: string | null
          source: Database["public"]["Enums"]["data_source"]
          total_amount: number
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          provider_name?: string
          provider_offer_id?: string
          raw_offer?: Json
          search_id?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "flight_offers_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "flight_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_searches: {
        Row: {
          adults: number
          agent_id: string
          cabin: string
          children: number
          created_at: string
          departure_date: string
          destination_iata: string
          id: string
          infants: number
          origin_iata: string
          return_date: string | null
          trip_type: string
        }
        Insert: {
          adults: number
          agent_id: string
          cabin: string
          children?: number
          created_at?: string
          departure_date: string
          destination_iata: string
          id?: string
          infants?: number
          origin_iata: string
          return_date?: string | null
          trip_type: string
        }
        Update: {
          adults?: number
          agent_id?: string
          cabin?: string
          children?: number
          created_at?: string
          departure_date?: string
          destination_iata?: string
          id?: string
          infants?: number
          origin_iata?: string
          return_date?: string | null
          trip_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_searches_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_segments: {
        Row: {
          aircraft_code: string | null
          arrival_local: string
          booking_id: string
          carrier_code: string
          created_at: string
          departure_local: string
          destination_iata: string
          duration_minutes: number | null
          flight_number: string
          id: string
          origin_iata: string
          provider_flight_id: string
          provider_name: string
          stops: number
        }
        Insert: {
          aircraft_code?: string | null
          arrival_local: string
          booking_id: string
          carrier_code: string
          created_at?: string
          departure_local: string
          destination_iata: string
          duration_minutes?: number | null
          flight_number: string
          id?: string
          origin_iata: string
          provider_flight_id: string
          provider_name: string
          stops?: number
        }
        Update: {
          aircraft_code?: string | null
          arrival_local?: string
          booking_id?: string
          carrier_code?: string
          created_at?: string
          departure_local?: string
          destination_iata?: string
          duration_minutes?: number | null
          flight_number?: string
          id?: string
          origin_iata?: string
          provider_flight_id?: string
          provider_name?: string
          stops?: number
        }
        Relationships: [
          {
            foreignKeyName: "flight_segments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          channel: string
          created_at: string
          event_key: string
          id: string
          idempotency_key: string
          passenger_id: string | null
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          channel: string
          created_at?: string
          event_key: string
          id?: string
          idempotency_key: string
          passenger_id?: string | null
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status: string
        }
        Update: {
          booking_id?: string | null
          channel?: string
          created_at?: string
          event_key?: string
          id?: string
          idempotency_key?: string
          passenger_id?: string | null
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          created_at: string
          customer_id: string
          date_of_birth: string | null
          document_number: string | null
          family_name: string
          given_name: string
          id: string
          nationality: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          date_of_birth?: string | null
          document_number?: string | null
          family_name: string
          given_name: string
          id?: string
          nationality?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          date_of_birth?: string | null
          document_number?: string | null
          family_name?: string
          given_name?: string
          id?: string
          nationality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passengers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          agent_id: string
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          provider_name: string | null
          provider_transaction_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount: number
          booking_id?: string | null
          created_at?: string
          currency: string
          id?: string
          provider_name?: string | null
          provider_transaction_id?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          provider_name?: string | null
          provider_transaction_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          booking_id: string
          created_at: string
          document_version: number
          e_ticket_number: string | null
          id: string
          issued_at: string | null
          passenger_id: string
          provider_name: string | null
          provider_ticket_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          verification_reference: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          document_version?: number
          e_ticket_number?: string | null
          id?: string
          issued_at?: string | null
          passenger_id: string
          provider_name?: string | null
          provider_ticket_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          verification_reference: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          document_version?: number
          e_ticket_number?: string | null
          id?: string
          issued_at?: string | null
          passenger_id?: string
          provider_name?: string | null
          provider_ticket_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          verification_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_booking_id_passenger_id_fkey"
            columns: ["booking_id", "passenger_id"]
            isOneToOne: false
            referencedRelation: "booking_passengers"
            referencedColumns: ["booking_id", "passenger_id"]
          },
          {
            foreignKeyName: "tickets_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "passengers"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_records: {
        Row: {
          active: boolean
          created_at: string
          id: string
          last_verified_at: string | null
          ticket_id: string
          verification_reference: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          last_verified_at?: string | null
          ticket_id: string
          verification_reference: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          last_verified_at?: string | null
          ticket_id?: string
          verification_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_records_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "SEARCHING"
        | "PRICE_CHECK"
        | "AWAITING_CONFIRMATION"
        | "CONFIRMED"
        | "TICKET_PENDING"
        | "TICKETED"
        | "FAILED"
        | "CANCELLED"
        | "EXPIRED"
        | "REFUND_PENDING"
        | "REFUNDED"
        | "DRAFT"
        | "CART"
        | "PASSENGERS_PENDING"
        | "VERIFICATION_PENDING"
        | "PAYMENT_PENDING"
        | "PAYMENT_CONFIRMED"
        | "BOOKING_PENDING"
        | "TICKETING_PENDING"
        | "COMPLETED"
        | "CANCEL_REQUESTED"
        | "REQUIRES_REVIEW"
      data_source: "PRODUCTION" | "SANDBOX"
      ticket_status: "PENDING" | "ISSUED" | "VOIDED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "SEARCHING",
        "PRICE_CHECK",
        "AWAITING_CONFIRMATION",
        "CONFIRMED",
        "TICKET_PENDING",
        "TICKETED",
        "FAILED",
        "CANCELLED",
        "EXPIRED",
        "REFUND_PENDING",
        "REFUNDED",
        "DRAFT",
        "CART",
        "PASSENGERS_PENDING",
        "VERIFICATION_PENDING",
        "PAYMENT_PENDING",
        "PAYMENT_CONFIRMED",
        "BOOKING_PENDING",
        "TICKETING_PENDING",
        "COMPLETED",
        "CANCEL_REQUESTED",
        "REQUIRES_REVIEW",
      ],
      data_source: ["PRODUCTION", "SANDBOX"],
      ticket_status: ["PENDING", "ISSUED", "VOIDED"],
    },
  },
} as const
