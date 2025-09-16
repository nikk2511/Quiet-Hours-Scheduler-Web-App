import { format } from 'date-fns'
import { QuietBlock } from '@/types'
import { Edit, Trash2, Clock, CheckCircle } from 'lucide-react'

interface QuietBlockCardProps {
  block: QuietBlock
  onEdit: (block: QuietBlock) => void
  onDelete: (blockId: string) => void
}

export function QuietBlockCard({ block, onEdit, onDelete }: QuietBlockCardProps) {
  // BULLETPROOF FIX: Display stored time strings directly, no conversion
  const startTime = typeof block.startDateTime === 'string' 
    ? block.startDateTime 
    : format(new Date(block.startDateTime), 'h:mm a')
  const endTime = typeof block.endDateTime === 'string' 
    ? block.endDateTime 
    : format(new Date(block.endDateTime), 'h:mm a')
  
  // For status checking, we still need date objects
  const startDate = typeof block.startDateTime === 'string' 
    ? new Date() // If it's a string, we can't determine the actual date for status
    : new Date(block.startDateTime)
  const endDate = typeof block.endDateTime === 'string' 
    ? new Date() 
    : new Date(block.endDateTime)
  const now = new Date()
  const isUpcoming = startDate > now
  const isActive = startDate <= now && endDate > now
  const isPast = endDate <= now
  
  console.log('🕐 BULLETPROOF DISPLAY:', {
    stored: block.startDateTime,
    display: startTime,
    type: typeof block.startDateTime
  })

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {typeof block.startDateTime === 'string' 
                ? 'Today' // If it's a string, we can't determine the date
                : format(startDate, 'MMM d, yyyy')
              }
            </span>
            {block.notificationSent && (
              <span title="Notification sent">
                <CheckCircle className="h-4 w-4 text-green-500" />
              </span>
            )}
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              {startTime} - {endTime}
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
