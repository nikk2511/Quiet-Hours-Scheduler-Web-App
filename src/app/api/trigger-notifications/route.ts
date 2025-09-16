import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Call the Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/email-notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const result = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Email notifications triggered successfully',
        result
      })
    } else {
      const error = await response.text()
      return NextResponse.json(
        { 
          success: false,
          message: 'Failed to trigger email notifications',
          error 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error triggering notifications:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
