// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Environment variables with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Error handling (sirf development me dikhe)
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl) console.error('❌ REACT_APP_SUPABASE_URL missing!');
  if (!supabaseAnonKey) console.error('❌ REACT_APP_SUPABASE_ANON_KEY missing!');
}

// Production ready client with options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 
      'X-Client-Info': 'bgmi-esports-app' 
    }
  }
});
