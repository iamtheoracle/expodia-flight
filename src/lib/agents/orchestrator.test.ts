import { describe, expect, it } from 'vitest';
import { routeFlightRequest, routePostBookingWork, routeTicketedTravel } from './orchestrator';

describe('Expodia agent orchestration', () => {
  it('distributes pre-booking work across specialist workers', () => {
    const jobs = routeFlightRequest({ searchId: 'search-1', requiresBooking: true });
    expect(jobs.map((job) => job.worker)).toEqual([
      'inventory_verifier',
      'fare_verifier',
      'passenger_verifier',
      'integrity_worker',
      'booking_worker',
    ]);
    expect(jobs.find((job) => job.worker === 'booking_worker')?.requiresHumanApproval).toBe(true);
  });

  it('routes post-booking verification without turning ticketing into a super-agent task', () => {
    const jobs = routePostBookingWork({ bookingId: 'booking-1' });
    expect(jobs.map((job) => job.worker)).toContain('ticketing_worker');
    expect(jobs.map((job) => job.worker)).toContain('document_worker');
    expect(jobs.map((job) => job.worker)).toContain('integrity_worker');
  });

  it('routes ticketed travel into operations, check-in and wallet workers', () => {
    const jobs = routeTicketedTravel({ bookingId: 'booking-1' });
    expect(jobs.map((job) => job.worker)).toEqual([
      'flight_operations',
      'checkin_worker',
      'wallet_worker',
    ]);
  });
});
