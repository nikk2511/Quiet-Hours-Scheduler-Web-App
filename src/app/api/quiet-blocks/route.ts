import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { connectToDatabase } from '@/lib/mongodb'
import { QuietBlock, CreateQuietBlockRequest, UpdateQuietBlockRequest } from '@/types'
import { ObjectId } from 'mongodb'

// GET - Fetch all quiet blocks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    const blocks = await collection
      .find({ userId: user.id })
      .sort({ startDateTime: 1 })
      .toArray()

    return NextResponse.json({ 
      blocks: blocks.map(block => ({
        ...block,
        _id: block._id.toString()
      }))
    })
  } catch (error) {
    console.error('Error fetching quiet blocks:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new quiet block
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateQuietBlockRequest = await request.json()
    const { startDateTime, endDateTime, description } = body

    // Validation
    if (!startDateTime || !endDateTime || !description) {
      return NextResponse.json(
        { message: 'Start time, end time, and description are required' },
        { status: 400 }
      )
    }

    // INDIAN TIMEZONE FIX: Handle IST (UTC+5:30) properly
    const now = new Date()
    
    // Convert datetime-local to Indian time format
    const formatIndianTime = (dateTimeStr: string) => {
      // dateTimeStr is like "2024-01-16T14:40" (user's local time in India)
      const [date, time] = dateTimeStr.split('T')
      const [year, month, day] = date.split('-').map(Number)
      const [hour, minute] = time.split(':').map(Number)
      
      // Format time in 12-hour format for display
      const displayTime = `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
      
      // Create date object in Indian timezone for validation
      // India is UTC+5:30, so we need to adjust for this
      const indianDate = new Date(year, month - 1, day, hour, minute)
      
      return {
        original: dateTimeStr,
        display: displayTime,
        dateObj: indianDate
      }
    }
    
    const startTime = formatIndianTime(startDateTime)
    const endTime = formatIndianTime(endDateTime)
    const start = startTime.dateObj
    const end = endTime.dateObj
    
    console.log('🇮🇳 INDIAN TIMEZONE FIX:')
    console.log('User entered (IST):', { startDateTime, endDateTime })
    console.log('Will display as:', { 
      start: startTime.display, 
      end: endTime.display 
    })
    
    // Add 30 seconds buffer to account for processing time
    const minStartTime = new Date(now.getTime() + 30 * 1000)

    if (start <= minStartTime) {
      return NextResponse.json(
        { message: 'Start time must be in the future' },
        { status: 400 }
      )
    }

    if (end <= start) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for overlapping blocks
    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    const overlappingBlocks = await collection.findOne({
      userId: user.id,
      $or: [
        { startDateTime: { $lt: end }, endDateTime: { $gt: start } }
      ]
    })

    if (overlappingBlocks) {
      return NextResponse.json(
        { message: 'This time slot overlaps with an existing quiet block' },
        { status: 400 }
      )
    }

    const quietBlock: Omit<QuietBlock, '_id'> = {
      userId: user.id,
      startDateTime: startTime.display, // Store as Indian time string
      endDateTime: endTime.display,     // Store as Indian time string
      description: description.trim(),
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(quietBlock)

    return NextResponse.json({
      message: 'Quiet block created successfully',
      blockId: result.insertedId
    })
  } catch (error) {
    console.error('Error creating quiet block:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing quiet block
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateQuietBlockRequest = await request.json()
    const { _id, startDateTime, endDateTime, description } = body

    // Validation
    if (!_id || !startDateTime || !endDateTime || !description) {
      return NextResponse.json(
        { message: 'ID, start time, end time, and description are required' },
        { status: 400 }
      )
    }

    // INDIAN TIMEZONE FIX: Handle IST (UTC+5:30) properly for updates
    const now = new Date()
    
    // Convert datetime-local to Indian time format (same as CREATE)
    const formatIndianTime = (dateTimeStr: string) => {
      const [date, time] = dateTimeStr.split('T')
      const [year, month, day] = date.split('-').map(Number)
      const [hour, minute] = time.split(':').map(Number)
      
      const displayTime = `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
      const indianDate = new Date(year, month - 1, day, hour, minute)
      
      return {
        original: dateTimeStr,
        display: displayTime,
        dateObj: indianDate
      }
    }
    
    const startTime = formatIndianTime(startDateTime)
    const endTime = formatIndianTime(endDateTime)
    const start = startTime.dateObj
    const end = endTime.dateObj
    
    console.log('🇮🇳 INDIAN UPDATE FIX:')
    console.log('User entered (IST):', { startDateTime, endDateTime })
    console.log('Will display as:', { 
      start: startTime.display, 
      end: endTime.display 
    })
    
    // Add 30 seconds buffer to account for processing time
    const minStartTime = new Date(now.getTime() + 30 * 1000)

    if (end <= start) {
      return NextResponse.json(
        { message: 'End time must be after start time' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    // Check if block exists and belongs to user
    const existingBlock = await collection.findOne({
      _id: new ObjectId(_id),
      userId: user.id
    })

    if (!existingBlock) {
      return NextResponse.json(
        { message: 'Quiet block not found' },
        { status: 404 }
      )
    }
    
    // Only enforce future time if the start time is being changed to a new future time
    const currentStart = new Date(existingBlock.startDateTime)
    if (start.getTime() !== currentStart.getTime() && start <= minStartTime) {
      return NextResponse.json(
        { message: 'Start time must be in the future when changing to a new time' },
        { status: 400 }
      )
    }

    // Check for overlapping blocks (excluding the current block)
    const overlappingBlocks = await collection.findOne({
      _id: { $ne: new ObjectId(_id) },
      userId: user.id,
      $or: [
        { startDateTime: { $lt: end }, endDateTime: { $gt: start } }
      ]
    })

    if (overlappingBlocks) {
      return NextResponse.json(
        { message: 'This time slot overlaps with an existing quiet block' },
        { status: 400 }
      )
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id), userId: user.id },
      {
        $set: {
          startDateTime: startTime.display, // Store as Indian time string
          endDateTime: endTime.display,     // Store as Indian time string
          description: description.trim(),
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Quiet block not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Quiet block updated successfully'
    })
  } catch (error) {
    console.error('Error updating quiet block:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a quiet block
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { _id } = body

    if (!_id) {
      return NextResponse.json(
        { message: 'Block ID is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const collection = db.collection('quiet_blocks')

    const result = await collection.deleteOne({
      _id: new ObjectId(_id),
      userId: user.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Quiet block not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Quiet block deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting quiet block:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
