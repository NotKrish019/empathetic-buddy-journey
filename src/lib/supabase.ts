
import { createClient } from '@supabase/supabase-js';

// Add debug logs to check if values are available
console.log('Available environment variables:', {
  supabaseUrl: window.SUPABASE_URL,
  supabaseKey: window.SUPABASE_ANON_KEY
});

// Define the variables on the window object
declare global {
  interface Window {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}

export const supabase = createClient(window.SUPABASE_URL || '', window.SUPABASE_ANON_KEY || '');

