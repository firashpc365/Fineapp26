/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// VITE SPECIFIC: Use import.meta.env instead of process.env
// Fixed: Added vite/client reference to support import.meta.env types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to placeholder to prevent crash if env vars are missing
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseKey || 'placeholder';

export const supabase = createClient(url, key);