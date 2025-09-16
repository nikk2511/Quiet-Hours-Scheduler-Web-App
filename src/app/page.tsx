'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const [configError, setConfigError] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('your_supabase') || 
        supabaseAnonKey.includes('your_supabase')) {
      setConfigError(true)
      return
    }

    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (configError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚙️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Setup Required
            </h1>
            <p className="text-gray-600 mb-6">
              Environment variables are not configured. Please set up your Supabase, MongoDB, and email credentials.
            </p>
            <Link 
              href="/setup"
              className="w-full btn btn-primary py-3"
            >
              Setup Guide
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quiet Hours Scheduler
          </h1>
          <p className="text-gray-600">
            Schedule your quiet study time blocks with email reminders
          </p>
        </div>
        
        <div className="card p-6">
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="w-full btn btn-primary py-3"
            >
              Sign In
            </Link>
            
            <Link 
              href="/auth/signup"
              className="w-full btn btn-secondary py-3"
            >
              Create Account
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Get email reminders 10 minutes before your quiet study sessions start
          </p>
        </div>
      </div>
    </div>
  )
}
