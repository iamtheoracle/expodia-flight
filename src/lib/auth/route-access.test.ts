import { describe, expect, it } from 'vitest';
import { canAccessPath, dashboardPathForRole, requiredRoleForPath } from './route-access';

describe('platform dashboard boundaries', () => {
  it('assigns operational routes to agents', () => {
    expect(requiredRoleForPath('/bookings')).toBe('agent');
    expect(requiredRoleForPath('/bookings/new')).toBe('agent');
    expect(requiredRoleForPath('/agent')).toBe('agent');
  });

  it('assigns private journey routes to travelers', () => {
    expect(requiredRoleForPath('/traveler')).toBe('traveler');
    expect(requiredRoleForPath('/home')).toBe('traveler');
    expect(requiredRoleForPath('/traveler/profile')).toBe('traveler');
  });

  it('keeps dashboard experiences mutually exclusive', () => {
    expect(canAccessPath('traveler', '/bookings')).toBe(false);
    expect(canAccessPath('traveler', '/admin')).toBe(false);
    expect(canAccessPath('agent', '/traveler')).toBe(false);
    expect(canAccessPath('agent', '/admin')).toBe(false);
    expect(canAccessPath('admin', '/agent')).toBe(false);
    expect(canAccessPath('admin', '/traveler')).toBe(false);
  });

  it('maps authenticated roles to their own dashboard', () => {
    expect(dashboardPathForRole('traveler')).toBe('/traveler');
    expect(dashboardPathForRole('agent')).toBe('/agent');
    expect(dashboardPathForRole('admin')).toBe('/admin');
  });
});
