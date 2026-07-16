import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getBaseUrl } from '@/lib/url';

/**
 * Google OAuth callback. Exchanges the auth code for a session, then:
 *  - the DB trigger has already created the profile on first login
 *  - updates last_login and records a login_history row
 *  - promotes the user to admin when their email is in ADMIN_EMAILS
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Proxy-safe public origin — never the internal host, never localhost in prod.
  const origin = getBaseUrl(request);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();
      const email = data.user.email?.toLowerCase() ?? '';
      const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const updates: Record<string, unknown> = { last_login: new Date().toISOString() };
      if (adminEmails.includes(email)) updates.role = 'admin';

      await admin.from('users').update(updates).eq('id', data.user.id);
      await admin.from('login_history').insert({ user_id: data.user.id });

      // Route by real role from the database, never from the client.
      const { data: profile } = await admin
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const dest = profile?.role === 'admin' ? '/admin' : next;
      return NextResponse.redirect(`${origin}${dest.startsWith('/') ? dest : '/dashboard'}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
