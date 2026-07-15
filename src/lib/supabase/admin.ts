import 'server-only';

import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client — bypasses RLS. Server-side ONLY, and every code path
 * that uses it must first verify the caller is an admin (see requireAdmin).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
