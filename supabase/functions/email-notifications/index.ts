import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { MongoClient } from 'https://deno.land/x/mongo@v0.32.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuietBlock {
  _id: string
  userId: string
  startDateTime: string | Date  // Can be string or Date
  endDateTime: string | Date
  description: string
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}

interface SupabaseUser {
  id: string
  email: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize MongoDB client
    const mongoUri = Deno.env.get('MONGODB_URI')!
    const mongoClient = new MongoClient()
    await mongoClient.connect(mongoUri)
    const database = mongoClient.database('quiet_hours_scheduler')
    const quietBlocksCollection = database.collection<QuietBlock>('quiet_blocks')

    const now = new Date()
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000)

    console.log(`Checking for blocks starting between ${now.toISOString()} and ${tenMinutesFromNow.toISOString()}`)

    // Get all blocks that haven't had notifications sent
    const allBlocks = await quietBlocksCollection
      .find({
        notificationSent: false
      })
      .toArray()

    // Parse time strings and filter blocks that start in the next 10 minutes
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
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const tenMinutesFromNowInMinutes = currentTimeInMinutes + 10

    // Filter blocks that start in the next 10 minutes
    const blocksNeedingNotification = allBlocks.filter(block => {
      if (typeof block.startDateTime === 'string') {
        const startTime = parseTimeString(block.startDateTime)
        const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
        return startTimeInMinutes >= currentTimeInMinutes && startTimeInMinutes <= tenMinutesFromNowInMinutes
      } else {
        // Handle Date objects (legacy)
        const startTime = new Date(block.startDateTime)
        return startTime >= now && startTime <= tenMinutesFromNow
      }
    })

    console.log(`Found ${blocksNeedingNotification.length} blocks needing notifications`)

    let notificationsSent = 0
    const errors: string[] = []

    for (const block of blocksNeedingNotification) {
      try {
        // Get user details from Supabase
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(block.userId)
        
        if (userError || !user.user?.email) {
          console.error(`Failed to get user ${block.userId}:`, userError)
          errors.push(`Failed to get user ${block.userId}`)
          continue
        }

        // Convert string times to Date objects for email
        let startDateTime: Date
        let endDateTime: Date
        
        if (typeof block.startDateTime === 'string') {
          const startTime = parseTimeString(block.startDateTime)
          const today = new Date()
          startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime.hours, startTime.minutes)
        } else {
          startDateTime = new Date(block.startDateTime)
        }
        
        if (typeof block.endDateTime === 'string') {
          const endTime = parseTimeString(block.endDateTime)
          const today = new Date()
          endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endTime.hours, endTime.minutes)
        } else {
          endDateTime = new Date(block.endDateTime)
        }

        // Send email notification
        const emailSent = await sendEmailNotification({
          email: user.user.email,
          description: block.description,
          startDateTime: startDateTime,
          endDateTime: endDateTime
        })

        if (emailSent) {
          // Mark notification as sent
          await quietBlocksCollection.updateOne(
            { _id: block._id },
            { $set: { notificationSent: true, updatedAt: now } }
          )
          
          notificationsSent++
          console.log(`Notification sent for block ${block._id} to ${user.user.email}`)
        } else {
          errors.push(`Failed to send email for block ${block._id}`)
        }
      } catch (error) {
        console.error(`Error processing block ${block._id}:`, error)
        errors.push(`Error processing block ${block._id}: ${error.message}`)
      }
    }

    await mongoClient.close()

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${blocksNeedingNotification.length} blocks, sent ${notificationsSent} notifications`,
        notificationsSent,
        totalBlocks: blocksNeedingNotification.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in email notifications function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function sendEmailNotification({
  email,
  description,
  startDateTime,
  endDateTime
}: {
  email: string
  description: string
  startDateTime: Date
  endDateTime: Date
}): Promise<boolean> {
  try {
    const startTime = startDateTime.toLocaleString()
    const endTime = endDateTime.toLocaleString()
    const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60))
    
    const subject = `🤫 Quiet Hours: "${description}" starting at ${startTime}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🤫</div>
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">Quiet Hours Reminder</h1>
          <p style="color: #64748b; margin: 8px 0 0 0;">Your study session is starting soon!</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <div style="margin: 12px 0; display: flex;">
            <span style="font-weight: 600; color: #374151; min-width: 100px;">Session:</span>
            <span style="color: #1f2937;">${description}</span>
          </div>
          <div style="margin: 12px 0; display: flex;">
            <span style="font-weight: 600; color: #374151; min-width: 100px;">Start Time:</span>
            <span style="color: #1f2937;">${startTime}</span>
          </div>
          <div style="margin: 12px 0; display: flex;">
            <span style="font-weight: 600; color: #374151; min-width: 100px;">Duration:</span>
            <span style="color: #1f2937;">${duration} minutes</span>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <p style="color: #92400e; font-weight: 500; margin: 0;">
            ⏰ This is your 10-minute reminder. Time to prepare for your focused study session!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 14px;">
          <p>Sent by <strong>Quiet Hours Scheduler</strong><br>Happy studying! 📚✨</p>
        </div>
      </div>
    `
    
    const textContent = `
🤫 QUIET HOURS REMINDER

Your study session is starting soon!

Session: ${description}
Start Time: ${startTime}
Duration: ${duration} minutes

⏰ This is your 10-minute reminder. Time to prepare for your focused study session!

--
Sent by Quiet Hours Scheduler
Happy studying! 📚✨
    `.trim()

    // Try multiple email providers in order of preference
    const providers = [
      { name: 'Resend', fn: sendEmailWithResend },
      { name: 'Brevo', fn: sendEmailWithBrevo },
      { name: 'Mailgun', fn: sendEmailWithMailgun },
      { name: 'SendGrid', fn: sendEmailWithSendGrid }
    ]

    for (const provider of providers) {
      try {
        console.log(`Attempting to send email via ${provider.name}...`)
        await provider.fn({ email, subject, htmlContent, textContent })
        console.log(`✅ Email sent successfully via ${provider.name}`)
        return true
      } catch (error) {
        console.warn(`❌ ${provider.name} failed:`, error.message)
        continue
      }
    }

    throw new Error('All email providers failed')
  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

// Email provider functions
async function sendEmailWithResend({
  email,
  subject,
  htmlContent,
  textContent
}: {
  email: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<boolean> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') || 'noreply@yourdomain.com',
      to: [email],
      subject,
      html: htmlContent,
      text: textContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return true
}

async function sendEmailWithBrevo({
  email,
  subject,
  htmlContent,
  textContent
}: {
  email: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<boolean> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY')
  
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY not configured')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': brevoApiKey,
    },
    body: JSON.stringify({
      sender: {
        email: Deno.env.get('EMAIL_FROM') || 'noreply@yourdomain.com',
        name: 'Quiet Hours Scheduler'
      },
      to: [{ email }],
      subject,
      htmlContent,
      textContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo API error: ${error}`)
  }

  return true
}

async function sendEmailWithMailgun({
  email,
  subject,
  htmlContent,
  textContent
}: {
  email: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<boolean> {
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
  
  if (!mailgunApiKey || !mailgunDomain) {
    throw new Error('Mailgun credentials not configured')
  }

  const formData = new FormData()
  formData.append('from', Deno.env.get('EMAIL_FROM') || `Quiet Hours <noreply@${mailgunDomain}>`)
  formData.append('to', email)
  formData.append('subject', subject)
  formData.append('html', htmlContent)
  formData.append('text', textContent)

  const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mailgun API error: ${error}`)
  }

  return true
}

async function sendEmailWithSendGrid({
  email,
  subject,
  htmlContent,
  textContent
}: {
  email: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<boolean> {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
  
  if (!sendGridApiKey) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const emailData = {
    personalizations: [{
      to: [{ email }],
      subject
    }],
    from: {
      email: Deno.env.get('EMAIL_FROM') || 'noreply@yourdomain.com',
      name: 'Quiet Hours Scheduler'
    },
    content: [{
      type: 'text/html',
      value: htmlContent
    }, {
      type: 'text/plain',
      value: textContent
    }]
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }

  return true
}
