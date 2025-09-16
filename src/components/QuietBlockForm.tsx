'use client'

import { useForm } from 'react-hook-form'
import { format, addMinutes } from 'date-fns'
import { QuietBlock, QuietBlockForm as QuietBlockFormType } from '@/types'
import { X } from 'lucide-react'

interface QuietBlockFormProps {
  block?: QuietBlock | null
  onSubmit: (data: QuietBlockFormType) => void
  onCancel: () => void
  loading?: boolean
}

export function QuietBlockForm({ block, onSubmit, onCancel, loading }: QuietBlockFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<QuietBlockFormType>({
    defaultValues: block ? {
      startDateTime: format(new Date(block.startDateTime), "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(new Date(block.endDateTime), "yyyy-MM-dd'T'HH:mm"),
      description: block.description,
    } : {
      startDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDateTime: format(addMinutes(new Date(), 60), "yyyy-MM-dd'T'HH:mm"),
      description: '',
    }
  })

  const startDateTime = watch('startDateTime')

  const validateEndTime = (endTime: string) => {
    if (!startDateTime || !endTime) return true
    const start = new Date(startDateTime)
    const end = new Date(endTime)
    return end > start || 'End time must be after start time'
  }

  const validateStartTime = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    return start > now || 'Start time must be in the future'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {block ? 'Edit Quiet Block' : 'Create New Quiet Block'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              {...register('description', { 
                required: 'Description is required',
                maxLength: {
                  value: 100,
                  message: 'Description must be less than 100 characters'
                }
              })}
              className="input"
              placeholder="e.g., Math study session"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              {...register('startDateTime', { 
                required: 'Start time is required',
                validate: block ? undefined : validateStartTime
              })}
              className="input"
            />
            {errors.startDateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startDateTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              {...register('endDateTime', { 
                required: 'End time is required',
                validate: validateEndTime
              })}
              className="input"
            />
            {errors.endDateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endDateTime.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary py-2"
            >
              {loading ? 'Saving...' : (block ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn btn-secondary py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
