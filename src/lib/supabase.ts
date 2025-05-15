
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnbfdfwhjcarjimkjalu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYmZkZndoamNhcmppbWtqYWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MTU3OTAsImV4cCI6MjA1NTk5MTc5MH0.GpSuGlIwRsmRXyFK2SrCQp2u8D6J2qoy0hemkn0vsBo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
