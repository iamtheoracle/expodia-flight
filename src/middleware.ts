import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';

const publicPaths = ['/', '/explore', '/track', '/aviation-public', '/traveler', '/traveler/login', '/traveler/signup', '/traveler/profile', '/traveler/inbox', '/assistant', '/login', '/access', '/auth/callback', '/auth/confirm'];

function isPublicPath(pathname: string) {
  return publicPaths.some((path) => pathname === path || pathname.startsWith('/verify/'));
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

  if (!isPublicPath(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: agent } = await supabase.from('agents').select('id').eq('id', user.id).maybeSingle();
    if (!agent) {
      const travelerUrl = request.nextUrl.clone();
      travelerUrl.pathname = '/traveler';
      travelerUrl.search = '';
      return NextResponse.redirect(travelerUrl);
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      const { data: admin } = await supabase
        .from('company_admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!admin) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = '/';
        homeUrl.search = '';
        return NextResponse.redirect(homeUrl);
      }
    }

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
