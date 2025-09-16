# Deployment Guide

This guide covers deploying the Quiet Hours Scheduler application to production.

## 🎯 Deployment Options

### 1. Vercel + Supabase + MongoDB Atlas (Recommended)

This is the simplest and most cost-effective deployment option.

#### Prerequisites
- Vercel account
- Supabase account  
- MongoDB Atlas account
- SendGrid account (for emails)

#### Steps

**1. Prepare Your Repository**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**2. Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Configure environment variables (see below)
- Deploy

**3. Environment Variables for Vercel**
Add these in your Vercel dashboard under Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiet_hours_scheduler
SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

**4. Deploy Supabase Edge Function**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy email-notifications

# Set secrets for the edge function
supabase secrets set MONGODB_URI="your_mongodb_uri"
supabase secrets set SENDGRID_API_KEY="your_sendgrid_key"
```

**5. Set Up CRON Job**
Use Vercel Cron or external service to trigger notifications every minute:

Create `vercel.json` in your project root:
```json
{
  "crons": [
    {
      "path": "/api/trigger-notifications",
      "schedule": "* * * * *"
    }
  ]
}
```

Create `src/app/api/trigger-notifications/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/email-notifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger notifications' }, { status: 500 })
  }
}
```

### 2. Railway + Supabase + MongoDB Atlas

Railway is another great option with built-in CRON support.

**1. Deploy to Railway**
- Connect your GitHub repo to Railway
- Add environment variables
- Deploy

**2. Set Up CRON Job in Railway**
Create `railway.toml`:
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "never"

[cron.email-notifications]
schedule = "* * * * *"
command = "curl -X POST https://your-app.railway.app/api/trigger-notifications"
```

### 3. AWS Amplify + Lambda + MongoDB Atlas

For AWS-native deployment:

**1. Set Up AWS Amplify**
- Deploy Next.js app to Amplify
- Configure build settings

**2. Create Lambda Function**
- Deploy the email notification logic as Lambda
- Set up CloudWatch Events for CRON

**3. Configure Environment Variables**
- Add all required environment variables in Amplify console

## 🛠 Production Configuration

### Database Setup

**MongoDB Atlas Production Setup:**
1. Create a dedicated production cluster
2. Configure IP whitelist for your deployment platform
3. Set up database users with appropriate permissions
4. Enable backup and monitoring

### Email Service Setup

**SendGrid Production Setup:**
1. Verify your sender domain
2. Set up dedicated IP (optional)
3. Configure webhooks for delivery tracking
4. Monitor bounce/spam rates

### Security Considerations

**1. Environment Variables**
- Never commit secrets to version control
- Use different keys for development and production
- Regularly rotate API keys

**2. Database Security**
- Use connection string with authentication
- Limit database user permissions
- Enable MongoDB Atlas security features

**3. API Security**
- Implement rate limiting
- Add CORS configuration
- Monitor API usage

### Performance Optimizations

**1. Next.js Optimizations**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

**2. Database Optimizations**
- Create indexes on frequently queried fields
- Implement connection pooling
- Monitor query performance

## 📊 Monitoring & Logging

### Application Monitoring

**1. Vercel Analytics**
- Enable Vercel Analytics in dashboard
- Monitor page load times and user interactions

**2. Supabase Monitoring**
- Use Supabase dashboard to monitor auth and API usage
- Set up alerts for high error rates

**3. Custom Logging**
```typescript
// Add to your API routes
console.log('User created quiet block:', {
  userId: user.id,
  blockId: result.insertedId,
  timestamp: new Date().toISOString()
})
```

### Email Delivery Monitoring

**1. SendGrid Analytics**
- Monitor delivery rates, opens, and clicks
- Set up webhooks for real-time events

**2. Custom Email Logging**
```typescript
// In your edge function
console.log('Email notification sent:', {
  email: user.email,
  blockId: block._id,
  timestamp: new Date().toISOString(),
  success: true
})
```

## 🚨 Backup & Recovery

### Database Backups
- MongoDB Atlas provides automatic backups
- Set up additional backup schedules if needed
- Test backup restoration process

### Code Backups
- Use GitHub for version control
- Tag releases for easy rollback
- Maintain development and production branches

### Configuration Backups
- Document all environment variables
- Keep backup copies of configuration files
- Use infrastructure as code when possible

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use MongoDB Atlas auto-scaling
- Configure Vercel for edge deployment
- Implement database read replicas if needed

### Vertical Scaling
- Monitor resource usage
- Upgrade database cluster when needed
- Optimize slow queries

### Cost Optimization
- Monitor usage across all services
- Set up billing alerts
- Use appropriate service tiers

## 🆘 Troubleshooting Production Issues

### Common Issues

**1. Environment Variables Not Loading**
```bash
# Check Vercel deployment logs
vercel logs your-deployment-url

# Verify environment variables are set
vercel env ls
```

**2. Database Connection Issues**
- Check MongoDB Atlas network access
- Verify connection string format
- Monitor connection pool usage

**3. Email Delivery Problems**
- Check SendGrid delivery logs
- Verify sender authentication
- Monitor spam/bounce rates

**4. CRON Job Not Running**
- Check CRON service logs
- Verify edge function is deployed
- Test manual function invocation

### Debugging Steps

1. **Check Application Logs**
   - Vercel deployment logs
   - Supabase edge function logs
   - MongoDB Atlas logs

2. **Test Components Individually**
   - Test API routes directly
   - Verify database queries
   - Test email sending manually

3. **Monitor Real-Time Metrics**
   - API response times
   - Database query performance
   - Email delivery rates

## 📞 Production Support

### Health Checks

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    // Check database connection
    const { db } = await connectToDatabase()
    await db.admin().ping()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

### Alert Setup
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure email alerts for downtime
- Monitor critical metrics

---

This deployment guide should help you get your Quiet Hours Scheduler application running in production successfully. Remember to test thoroughly in a staging environment before deploying to production!
