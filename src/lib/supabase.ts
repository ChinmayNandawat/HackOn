import { createClient } from '@supabase/supabase-js'

// Use placeholder strings to prevent createClient from throwing a fatal error 
// when the user hasn't created their .env.local file yet.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
