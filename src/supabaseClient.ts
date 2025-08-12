import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://takmfbrafitgeyfumdto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha21mYnJhZml0Z2V5ZnVtZHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDEzMzQsImV4cCI6MjA3MDUxNzMzNH0.rDKJnLDDKQSxFRwb2du_nvvF2FJNrrZOPwrr51bbSdk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);