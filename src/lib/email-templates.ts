import { format } from 'date-fns'

export interface EmailTemplateData {
  email: string
  description: string
  startDateTime: Date
  endDateTime: Date
  userName?: string
}

export function generateEmailHTML(data: EmailTemplateData): string {
  const { description, startDateTime, endDateTime, userName } = data
  const startTime = format(startDateTime, 'EEEE, MMMM do, yyyy \'at\' h:mm a')
  const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60))
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quiet Hours Reminder</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .title {
          color: #1e40af;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 8px 0 0 0;
        }
        .content {
          background-color: #f1f5f9;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail {
          margin: 12px 0;
          display: flex;
          align-items: flex-start;
        }
        .label {
          font-weight: 600;
          color: #374151;
          min-width: 100px;
          margin-right: 16px;
        }
        .value {
          color: #1f2937;
          flex: 1;
        }
        .alert {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .alert-text {
          color: #92400e;
          font-weight: 500;
          margin: 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .tips {
          background-color: #eff6ff;
          border-radius: 6px;
          padding: 16px;
          margin: 20px 0;
        }
        .tips-title {
          color: #1e40af;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        .tips-list {
          color: #374151;
          font-size: 14px;
          margin: 0;
          padding-left: 16px;
        }
        .tips-list li {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🤫</div>
          <h1 class="title">Quiet Hours Reminder</h1>
          <p class="subtitle">Your study session is starting soon!</p>
        </div>

        <div class="content">
          <div class="detail">
            <span class="label">Session:</span>
            <span class="value">${description}</span>
          </div>
          <div class="detail">
            <span class="label">Start Time:</span>
            <span class="value">${startTime}</span>
          </div>
          <div class="detail">
            <span class="label">Duration:</span>
            <span class="value">${duration} minutes</span>
          </div>
          ${userName ? `
          <div class="detail">
            <span class="label">Student:</span>
            <span class="value">${userName}</span>
          </div>
          ` : ''}
        </div>

        <div class="alert">
          <p class="alert-text">
            ⏰ This is your 10-minute reminder. Time to prepare for your focused study session!
          </p>
        </div>

        <div class="tips">
          <h3 class="tips-title">💡 Study Session Tips</h3>
          <ul class="tips-list">
            <li>Turn off notifications on your devices</li>
            <li>Have water and any needed materials ready</li>
            <li>Find a quiet, comfortable space</li>
            <li>Take deep breaths and focus on your goals</li>
          </ul>
        </div>

        <div class="footer">
          <p>
            Sent by <strong>Quiet Hours Scheduler</strong>
            <br>
            Happy studying! 📚✨
            <br>
            <small>This is an automated reminder email.</small>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateEmailSubject(description: string, startDateTime: Date): string {
  const time = format(startDateTime, 'h:mm a')
  return `🤫 Quiet Hours: "${description}" starting at ${time}`
}

export function generatePlainTextEmail(data: EmailTemplateData): string {
  const { description, startDateTime, endDateTime } = data
  const startTime = format(startDateTime, 'EEEE, MMMM do, yyyy \'at\' h:mm a')
  const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60))
  
  return `
🤫 QUIET HOURS REMINDER

Your study session is starting soon!

Session: ${description}
Start Time: ${startTime}
Duration: ${duration} minutes

⏰ This is your 10-minute reminder. Time to prepare for your focused study session!

Study Session Tips:
• Turn off notifications on your devices
• Have water and any needed materials ready  
• Find a quiet, comfortable space
• Take deep breaths and focus on your goals

--
Sent by Quiet Hours Scheduler
Happy studying! 📚✨
  `.trim()
}
