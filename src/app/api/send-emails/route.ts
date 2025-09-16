import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Starting email notification process...')
    
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get all blocks for this user
    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    const blocks = await collection
      .find({ userId: user.id })
      .toArray()

    // Parse time string to get hour and minute for comparison
    const parseTimeString = (timeString: string) => {
      try {
        if (typeof timeString === 'string' && timeString.includes(':')) {
          const [time, period] = timeString.split(' ')
          const [hours, minutes] = time.split(':').map(Number)
          
          let hour24 = hours
          if (period === 'AM' && hours === 12) {
            hour24 = 0
          } else if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12
          }
          
          return { hours: hour24, minutes }
        }
      } catch (error) {
        console.error('Error parsing time string:', error)
      }
      return { hours: 0, minutes: 0 }
    }

    // Get current time in minutes for comparison
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const tenMinutesFromNowInMinutes = currentTimeInMinutes + 10

    console.log('⏰ Time comparison:', {
      currentTime: now.toLocaleTimeString(),
      currentTimeInMinutes,
      tenMinutesFromNowInMinutes
    })

    // Filter blocks that start in the next 10 minutes and haven't been notified
    const blocksNeedingNotification = blocks.filter(block => {
      if (typeof block.startDateTime === 'string' && !block.notificationSent) {
        const startTime = parseTimeString(block.startDateTime)
        const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
        
        const needsNotification = startTimeInMinutes >= currentTimeInMinutes && 
                                startTimeInMinutes <= tenMinutesFromNowInMinutes
        
        console.log('🔍 Block analysis:', {
          description: block.description,
          startTime: block.startDateTime,
          startTimeInMinutes,
          needsNotification,
          notificationSent: block.notificationSent
        })
        
        return needsNotification
      }
      return false
    })

    console.log(`Found ${blocksNeedingNotification.length} blocks needing notifications`)

    let emailsSent = 0
    const errors: string[] = []

    // Send emails for each block
    for (const block of blocksNeedingNotification) {
      try {
        // Convert string time to Date for email
        const startTime = parseTimeString(block.startDateTime as string)
        const endTime = parseTimeString(block.endDateTime as string)
        
        const today = new Date()
        const startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime.hours, startTime.minutes)
        const endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endTime.hours, endTime.minutes)

        // Send email using a simple approach
        const emailSent = await sendSimpleEmail({
          to: user.email,
          subject: `🤫 Quiet Hours: "${block.description}" starting at ${block.startDateTime}`,
          text: `
🤫 QUIET HOURS REMINDER

Your study session is starting soon!

Session: ${block.description}
Start Time: ${block.startDateTime}
End Time: ${block.endDateTime}

⏰ This is your 10-minute reminder. Time to prepare for your focused study session!

--
Sent by Quiet Hours Scheduler
Happy studying! 📚✨
          `.trim()
        })

        if (emailSent) {
          // Mark notification as sent
          await collection.updateOne(
            { _id: block._id },
            { $set: { notificationSent: true, updatedAt: now } }
          )
          
          emailsSent++
          console.log(`✅ Email sent for block: ${block.description}`)
        } else {
          errors.push(`Failed to send email for block: ${block.description}`)
        }
      } catch (error) {
        console.error(`Error processing block ${block._id}:`, error)
        errors.push(`Error processing block ${block._id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Email notification process completed`,
      emailsSent,
      totalBlocks: blocksNeedingNotification.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in send-emails:', error)
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

// Email sending function using Resend API
async function sendSimpleEmail({ to, subject, text }: { to: string, subject: string, text: string }): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return false
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        to: [to],
        subject,
        text,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🤫</div>
              <h1 style="color: #1e40af; font-size: 24px; margin: 0;">Quiet Hours Reminder</h1>
              <p style="color: #64748b; margin: 8px 0 0 0;">Your study session is starting soon!</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${text}</pre>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
              <p>Sent by <strong>Quiet Hours Scheduler</strong><br>Happy studying! 📚✨</p>
            </div>
          </div>
        `
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    const result = await response.json()
    console.log('✅ Email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
