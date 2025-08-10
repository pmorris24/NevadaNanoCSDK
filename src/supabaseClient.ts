import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wjvcaypkgxxvylsahkrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdmNheXBrZ3h4dnlsc2Foa3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTI3OTEsImV4cCI6MjA2ODY2ODc5MX0.NiszFReDiqYeMUSYhbtPKdfOUfiSsCYDIahNqTWGwac';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 