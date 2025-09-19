import { createClient } from '@supabase/supabase-js';

// NOTE TO USER:
// Replace these placeholder values with your actual Supabase project URL and anon key.
// You can find these in your Supabase project settings under "API".
// For production, it's highly recommended to use environment variables instead of hardcoding keys.
const supabaseUrl: string = 'https://tbejhfaulahwwutupsvz.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZWpoZmF1bGFod3d1dHVwc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjQ5NTUsImV4cCI6MjA3Mzg0MDk1NX0.x2dzetFwiYavP2uIf741goJr5gqRkuIas-vDORwKeuM';

// FIX: Explicitly type constants as `string` to prevent literal type comparison errors.
export const isSupabaseConfigured =
  supabaseUrl !== 'https://your-project-url.supabase.co' &&
  supabaseKey !== 'your-anon-key';


// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
