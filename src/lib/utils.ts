import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`
  }
  
  if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`
  }
  
  return format(d, 'MMM d at h:mm a')
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  
  const startTime = format(startDate, 'h:mm a')
  const endTime = format(endDate, 'h:mm a')
  
  if (isToday(startDate)) {
    return `Today ${startTime} - ${endTime}`
  }
  
  if (isTomorrow(startDate)) {
    return `Tomorrow ${startTime} - ${endTime}`
  }
  
  return `${format(startDate, 'MMM d')} ${startTime} - ${endTime}`
}

export function getTimeUntil(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

export function validateTimeRange(start: string, end: string): string | null {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const now = new Date()
  
  if (startDate <= now) {
    return 'Start time must be in the future'
  }
  
  if (endDate <= startDate) {
    return 'End time must be after start time'
  }
  
  if (endDate.getTime() - startDate.getTime() > 8 * 60 * 60 * 1000) {
    return 'Quiet blocks cannot exceed 8 hours'
  }
  
  if (endDate.getTime() - startDate.getTime() < 15 * 60 * 1000) {
    return 'Quiet blocks must be at least 15 minutes long'
  }
  
  return null
}
