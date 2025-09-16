# 🤫 Quiet Hours Scheduler Web App

A full-stack web application for scheduling quiet study time blocks with automated email reminders sent 10 minutes before each session starts.

## 🚀 Live Demo

**🌐 Production App:** https://quiet-hours-scheduler-web-app.vercel.app

## ✨ Features

- **🔐 Secure Authentication** - Sign up/login with Supabase Auth
- **📅 Quiet Block Management** - Create, edit, and delete study time blocks
- **📧 Email Notifications** - Automated reminders 10 minutes before sessions
- **📱 Responsive Design** - Works perfectly on mobile and desktop
- **⏰ Real-time Status** - See active, upcoming, and completed blocks
- **🚫 Overlap Prevention** - System prevents scheduling conflicts
- **🌍 Timezone Support** - Works correctly across all timezones
- **🎨 Modern UI** - Clean interface built with Tailwind CSS

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (React with App Router)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Authentication:** Supabase Auth
- **Email Service:** Resend (with multiple provider fallbacks)
- **CRON Jobs:** Supabase Edge Functions
- **Styling:** Tailwind CSS
- **State Management:** React Context
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/nikk2511/Quiet-Hours-Scheduler-Web-App.git
cd Quiet-Hours-Scheduler-Web-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiet_hours_scheduler
MONGODB_DB_NAME=quiet_hours_scheduler

# Email Configuration (Resend - Recommended)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email@domain.com

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Setup Services

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to get your URL and keys
3. **Optional:** Disable email confirmations in **Authentication** → **Settings** for easier development

### MongoDB Atlas Setup

1. Create an account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the whitelist (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env.local`

### Email Service Setup (Resend)

1. Create an account at [resend.com](https://resend.com/)
2. Generate an API key
3. Add the key to your `.env.local` file
4. **Optional:** Verify your domain for better deliverability

## 📧 Email Notifications Setup

### Deploy Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_ref

# Deploy the email function
supabase functions deploy email-notifications
```

### Set Environment Variables in Supabase

Go to your Supabase Dashboard → **Settings** → **Edge Functions** and add:

- `MONGODB_URI` - Your MongoDB connection string
- `MONGODB_DB_NAME` - `quiet_hours_scheduler`
- `RESEND_API_KEY` - Your Resend API key
- `EMAIL_FROM` - Your sender email

### Set Up CRON Scheduler

In your Supabase Dashboard → **SQL Editor**, run:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule email notifications every minute
SELECT cron.schedule(
  'email-notifications-cron',
  '*/1 * * * *',
  $$
  SELECT 
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/email-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object('action', 'check_notifications')
    ) as request_id;
  $$
);
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Deploy to Other Platforms

The app works on any platform that supports Next.js:
- **Netlify** - Connect GitHub repo
- **Railway** - Deploy from GitHub
- **DigitalOcean App Platform** - Deploy from GitHub

## 📁 Project Structure

```
quiet-hours-scheduler/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── quiet-blocks/  # CRUD operations
│   │   ├── auth/              # Login/signup pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── setup/             # Setup guide
│   ├── components/            # React components
│   │   ├── AuthProvider.tsx   # Authentication context
│   │   ├── Navbar.tsx         # Navigation
│   │   ├── QuietBlockCard.tsx # Block display
│   │   └── QuietBlockForm.tsx # Block creation form
│   ├── lib/                   # Utilities
│   │   ├── mongodb.ts         # Database connection
│   │   ├── supabase.ts        # Supabase clients
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript definitions
├── supabase/
│   └── functions/
│       └── email-notifications/ # Edge function for emails
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔧 API Endpoints

- `GET /api/quiet-blocks` - Fetch user's quiet blocks
- `POST /api/quiet-blocks` - Create new quiet block
- `PUT /api/quiet-blocks` - Update existing quiet block
- `DELETE /api/quiet-blocks` - Delete quiet block
- `GET /api/health` - Health check endpoint

## 🗃 Data Model

### QuietBlock (MongoDB Collection: `quiet_blocks`)

```typescript
interface QuietBlock {
  _id: ObjectId
  userId: string              // Supabase user ID
  startDateTime: string       // Start time (e.g., "2:51 PM")
  endDateTime: string         // End time (e.g., "3:30 PM")
  description: string         // Block description
  notificationSent: boolean   // Email notification status
  createdAt: Date            // Creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

## 🧪 Testing

### Manual Testing

1. **Create a quiet block** that starts in 10-15 minutes
2. **Wait for the CRON job** to run (every minute)
3. **Check your email** for the notification

### Development Testing

```bash
# Run the development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health
```

## 🔒 Security Features

- ✅ **Server-side authentication** with Supabase
- ✅ **Input validation** on all forms
- ✅ **API route protection** with user authentication
- ✅ **XSS protection** with proper data sanitization
- ✅ **CSRF protection** with Next.js built-in security

## 🐛 Troubleshooting

### Common Issues

**1. "Setup Required" screen appears**
- Check that all environment variables are set correctly
- Ensure Supabase URL starts with `https://`

**2. MongoDB connection fails**
- Verify your connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**3. Email notifications not working**
- Verify Resend API key is correct
- Check Supabase Edge Function logs
- Ensure CRON job is running

**4. Timezone issues**
- The app now stores times as strings to avoid timezone conversion
- Times display exactly as you enter them

### Debug Mode

Check the browser console and Vercel function logs for detailed error messages.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **GitHub Issues:** [Create an issue](https://github.com/nikk2511/Quiet-Hours-Scheduler-Web-App/issues)
- **Email:** Contact the development team

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [MongoDB Atlas](https://www.mongodb.com/atlas)
- Authentication by [Supabase](https://supabase.com/)
- Email service by [Resend](https://resend.com/)

---

**Happy studying!** 📚✨

*Focus. Study. Achieve.*