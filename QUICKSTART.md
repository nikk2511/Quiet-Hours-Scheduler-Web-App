# 🚀 Quick Start Guide

Follow these steps to get your Quiet Hours Scheduler app running in under 10 minutes!

## ⚡ Prerequisites

- Node.js (v18+)
- Git
- Text editor (VS Code recommended)

## 📦 1. Install Dependencies

```bash
npm install
```

## 🔧 2. Set Up Environment Variables

1. Copy the environment template:
   ```bash
   # On Windows (PowerShell)
   Copy-Item environment.config.txt .env.local
   
   # On Linux/Mac
   cp environment.config.txt .env.local
   ```

2. Fill in these essential variables in `.env.local`:

**For Basic Testing (Minimum Required):**
```env
# Create a free Supabase account at supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Create a free MongoDB Atlas account at mongodb.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiet_hours_scheduler

# For development, you can use a placeholder
SENDGRID_API_KEY=placeholder_for_now

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🎯 3. Set Up Services

### Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com) → "Start your project"
2. Create new project
3. Go to Settings → API → Copy your URL and Keys
4. Go to Authentication → Settings:
   - Add `http://localhost:3000` to Site URL
   - Add `http://localhost:3000` to Redirect URLs

### MongoDB Atlas (Free Tier)
1. Go to [mongodb.com](https://www.mongodb.com/) → "Try Free"
2. Create cluster → Get connection string
3. Create database user
4. Add your IP address to Network Access

### SendGrid (Optional for Email Testing)
1. Go to [sendgrid.com](https://sendgrid.com) → Free tier
2. Create API Key with Mail Send permissions
3. Add to your `.env.local`

## 🏃‍♂️ 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎉 5. Test the App

1. **Create Account:** Click "Create Account" and sign up
2. **Create Quiet Block:** Set a session for 15 minutes from now
3. **Check Dashboard:** View your scheduled session

## 📧 6. Set Up Email Notifications (Optional)

For email notifications to work, you need to:

1. **Get SendGrid API Key** (recommended) or configure Gmail SMTP
2. **Deploy Edge Function:**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref
   
   # Deploy function
   supabase functions deploy email-notifications
   
   # Set secrets
   supabase secrets set MONGODB_URI="your_connection_string"
   supabase secrets set SENDGRID_API_KEY="your_api_key"
   ```

3. **Set up CRON Job** to call the function every minute (see README.md for details)

## 🛠 Troubleshooting

### Common Issues:

**"Auth errors"**
- Check Supabase URL and keys
- Verify site URL is set to `http://localhost:3000`

**"Database connection failed"**
- Verify MongoDB connection string
- Check network access whitelist in MongoDB Atlas

**"Build errors"**
- Run `npm install` again
- Check Node.js version (should be 18+)

**"Environment variables not loading"**
- Ensure `.env.local` file exists in project root
- Restart the dev server after changing env vars

## 🎯 Next Steps

Once basic setup works:

1. **Customize Styling:** Edit Tailwind classes in components
2. **Deploy to Production:** Follow `DEPLOYMENT.md` guide
3. **Set Up Email Notifications:** Configure CRON job for reminders
4. **Add Features:** Calendar view, notification history, etc.

## 📚 Full Documentation

- **README.md** - Complete setup and feature documentation
- **DEPLOYMENT.md** - Production deployment guide
- **Source Code** - Fully commented for easy customization

## 💬 Need Help?

1. Check the full README.md for detailed instructions
2. Verify all environment variables are set correctly
3. Make sure all services (Supabase, MongoDB) are properly configured

Happy coding! 🚀
