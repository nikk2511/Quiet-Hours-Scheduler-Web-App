'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  let supabase: any = null
  
  // Check if environment variables are properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || 
      !supabaseAnonKey || 
      supabaseUrl.includes('your_supabase') || 
      supabaseAnonKey.includes('your_supabase') ||
      !supabaseUrl.startsWith('http')) {
    if (!error) {
      setError('Environment variables not configured')
      setLoading(false)
    }
  } else {
    try {
      supabase = createClientSupabase()
    } catch (err) {
      if (!error) {
        setError('Supabase configuration error. Please check your environment variables.')
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!supabase || error) {
      return
    }

    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
      } catch (err) {
        setError('Failed to get user session')
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, error])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
