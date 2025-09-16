import { ObjectId } from 'mongodb'

export interface User {
  id: string
  email: string
  created_at: string
}

export interface QuietBlock {
  _id?: ObjectId
  userId: string
  startDateTime: Date
  endDateTime: Date
  description: string
  notificationSent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QuietBlockForm {
  startDateTime: string
  endDateTime: string
  description: string
}

export interface CreateQuietBlockRequest {
  startDateTime: string
  endDateTime: string
  description: string
}

export interface UpdateQuietBlockRequest {
  _id: string
  startDateTime: string
  endDateTime: string
  description: string
}
