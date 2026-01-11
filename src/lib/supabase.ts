import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lpqwanaptxlfygiybner.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcXdhbmFwdHhsZnlnaXlibmVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDg3NDYsImV4cCI6MjA4MzcyNDc0Nn0.2IV9e9I5rvj_yfKoayd_fcPTDPrFCrZ7BAzuV4plVHM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
