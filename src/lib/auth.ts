import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types';

/** Returns the logged-in user's profile, or null. RLS-safe (own row only). */
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (data as UserProfile) ?? null;
}

/** Redirects to /login when unauthenticated. */
export async function requireUser(): Promise<UserProfile> {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  return profile;
}

/**
 * Redirects non-admins away. Role is read server-side from the database —
 * never trusted from the client.
 */
export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireUser();
  if (profile.role !== 'admin') redirect('/dashboard');
  return profile;
}
