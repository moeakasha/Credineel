import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Client Configuration
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * To set up:
 * 1. Create a .env file in the project root
 * 2. Add your Supabase credentials:
 *    VITE_SUPABASE_URL=https://your-project.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')

// Create Supabase client
let supabase

if (!isSupabaseConfigured) {
  console.error(
    '❌ Supabase is not configured!'
  )
  console.error(
    'Please create a .env file in the project root with:'
  )
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.error('')
  console.error('Get your credentials from: https://app.supabase.com/project/_/settings/api')
  
  // Create a client that will fail gracefully
  // This prevents crashes but authentication won't work
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Export a flag to check if Supabase is configured
export const isConfigured = isSupabaseConfigured

export { supabase }
export default supabase
