// supabaseClient.js
// This file initializes the Supabase client used throughout the application.
// It reads the Supabase URL and anon key from the Vite environment variables.
// Ensure that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are defined in your environment.

import { createClient } from '@supabase/supabase-js';

// Supabase credentials are provided via environment variables. These should be
// configured in your `.env` or deployment environment. See the Supabase docs
// for details: https://supabase.com/docs/guides/getting-started/setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client for interacting with your database.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);