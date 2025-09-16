# Quiet Hours Scheduler Web App

A full-stack web application for scheduling quiet study time blocks with automated email reminders sent 10 minutes before each session starts.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Quiet Block Management**: Create, edit, and delete quiet study time blocks
- **Email Notifications**: Automated reminders 10 minutes before sessions start
- **Responsive Design**: Mobile and desktop friendly interface
- **Real-time Updates**: Dashboard shows active, upcoming, and completed blocks
- **Overlap Prevention**: System prevents scheduling overlapping time blocks
- **CRON Job Scheduler**: Automated background job for sending email notifications

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (React with App Router)
- **Backend**: Next.js API Routes
- **Database**: MongoDB for storing quiet block schedules
- **Authentication**: Supabase Auth
- **Email Service**: SendGrid (with Gmail fallback option)
- **CRON Jobs**: Supabase Edge Functions
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have the following:

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance
- Supabase account
- SendGrid account (for email notifications)
- Git

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quiet-hours-scheduler
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp environment.config.txt .env.local
```

Fill in your environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=quiet_hours_scheduler

# Email Configuration (SendGrid recommended)
SENDGRID_API_KEY=your_sendgrid_api_key

# Gmail SMTP (Alternative to SendGrid)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your URL and keys
3. Enable Email Authentication:
   - Go to Authentication → Settings
   - Enable "Enable email confirmations" if desired
   - Add your site URL to "Site URL" and "Redirect URLs"

### 5. Set Up MongoDB

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and add it to `.env.local`
5. The application will automatically create the required collections

### 6. Set Up SendGrid (Email Service)

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com/)
2. Generate an API key with "Mail Send" permissions
3. Add the API key to your `.env.local` file
4. (Optional) Verify your sender domain for better deliverability

### 7. Initialize Supabase Locally (Optional)

If you want to run Supabase locally for development:

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Start local Supabase
supabase start

# Deploy edge function
supabase functions deploy email-notifications
```

## 🚦 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## 📧 Setting Up Email Notifications

### Method 1: SendGrid (Recommended)

1. Create a SendGrid account and get your API key
2. Add `SENDGRID_API_KEY` to your environment variables
3. Deploy the Supabase Edge Function:

```bash
supabase functions deploy email-notifications
```

4. Set up a CRON trigger to call the function every minute:
   - Use GitHub Actions, Vercel Cron, or any CRON service
   - Make a POST request to your Edge Function URL every minute

### Method 2: Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Add `EMAIL_USER`, `EMAIL_PASSWORD`, and `EMAIL_FROM` to your environment

### CRON Job Setup

The email notifications require a CRON job that runs every minute. You can set this up using:

**Option 1: GitHub Actions** (Add to `.github/workflows/cron.yml`):

```yaml
name: Email Notifications CRON
on:
  schedule:
    - cron: '* * * * *' # Every minute
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST "https://your-project.supabase.co/functions/v1/email-notifications" \
               -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
```

**Option 2: External CRON Service**
Use services like cron-job.org, EasyCron, or Vercel Cron to make HTTP requests to your Edge Function.

## 📁 Project Structure

```
quiet-hours-scheduler/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── AuthProvider.tsx   # Auth context provider
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── QuietBlockCard.tsx # Block display component
│   │   └── QuietBlockForm.tsx # Block creation/editing form
│   ├── lib/                   # Utility libraries
│   │   ├── mongodb.ts         # MongoDB connection
│   │   └── supabase.ts        # Supabase clients
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── functions/             # Edge Functions
│   │   └── email-notifications/
│   └── config.toml           # Supabase configuration
├── package.json
├── tailwind.config.js
└── README.md
```

## 🔧 API Routes

- `GET /api/quiet-blocks` - Fetch user's quiet blocks
- `POST /api/quiet-blocks` - Create new quiet block
- `PUT /api/quiet-blocks` - Update existing quiet block
- `DELETE /api/quiet-blocks` - Delete quiet block

## 🗃 Data Model

### QuietBlock (MongoDB Collection: `quiet_blocks`)

```typescript
interface QuietBlock {
  _id: ObjectId
  userId: string              // Supabase user ID
  startDateTime: Date         // Start time of quiet block
  endDateTime: Date          // End time of quiet block
  description: string        // Block description
  notificationSent: boolean  // Whether email notification was sent
  createdAt: Date           // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy the application

### Deploy Supabase Edge Function

```bash
# Deploy the edge function
supabase functions deploy email-notifications

# Set environment variables for the function
supabase secrets set MONGODB_URI=your_mongodb_uri
supabase secrets set SENDGRID_API_KEY=your_sendgrid_key
```

### Set Up Production CRON

Use Vercel Cron, GitHub Actions, or external services to trigger the email notifications function every minute.

## 🧪 Testing

### Manual Testing

1. Create a quiet block that starts in 11-12 minutes
2. Wait for the CRON job to run
3. Check your email for the notification

### Development Testing

Use tools like ngrok to expose your local development server and test webhooks.

## 🔒 Security Features

- Server-side authentication with Supabase
- Input validation on all forms
- API route protection with user authentication
- SQL injection prevention with parameterized queries
- XSS protection with proper data sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Supabase URL and keys
   - Verify site URL in Supabase settings

2. **Database connection fails**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas

3. **Emails not sending**
   - Verify SendGrid API key
   - Check email templates and from address
   - Ensure CRON job is running

4. **CRON job not triggering**
   - Verify Edge Function is deployed
   - Check CRON service configuration
   - Monitor function logs in Supabase

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy studying!** 📚✨
#   Q u i e t - H o u r s - S c h e d u l e r - W e b - A p p  
 U p d a t e d   M o n g o D B   c o n n e c t i o n   s e t t i n g s  
 