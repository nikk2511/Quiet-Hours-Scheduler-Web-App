import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'unknown',
        supabase: 'unknown'
      }
    }

    // Check database connection
    try {
      const { db } = await connectToDatabase()
      await db.admin().ping()
      healthCheck.services.database = 'healthy'
    } catch (error) {
      healthCheck.services.database = 'unhealthy'
      healthCheck.status = 'degraded'
    }

    // Check Supabase connection
    try {
      const supabase = createServiceSupabase()
      const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
      if (!error) {
        healthCheck.services.supabase = 'healthy'
      } else {
        healthCheck.services.supabase = 'unhealthy'
        healthCheck.status = 'degraded'
      }
    } catch (error) {
      healthCheck.services.supabase = 'unhealthy'
      healthCheck.status = 'degraded'
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503

    return NextResponse.json(healthCheck, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
