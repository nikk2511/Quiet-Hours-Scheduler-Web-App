import { ObjectId } from 'mongodb'

export interface User {
  id: string
  email: string
  created_at: string
}

export interface QuietBlock {
  _id?: ObjectId
  userId: string
  startDateTime: Date | string  // Allow both Date and string for flexibility
  endDateTime: Date | string
  description: string
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QuietBlockForm {
  startDateTime: string
  endDateTime: string
  description: string
  timezoneOffset?: number // Optional for backward compatibility
}

export interface CreateQuietBlockRequest {
  startDateTime: string
  endDateTime: string
  description: string
  timezoneOffset?: number // User's timezone offset in minutes
}

export interface UpdateQuietBlockRequest {
  _id: string
  startDateTime: string
  endDateTime: string
  description: string
  timezoneOffset?: number // User's timezone offset in minutes
}
