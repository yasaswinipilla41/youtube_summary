import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/url';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${getBaseUrl(request)}/login`, { status: 302 });
}
