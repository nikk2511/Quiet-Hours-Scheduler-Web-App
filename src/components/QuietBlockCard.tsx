import { format } from 'date-fns'
import { QuietBlock } from '@/types'
import { Edit, Trash2, Clock, CheckCircle } from 'lucide-react'

interface QuietBlockCardProps {
  block: QuietBlock
  onEdit: (block: QuietBlock) => void
  onDelete: (blockId: string) => void
}

export function QuietBlockCard({ block, onEdit, onDelete }: QuietBlockCardProps) {
  // Display times exactly as stored (Indian time)
  const startTime = typeof block.startDateTime === 'string' 
    ? block.startDateTime 
    : format(new Date(block.startDateTime), 'h:mm a')
  const endTime = typeof block.endDateTime === 'string' 
    ? block.endDateTime 
    : format(new Date(block.endDateTime), 'h:mm a')
  
  // Parse time string to determine status
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

  // Get current time for status comparison
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Determine block status
  const startTimeParsed = parseTimeString(block.startDateTime as string)
  const endTimeParsed = parseTimeString(block.endDateTime as string)
  const startTimeInMinutes = startTimeParsed.hours * 60 + startTimeParsed.minutes
  const endTimeInMinutes = endTimeParsed.hours * 60 + endTimeParsed.minutes

  const isUpcoming = startTimeInMinutes > currentTimeInMinutes
  const isActive = startTimeInMinutes <= currentTimeInMinutes && endTimeInMinutes > currentTimeInMinutes
  const isPast = endTimeInMinutes <= currentTimeInMinutes

  // Get today's date for display
  const today = new Date()
  const displayDate = format(today, 'MMM d, yyyy')

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {displayDate}
            </span>
            {block.notificationSent && (
              <span title="Notification sent">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </span>
            )}
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              {startTime} - {endTime} <span className="text-xs text-gray-500">(IST)</span>
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {block.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isUpcoming && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Upcoming
              </span>
            )}
            {isActive && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active Now
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Completed
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={() => onEdit(block)}
            className="p-2 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(block._id!.toString())}
            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
