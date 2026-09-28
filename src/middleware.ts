import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';
import { canAccessPath, dashboardPathForRole, type PlatformRole } from './lib/auth/route-access';

const publicPaths = [
  '/',
  '/explore',
  '/track',
  '/aviation-public',
  '/traveler',
  '/traveler/login',
  '/traveler/signup',
  '/assistant',
  '/login',
  '/access',
  '/auth/callback',
  '/auth/confirm',
];

function isPublicPath(pathname: string) {
  return publicPaths.some((path) => pathname === path) || pathname.startsWith('/verify/');
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

async function resolveRole(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<PlatformRole> {
  const [{ data: admin }, { data: agent }, { data: traveler }] = await Promise.all([
    supabase.from('company_admins').select('user_id').eq('user_id', userId).maybeSingle(),
    supabase.from('agents').select('id').eq('id', userId).maybeSingle(),
    supabase.from('traveler_profiles').select('user_id').eq('user_id', userId).maybeSingle(),
  ]);

  if (admin) return 'admin';
  if (agent) return 'agent';
  if (traveler) return 'traveler';
  return 'anonymous';
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (isPublicPath(pathname)) return response;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await resolveRole(supabase, user.id);

  // Public discovery remains public, but authenticated users are kept inside
  // their own dashboard experience when they request a private dashboard route.
  if (pathname === '/traveler' && role !== 'anonymous' && role !== 'traveler') {
    return redirectTo(request, dashboardPathForRole(role));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (role !== 'admin') return redirectTo(request, dashboardPathForRole(role));
    return response;
  }

  if (!canAccessPath(role, pathname)) {
    if (role === 'anonymous') return redirectTo(request, '/access');
    return redirectTo(request, dashboardPathForRole(role));
  }

  if (role === 'anonymous' && !isPublicPath(pathname)) {
    return redirectTo(request, '/access');
  }

  if (role === 'agent') {
    const { data: security } = await supabase
      .from('agent_security_profiles')
      .select('session_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (security?.session_expires_at && new Date(security.session_expires_at).getTime() <= Date.now()) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/access';
      loginUrl.search = '';
      loginUrl.searchParams.set('expired', '1');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
