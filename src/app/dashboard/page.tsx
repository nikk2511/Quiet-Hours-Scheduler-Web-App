'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { QuietBlockCard } from '@/components/QuietBlockCard'
import { QuietBlockForm } from '@/components/QuietBlockForm'
import { QuietBlock, QuietBlockForm as QuietBlockFormType } from '@/types'
import { Plus, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [blocks, setBlocks] = useState<QuietBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<QuietBlock | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    
    if (user) {
      fetchBlocks()
    }
  }, [user, authLoading, router])

  const fetchBlocks = async () => {
    try {
      console.log('🔄 Fetching quiet blocks...')
      const response = await fetch('/api/quiet-blocks')
      if (response.ok) {
        const data = await response.json()
        console.log('📦 Fetched blocks:', data.blocks)
        setBlocks(data.blocks)
      } else {
        const error = await response.json()
        console.error('❌ Failed to fetch blocks:', error)
        toast.error('Failed to fetch quiet blocks')
      }
    } catch (error) {
      console.error('❌ Error fetching blocks:', error)
      toast.error('Error fetching quiet blocks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlock = async (data: QuietBlockFormType) => {
    setSubmitting(true)
    try {
      console.log('➕ Creating quiet block:', data)
      const response = await fetch('/api/quiet-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Block created successfully:', result)
        toast.success('Quiet block created successfully!')
        setShowForm(false)
        fetchBlocks()
      } else {
        const error = await response.json()
        console.error('❌ Failed to create block:', error)
        toast.error(error.message || 'Failed to create quiet block')
      }
    } catch (error) {
      console.error('❌ Error creating block:', error)
      toast.error('Error creating quiet block')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBlock = async (data: QuietBlockFormType) => {
    if (!editingBlock) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/quiet-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: editingBlock._id!.toString(),
          ...data
        })
      })

      if (response.ok) {
        toast.success('Quiet block updated successfully!')
        setEditingBlock(null)
        fetchBlocks()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update quiet block')
      }
    } catch (error) {
      toast.error('Error updating quiet block')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this quiet block?')) return

    try {
      const response = await fetch('/api/quiet-blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: blockId })
      })

      if (response.ok) {
        toast.success('Quiet block deleted successfully!')
        fetchBlocks()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete quiet block')
      }
    } catch (error) {
      toast.error('Error deleting quiet block')
    }
  }

  const handleTestEmailNotifications = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📧 Email test results:', data)
        toast.success(`Found ${data.blocksNeedingNotification} blocks needing notifications`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to test email notifications')
      }
    } catch (error) {
      toast.error('Error testing email notifications')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

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

  // Get current time for comparison
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Filter blocks based on time comparison (treating all as today)
  const upcomingBlocks = blocks.filter(block => {
    const startTime = parseTimeString(block.startDateTime as string)
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
    return startTimeInMinutes > currentTimeInMinutes
  })

  const activeBlocks = blocks.filter(block => {
    const startTime = parseTimeString(block.startDateTime as string)
    const endTime = parseTimeString(block.endDateTime as string)
    const startTimeInMinutes = startTime.hours * 60 + startTime.minutes
    const endTimeInMinutes = endTime.hours * 60 + endTime.minutes
    return startTimeInMinutes <= currentTimeInMinutes && endTimeInMinutes > currentTimeInMinutes
  })

  const pastBlocks = blocks.filter(block => {
    const endTime = parseTimeString(block.endDateTime as string)
    const endTimeInMinutes = endTime.hours * 60 + endTime.minutes
    return endTimeInMinutes <= currentTimeInMinutes
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your quiet study time blocks</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Quiet Block
              </button>
              <button
                onClick={handleTestEmailNotifications}
                className="btn bg-yellow-600 text-white hover:bg-yellow-700"
              >
                📧 Test Email
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{upcomingBlocks.length}</p>
                <p className="text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{activeBlocks.length}</p>
                <p className="text-gray-600">Active Now</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{pastBlocks.length}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Blocks */}
        {activeBlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Now</h2>
            <div className="grid gap-4">
              {activeBlocks.map((block) => (
                <QuietBlockCard
                  key={block._id!.toString()}
                  block={block}
                  onEdit={setEditingBlock}
                  onDelete={handleDeleteBlock}
                />
              ))}
            </div>
          </div>
        )}


        {/* Upcoming Blocks */}
        {upcomingBlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upcoming Blocks ({upcomingBlocks.length})
            </h2>
            <div className="grid gap-4">
              {upcomingBlocks.map((block) => (
                <QuietBlockCard
                  key={block._id!.toString()}
                  block={block}
                  onEdit={setEditingBlock}
                  onDelete={handleDeleteBlock}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Blocks */}
        {activeBlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Now</h2>
            <div className="grid gap-4">
              {activeBlocks.map((block) => (
                <QuietBlockCard
                  key={block._id!.toString()}
                  block={block}
                  onEdit={setEditingBlock}
                  onDelete={handleDeleteBlock}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Blocks */}
        {pastBlocks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Completed ({pastBlocks.length})
            </h2>
            <div className="grid gap-4">
              {pastBlocks
                .slice(0, 10) // Show only last 10 completed blocks
                .map((block) => (
                  <QuietBlockCard
                    key={block._id!.toString()}
                    block={block}
                    onEdit={setEditingBlock}
                    onDelete={handleDeleteBlock}
                  />
                ))}
            </div>
          </div>
        )}

        {/* No Blocks Message */}
        {blocks.length === 0 && (
          <div className="mb-8">
            <div className="card p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quiet blocks today</h3>
              <p className="text-gray-500 mb-4">Create your first quiet study session to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Quiet Block
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <QuietBlockForm
          onSubmit={handleCreateBlock}
          onCancel={() => setShowForm(false)}
          loading={submitting}
        />
      )}

      {/* Edit Form */}
      {editingBlock && (
        <QuietBlockForm
          block={editingBlock}
          onSubmit={handleEditBlock}
          onCancel={() => setEditingBlock(null)}
          loading={submitting}
        />
      )}
    </div>
  )
}
