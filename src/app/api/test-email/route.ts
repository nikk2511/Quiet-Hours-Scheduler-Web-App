import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get all blocks for this user
    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    const blocks = await collection
      .find({ userId: user.id })
      .toArray()

    // Parse time string to get hour and minute for comparison
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
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    const tenMinutesFromNowInMinutes = currentTimeInMinutes + 10

    // Filter blocks that start in the next 10 minutes
    const blocksNeedingNotification = blocks.filter(block => {
      if (typeof block.startDateTime === 'string') {
        const startTime = parseTimeString(block.startDateTime)
        const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
        return startTimeInMinutes >= currentTimeInMinutes && startTimeInMinutes <= tenMinutesFromNowInMinutes
      }
      return false
    })

    // For testing, let's also include blocks that start in the next 2 hours
    const testBlocks = blocks.filter(block => {
      if (typeof block.startDateTime === 'string') {
        const startTime = parseTimeString(block.startDateTime)
        const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
        return startTimeInMinutes >= currentTimeInMinutes && startTimeInMinutes <= currentTimeInMinutes + 120
      }
      return false
    })

    return NextResponse.json({
      message: 'Email notification test',
      currentTime: now.toLocaleString(),
      currentTimeInMinutes,
      totalBlocks: blocks.length,
      blocksNeedingNotification: blocksNeedingNotification.length,
      testBlocks: testBlocks.length,
      blocks: testBlocks.map(block => ({
        id: block._id,
        description: block.description,
        startTime: block.startDateTime,
        endTime: block.endDateTime,
        notificationSent: block.notificationSent
      }))
    })
  } catch (error) {
    console.error('Error testing email notifications:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
}
