const fetch = require('node-fetch');

async function sendNotifications() {
  try {
    console.log('🔄 Running email notification check...');
    
    // Call the Supabase Edge Function
    const response = await fetch('https://your-project-ref.supabase.co/functions/v1/email-notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email notifications sent:', result);
    } else {
      const error = await response.text();
      console.error('❌ Error sending notifications:', error);
    }
  } catch (error) {
    console.error('❌ Error running notification check:', error);
  }
}

// Run the function
sendNotifications();
