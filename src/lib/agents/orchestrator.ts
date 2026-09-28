import type { AgentJob, AgentResult, ExpodiaWorkerKey } from './workers';
import { getWorker } from './workers';

export interface OrchestrationContext { bookingId?: string; searchId?: string; approvedByAgent?: boolean; }
export function createAgentJob(worker: ExpodiaWorkerKey, action: string, input: Record<string, unknown>, context: OrchestrationContext = {}): AgentJob {
  const definition = getWorker(worker);
  return { worker, action, input, bookingId: context.bookingId, searchId: context.searchId, requiresHumanApproval: definition.requiresHumanApproval };
}
export function routeFlightRequest(input: { searchId?: string; bookingId?: string; requiresBooking?: boolean }): AgentJob[] {
  const jobs: AgentJob[] = [
    createAgentJob('inventory_verifier', 'verify_inventory', {}, input),
    createAgentJob('fare_verifier', 'verify_fare', {}, input),
    createAgentJob('passenger_verifier', 'verify_passengers', {}, input),
  ];
  if (input.requiresBooking) {
    jobs.push(createAgentJob('integrity_worker', 'pre_booking_integrity_check', {}, input));
    jobs.push(createAgentJob('booking_worker', 'book', {}, input));
  }
  return jobs;
}
export function routePostBookingWork(context: OrchestrationContext): AgentJob[] {
  return [
    createAgentJob('payment_worker', 'verify_payment', {}, context),
    createAgentJob('ticketing_worker', 'verify_ticketing', {}, context),
    createAgentJob('document_intelligence', 'identify_required_documents', {}, context),
    createAgentJob('document_retrieval', 'retrieve_provider_documents', {}, context),
    createAgentJob('document_verification', 'verify_document_identifiers', {}, context),
    createAgentJob('document_worker', 'prepare_documents', {}, context),
    createAgentJob('document_renderer', 'render_approved_templates', {}, context),
    createAgentJob('document_distribution', 'deliver_documents', {}, context),
    createAgentJob('communication_worker', 'notify_confirmed_events', {}, context),
    createAgentJob('integrity_worker', 'post_booking_integrity_check', {}, context),
  ];
}
export function routeTicketedTravel(context: OrchestrationContext): AgentJob[] {
  return [
    createAgentJob('flight_operations', 'track_flight', {}, context),
    createAgentJob('tracking_worker', 'publish_verified_tracking_state', {}, context),
    createAgentJob('trip_context_worker', 'evaluate_next_travel_context', {}, context),
    createAgentJob('checkin_worker', 'monitor_checkin', {}, context),
    createAgentJob('wallet_worker', 'evaluate_wallet_eligibility', {}, context),
  ];
}
export function routeContinuousDiscoveryWork(): AgentJob[] {
  return [
    createAgentJob('flight_discovery', 'monitor_assigned_sources', {}),
    createAgentJob('airport_discovery', 'monitor_assigned_sources', {}),
    createAgentJob('travel_discovery', 'monitor_assigned_sources', {}),
    createAgentJob('travel_news', 'monitor_assigned_sources', {}),
    createAgentJob('technical_update_discovery', 'monitor_assigned_sources', {}),
  ];
}

export function acceptWorkerResult(result: AgentResult): AgentJob[] {
  return result.status === 'FAILED' ? [] : result.nextJobs ?? [];
}
