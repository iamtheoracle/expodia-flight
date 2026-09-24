const DEFAULT_SUPABASE_URL = 'https://tndnobfasfhbxravjmfu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_05spnoHgDDwATm-87Vxbmw_MuOzGig_';

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return { url, anonKey };
}
