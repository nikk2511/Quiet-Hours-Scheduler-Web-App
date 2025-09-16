'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Setup Required
            </h1>
            <p className="text-gray-600">
              Please configure your environment variables to get started
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Environment Configuration Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You need to create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with your service credentials.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Create Environment File</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Copy <code>environment.config.txt</code> to <code>.env.local</code>:
                </p>
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`cp environment.config.txt .env.local`}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Required Services</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Supabase</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Authentication and real-time features
                  </p>
                  <a 
                    href="https://supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Create Account <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <div className="mt-2 text-xs text-gray-500">
                    ✓ Free tier available
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">MongoDB Atlas</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Database for storing quiet blocks
                  </p>
                  <a 
                    href="https://www.mongodb.com/cloud/atlas" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Create Account <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <div className="mt-2 text-xs text-gray-500">
                    ✓ Free tier available
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Email Service</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose any email provider below
                  </p>
                  <div className="text-xs text-gray-500">
                    ✓ Multiple free options available
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">📧 Email Service Options (Choose One):</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-700">✓ Resend</span>
                    <span className="text-blue-600">(Recommended)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-700">✓ EmailJS</span>
                    <span className="text-blue-600">(No backend)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-700">✓ Brevo</span>
                    <span className="text-blue-600">(300/day free)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-700">✓ Mailgun</span>
                    <span className="text-blue-600">(5K free)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-700">✓ Gmail SMTP</span>
                    <span className="text-blue-600">(Your Gmail)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-600">✓ SendGrid</span>
                    <span className="text-gray-500">(100/day)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Environment Variables</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Add these to your <code>.env.local</code> file:
                </p>
                <pre className="bg-gray-800 text-gray-300 p-3 rounded text-xs overflow-x-auto">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB Configuration  
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiet_hours_scheduler

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Documentation</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Email Setup Guide</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Detailed setup for all email providers
                  </p>
                  <a 
                    href="https://github.com/your-repo/blob/main/EMAIL-SETUP-GUIDE.md" 
                    target="_blank"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View Guide <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Quick Start Guide</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Step-by-step setup in under 10 minutes
                  </p>
                  <a 
                    href="https://github.com/your-repo/blob/main/QUICKSTART.md" 
                    target="_blank"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View Guide <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Full Documentation</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete setup and feature documentation
                  </p>
                  <a 
                    href="https://github.com/your-repo/blob/main/README.md" 
                    target="_blank"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View README <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Once configured, restart your development server and refresh this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
