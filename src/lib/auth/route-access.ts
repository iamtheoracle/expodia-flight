export type PlatformRole = 'admin' | 'agent' | 'traveler' | 'anonymous';

const travelerPaths = ['/traveler', '/home', '/traveler/inbox', '/traveler/profile'];
const agentPaths = ['/agent', '/bookings', '/cart', '/passengers', '/tickets', '/documents', '/tracking', '/aviation', '/notifications', '/audit'];

function matches(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

export function requiredRoleForPath(pathname: string): PlatformRole {
  if (matches(pathname, agentPaths)) return 'agent';
  if (matches(pathname, travelerPaths)) return 'traveler';
  return 'anonymous';
}

export function canAccessPath(role: PlatformRole, pathname: string) {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return role === 'admin';
  const required = requiredRoleForPath(pathname);
  if (required === 'agent') return role === 'agent';
  if (required === 'traveler') return role === 'traveler';
  return true;
}

export function dashboardPathForRole(role: PlatformRole) {
  if (role === 'admin') return '/admin';
  if (role === 'agent') return '/agent';
  if (role === 'traveler') return '/traveler';
  return '/';
}
