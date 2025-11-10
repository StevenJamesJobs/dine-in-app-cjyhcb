import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://kvqljwfkhboqowdezzku.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cWxqd2ZraGJvcW93ZGV6emt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTgyNTksImV4cCI6MjA3ODI5NDI1OX0.xemytCE9B3qIrgQFPok8Mi-nx7aODBJqBxyD0nwOZJk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
