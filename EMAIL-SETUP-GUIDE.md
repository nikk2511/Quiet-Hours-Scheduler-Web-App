# 📧 Email Service Setup Guide

Choose one of these **FREE** email services for sending notifications. We recommend **Resend** as it's the easiest to set up!

## 🚀 Option 1: Resend (Recommended - Easiest Setup)

**Why Resend?** Modern, developer-friendly API with generous free tier (3,000 emails/month).

### Setup Steps:
1. **Sign up**: Go to [resend.com](https://resend.com) → Sign up for free
2. **Create API Key**: 
   - Go to API Keys → Create API Key
   - Copy the key (starts with `re_...`)
3. **Add to `.env.local`**:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```
4. **Domain setup (optional)**: 
   - For production, add your domain in Resend dashboard
   - For testing, use the default domain

**✅ That's it! No complex setup needed.**

---

## 📨 Option 2: EmailJS (Completely Free - No Backend)

**Why EmailJS?** Works entirely from the frontend, completely free with no limits for personal use.

### Setup Steps:
1. **Sign up**: Go to [emailjs.com](https://www.emailjs.com) → Create account
2. **Create Email Service**:
   - Go to Email Services → Add New Service
   - Choose Gmail/Outlook/Yahoo (your email provider)
   - Connect your email account
3. **Create Email Template**:
   - Go to Email Templates → Create New Template
   - Template ID: `quiet_hours_reminder`
   - Template content:
   ```html
   Subject: {{subject}}
   
   To: {{to_email}}
   
   {{message}}
   ```
4. **Get Your IDs**:
   - Public Key: Account → General → Public Key
   - Service ID: From your service
   - Template ID: From your template
5. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_your_service_id
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_your_template_id
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
   ```

---

## 💌 Option 3: Brevo (formerly Sendinblue)

**Why Brevo?** Good free tier (300 emails/day) with reliable delivery.

### Setup Steps:
1. **Sign up**: Go to [brevo.com](https://www.brevo.com) → Free plan
2. **Get API Key**:
   - Go to Account → SMTP & API → API Keys
   - Create new API key
3. **Add to `.env.local`**:
   ```env
   BREVO_API_KEY=xkeysib-your_actual_api_key_here
   EMAIL_FROM=your_email@gmail.com
   ```
4. **Verify your email**: Add your sending email in Senders & IP

---

## 📫 Option 4: Mailgun

**Why Mailgun?** Classic choice with 5,000 free emails for 3 months.

### Setup Steps:
1. **Sign up**: Go to [mailgun.com](https://www.mailgun.com) → Free trial
2. **Get API Key & Domain**:
   - API Key: Settings → API Security → Private API Key
   - Domain: Use the sandbox domain provided (for testing)
3. **Add to `.env.local`**:
   ```env
   MAILGUN_API_KEY=your_actual_api_key_here
   MAILGUN_DOMAIN=sandbox123.mailgun.org
   EMAIL_FROM=noreply@sandbox123.mailgun.org
   ```

---

## 📬 Option 5: Gmail SMTP (Use Your Gmail)

**Why Gmail?** Use your existing Gmail account, completely free.

### Setup Steps:
1. **Enable 2-Factor Authentication**:
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn On
2. **Create App Password**:
   - Security → App passwords
   - Create password for "Mail"
   - Copy the 16-character password
3. **Add to `.env.local`**:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   EMAIL_FROM=your_email@gmail.com
   ```

---

## 🧪 Testing Your Setup

After configuring any service:

1. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Create a test quiet block**:
   - Set it to start in 12-15 minutes
   - Wait for the notification

3. **Check logs** in your terminal for email sending status

---

## 🏆 Our Recommendations

### For Development/Testing:
1. **Resend** - Easiest setup, generous free tier
2. **EmailJS** - No backend needed, completely free
3. **Gmail SMTP** - Use your existing account

### For Production:
1. **Resend** - Professional, reliable
2. **Brevo** - Good for higher volumes
3. **Mailgun** - Enterprise features

---

## 🔧 Troubleshooting

### "API Key Invalid" errors:
- Double-check you copied the full API key
- Make sure no spaces before/after the key
- Restart your development server

### "Domain not verified" errors:
- Use the service's default domain for testing
- Add your domain in the service dashboard for production

### Gmail "Less secure app" errors:
- Make sure 2FA is enabled
- Use App Password, not your regular password
- Allow "Less secure apps" if needed

### Still not working?
- Check the terminal logs for detailed error messages
- Try a different email service
- The app will automatically try multiple providers

---

## 💡 Pro Tips

1. **Start with Resend** - It's the most beginner-friendly
2. **Test with short intervals** - Set a quiet block for 12 minutes from now
3. **Check spam folders** - Automated emails sometimes go to spam
4. **Use descriptive "from" names** - Like "Quiet Hours App <noreply@yourdomain.com>"

**Need help?** All services have good documentation and support. The app will show detailed error messages in the terminal to help you debug!
