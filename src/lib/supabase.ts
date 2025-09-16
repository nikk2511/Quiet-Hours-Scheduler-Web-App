import { createBrowserClient } from '@supabase/ssr'

// For client-side usage only
export const createClientSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || 
      !supabaseAnonKey ||
      supabaseUrl.includes('your_supabase') ||
      supabaseAnonKey.includes('your_supabase') ||
      !supabaseUrl.startsWith('http')) {
    throw new Error('Supabase environment variables not properly configured. Please check your .env.local file.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
