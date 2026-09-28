export const EXPODIA_WORKERS = [
  { key: 'orchestrator', capability: 'Route and coordinate travel operations', requiresHumanApproval: false },
  { key: 'inventory_verifier', capability: 'Search, normalize and verify provider inventory', requiresHumanApproval: false },
  { key: 'fare_verifier', capability: 'Verify fares, baggage and fare conditions', requiresHumanApproval: false },
  { key: 'passenger_verifier', capability: 'Validate passenger and travel-document completeness', requiresHumanApproval: false },
  { key: 'booking_worker', capability: 'Execute provider booking operations', requiresHumanApproval: true },
  { key: 'payment_worker', capability: 'Track and verify payment state', requiresHumanApproval: false },
  { key: 'ticketing_worker', capability: 'Verify provider ticket issuance', requiresHumanApproval: false },
  { key: 'document_worker', capability: 'Generate versioned Expodia travel documents from authoritative snapshots', requiresHumanApproval: false },
  { key: 'document_intelligence', capability: 'Identify required documents and their issuer', requiresHumanApproval: false },
  { key: 'document_retrieval', capability: 'Retrieve provider-issued travel documents when available', requiresHumanApproval: false },
  { key: 'document_verification', capability: 'Verify document identifiers and source data', requiresHumanApproval: false },
  { key: 'document_renderer', capability: 'Render approved Expodia document templates from verified data', requiresHumanApproval: false },
  { key: 'document_distribution', capability: 'Deliver canonical documents to authorized passengers and agents by app and email', requiresHumanApproval: false },
  { key: 'wallet_worker', capability: 'Issue eligible Apple Wallet and Google Wallet passes', requiresHumanApproval: false },
  { key: 'flight_operations', capability: 'Track provider-supplied operational flight status', requiresHumanApproval: false },
  { key: 'tracking_worker', capability: 'Resolve authorized journey tracking and publish verified tracking state', requiresHumanApproval: false },
  { key: 'trip_context_worker', capability: 'Maintain journey lifecycle context and determine relevant next travel workflows', requiresHumanApproval: false },
  { key: 'checkin_worker', capability: 'Monitor and process supported check-in workflows', requiresHumanApproval: true },
  { key: 'change_worker', capability: 'Coordinate provider-supported itinerary changes', requiresHumanApproval: true },
  { key: 'refund_worker', capability: 'Coordinate cancellation and refund workflows', requiresHumanApproval: true },
  { key: 'communication_worker', capability: 'Send customer communications from verified events', requiresHumanApproval: false },
  { key: 'integrity_worker', capability: 'Cross-check identifiers and block inconsistent outputs', requiresHumanApproval: false },
  { key: 'flight_discovery', capability: 'Continuously discover meaningful flight and route changes', requiresHumanApproval: false },
  { key: 'airport_discovery', capability: 'Continuously monitor airport and aviation updates', requiresHumanApproval: false },
  { key: 'travel_discovery', capability: 'Continuously discover hotels, destinations, places, tours, activities and experiences', requiresHumanApproval: false },
  { key: 'travel_news', capability: 'Continuously monitor and reconcile travel news updates', requiresHumanApproval: false },
  { key: 'technical_update_discovery', capability: 'Monitor assigned technical sources for new commits, releases and documentation changes', requiresHumanApproval: false },
] as const;

export type ExpodiaWorkerKey = (typeof EXPODIA_WORKERS)[number]['key'];
export type AgentRunStatus = 'STARTED' | 'SUCCEEDED' | 'FAILED' | 'REQUIRES_REVIEW';
export interface AgentJob { worker: ExpodiaWorkerKey; action: string; bookingId?: string; searchId?: string; input: Record<string, unknown>; requiresHumanApproval?: boolean; }
export interface AgentResult { worker: ExpodiaWorkerKey; action: string; status: AgentRunStatus; output: Record<string, unknown>; nextJobs?: AgentJob[]; reason?: string; }
export function getWorker(key: ExpodiaWorkerKey) { return EXPODIA_WORKERS.find((worker) => worker.key === key)!; }
