import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing email notifications...')
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('👤 User auth result:', { user: user?.id, error: authError?.message })

    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message)
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

    console.log('⏰ Time comparison:', {
      currentTime: now.toLocaleTimeString(),
      currentTimeInMinutes,
      tenMinutesFromNowInMinutes,
      timeWindow: `${currentTimeInMinutes} - ${tenMinutesFromNowInMinutes}`
    })

    // Filter blocks that start in the next 10 minutes
    const blocksNeedingNotification = blocks.filter(block => {
      if (typeof block.startDateTime === 'string') {
        const startTime = parseTimeString(block.startDateTime)
        const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
        
        console.log('🔍 Block analysis:', {
          description: block.description,
          startTime: block.startDateTime,
          parsedTime: startTime,
          startTimeInMinutes,
          inWindow: startTimeInMinutes >= currentTimeInMinutes && startTimeInMinutes <= tenMinutesFromNowInMinutes
        })
        
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
      allBlocks: blocks.map(block => ({
        id: block._id,
        description: block.description,
        startTime: block.startDateTime,
        endTime: block.endDateTime,
        notificationSent: block.notificationSent
      })),
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
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
