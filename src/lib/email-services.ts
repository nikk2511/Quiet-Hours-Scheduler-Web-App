// Email service providers - multiple options for flexibility

// Option 1: Resend (Recommended - Modern, simple API)
export async function sendEmailWithResend({
  to,
  subject,
  htmlContent,
  textContent
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) {
  const resendApiKey = process.env.RESEND_API_KEY
  
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
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return await response.json()
}

// Option 2: EmailJS (Client-side, no backend needed)
export async function sendEmailWithEmailJS({
  to,
  subject,
  htmlContent,
  templateParams = {}
}: {
  to: string
  subject: string
  htmlContent: string
  templateParams?: Record<string, any>
}) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS credentials not configured')
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: to,
        subject,
        message: htmlContent,
        ...templateParams,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`EmailJS error: ${response.statusText}`)
  }

  return { success: true }
}

// Option 3: Brevo (formerly Sendinblue) - Good free tier
export async function sendEmailWithBrevo({
  to,
  subject,
  htmlContent,
  textContent
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) {
  const brevoApiKey = process.env.BREVO_API_KEY
  
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
        email: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        name: 'Quiet Hours Scheduler'
      },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo API error: ${error}`)
  }

  return await response.json()
}

// Option 4: Mailgun - Classic choice with free tier
export async function sendEmailWithMailgun({
  to,
  subject,
  htmlContent,
  textContent
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY
  const mailgunDomain = process.env.MAILGUN_DOMAIN
  
  if (!mailgunApiKey || !mailgunDomain) {
    throw new Error('Mailgun credentials not configured')
  }

  const formData = new FormData()
  formData.append('from', process.env.EMAIL_FROM || `Quiet Hours <noreply@${mailgunDomain}>`)
  formData.append('to', to)
  formData.append('subject', subject)
  formData.append('html', htmlContent)
  formData.append('text', textContent)

  const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Mailgun API error: ${error}`)
  }

  return await response.json()
}

// Option 5: Gmail SMTP (using nodemailer)
export async function sendEmailWithGmail({
  to,
  subject,
  htmlContent,
  textContent
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) {
  const nodemailer = require('nodemailer')
  
  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD
  
  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured')
  }

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  })

  const mailOptions = {
    from: `"Quiet Hours Scheduler" <${gmailUser}>`,
    to,
    subject,
    text: textContent,
    html: htmlContent,
  }

  const result = await transporter.sendMail(mailOptions)
  return result
}

// Main email sending function - tries multiple providers
export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) {
  // Try providers in order of preference
  const providers = [
    { name: 'Resend', fn: sendEmailWithResend },
    { name: 'EmailJS', fn: sendEmailWithEmailJS },
    { name: 'Brevo', fn: sendEmailWithBrevo },
    { name: 'Mailgun', fn: sendEmailWithMailgun },
    { name: 'Gmail', fn: sendEmailWithGmail },
  ]

  for (const provider of providers) {
    try {
      console.log(`Attempting to send email via ${provider.name}...`)
      const result = await provider.fn({ to, subject, htmlContent, textContent })
      console.log(`✅ Email sent successfully via ${provider.name}`)
      return { success: true, provider: provider.name, result }
    } catch (error: any) {
      console.warn(`❌ ${provider.name} failed:`, error?.message || 'Unknown error')
      continue
    }
  }

  throw new Error('All email providers failed. Please check your configuration.')
}
