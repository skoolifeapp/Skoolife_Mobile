import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://agdhijvukjotypbjiiwe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZGhpanZ1a2pvdHlwYmppaXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjMxMzQsImV4cCI6MjA4MDE5OTEzNH0.w-tNakgwIWYj1kkXVKQVBUQRIgwIpsLhUVcp0lKxdik';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
