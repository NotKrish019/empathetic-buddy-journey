
import { createClient } from '@supabase/supabase-js';

// These values are automatically injected by Lovable when Supabase is connected
declare const SUPABASE_URL: string;
declare const SUPABASE_ANON_KEY: string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
