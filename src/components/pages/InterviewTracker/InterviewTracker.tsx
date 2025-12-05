import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Plus,
  Edit2,
  Trash2,
  X,
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  Users
} from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import { $api } from '../../../utils/axios.instance'
import ConfirmModal from '../../ui/ConfirmModal'

interface Interview {
  id: number
  company: string
  position: string
  date: string
  time: string
  type: 'online' | 'offline' | 'phone'
  status: 'scheduled' | 'completed' | 'cancelled'
  location?: string
  meetingLink?: string
  contactPerson?: string
  contactPhone?: string
  notes?: string
  reminder?: boolean
  result?: 'passed' | 'failed' | 'pending' | null
  feedback?: string
  graduateId?: number
  graduate?: {
    id: number
    username: string
    firstName?: string
    lastName?: string
    email: string
    avatar?: string
  }
  employerId?: number
  employer?: {
    id: number
    username: string
    companyName?: string
    avatar?: string
  }
  invitationStatus?: 'none' | 'pending' | 'accepted' | 'declined'
}

interface Candidate {
  id: number
  username: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  source: 'application' | 'chat'
  vacancyId?: number
  vacancyTitle?: string
}

const INTERVIEW_TYPES = {
  online: { label: 'Онлайн', icon: Video, color: 'text-blue-400' },
  offline: { label: 'Офис', icon: MapPin, color: 'text-green-400' },
  phone: { label: 'Телефон', icon: Phone, color: 'text-yellow-400' },
}

const STATUS_COLORS = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const RESULT_COLORS = {
  passed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
}

const INVITATION_COLORS = {
  none: '',
  pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  declined: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const InterviewTracker = () => {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const { t, i18n } = useTranslation()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null })
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const isEmployer = user?.role === 'employer'

  // Form state
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    date: '',
    time: '',
    type: 'online' as 'online' | 'offline' | 'phone',
    location: '',
    meetingLink: '',
    contactPerson: '',
    contactPhone: '',
    notes: '',
    reminder: true,
    graduateId: '' as string | number,
  })

  useEffect(() => {
    if (user) {
      loadInterviews()
      if (isEmployer) {
        loadCandidates()
      }
    }
  }, [user, isEmployer])

  const loadCandidates = async () => {
    try {
      const response = await $api.get('/interview-tracker/employer/candidates')
      setCandidates(response.data)
    } catch (error) {
      console.error('Error loading candidates:', error)
      setCandidates([])
    }
  }

  const loadInterviews = async () => {
    try {
      const endpoint = isEmployer ? '/interview-tracker/employer' : '/interview-tracker'
      const response = await $api.get(endpoint)
      setInterviews(response.data)
    } catch (error) {
      console.error('Error loading interviews:', error)
      setInterviews([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEmployer) {
        // Для работодателя используем специальные эндпоинты
        const payload = {
          ...formData,
          graduateId: formData.graduateId ? Number(formData.graduateId) : undefined,
        }
        if (editingInterview) {
          await $api.put(`/interview-tracker/employer/${editingInterview.id}`, payload)
          toast.success(t('interview.tracker.messages.updated'))
        } else {
          await $api.post('/interview-tracker/employer', payload)
          toast.success(t('interview.tracker.messages.added'))
        }
      } else {
        // Для выпускника стандартные эндпоинты
        if (editingInterview) {
          await $api.put(`/interview-tracker/${editingInterview.id}`, formData)
          toast.success(t('interview.tracker.messages.updated'))
        } else {
          await $api.post('/interview-tracker', formData)
          toast.success(t('interview.tracker.messages.added'))
        }
      }
      loadInterviews()
      closeModal()
    } catch (error: any) {
      console.error('Error saving interview:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('interview.tracker.messages.saveError')
      toast.error(errorMessage)
    }
  }

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    try {
      const endpoint = isEmployer
        ? `/interview-tracker/employer/${deleteConfirm.id}`
        : `/interview-tracker/${deleteConfirm.id}`
      await $api.delete(endpoint)
      toast.success(t('interview.tracker.messages.deleted'))
      loadInterviews()
      setDeleteConfirm({ isOpen: false, id: null })
    } catch (error: any) {
      console.error('Error deleting interview:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('interview.tracker.messages.deleteError')
      toast.error(errorMessage)
    }
  }

  const handleStatusChange = async (id: number, status: Interview['status']) => {
    try {
      const endpoint = isEmployer
        ? `/interview-tracker/employer/${id}/status`
        : `/interview-tracker/${id}/status`
      await $api.patch(endpoint, { status })
      loadInterviews()
      toast.success(t('interview.tracker.messages.statusUpdated'))
    } catch (error: any) {
      console.error('Error updating status:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('interview.tracker.messages.statusError')
      toast.error(errorMessage)
    }
  }

  const handleResultChange = async (id: number, result: Interview['result']) => {
    try {
      const endpoint = isEmployer
        ? `/interview-tracker/employer/${id}/result`
        : `/interview-tracker/${id}/result`
      await $api.patch(endpoint, { result })
      loadInterviews()
      toast.success(t('interview.tracker.messages.resultSaved'))
    } catch (error: any) {
      console.error('Error updating result:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('interview.tracker.messages.resultError')
      toast.error(errorMessage)
    }
  }

  const handleInvitationResponse = async (id: number, action: 'accept' | 'decline') => {
    try {
      await $api.patch(`/interview-tracker/${id}/invitation`, { action })
      loadInterviews()
      toast.success(action === 'accept'
        ? t('interview.tracker.messages.invitationAccepted') || 'Приглашение принято'
        : t('interview.tracker.messages.invitationDeclined') || 'Приглашение отклонено'
      )
    } catch (error: any) {
      console.error('Error responding to invitation:', error)
      const errorMessage = error.response?.data?.error || t('interview.tracker.messages.invitationError') || 'Ошибка при ответе на приглашение'
      toast.error(errorMessage)
    }
  }

  const openModal = (interview?: Interview) => {
    if (interview) {
      setEditingInterview(interview)
      setFormData({
        company: interview.company,
        position: interview.position,
        date: interview.date,
        time: interview.time,
        type: interview.type,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        contactPerson: interview.contactPerson || '',
        contactPhone: interview.contactPhone || '',
        notes: interview.notes || '',
        reminder: interview.reminder || false,
        graduateId: interview.graduateId || interview.graduate?.id || '',
      })
    } else {
      setEditingInterview(null)
      setFormData({
        company: '',
        position: '',
        date: selectedDate.toISOString().split('T')[0],
        time: '',
        type: 'online',
        location: '',
        meetingLink: '',
        contactPerson: '',
        contactPhone: '',
        notes: '',
        reminder: true,
        graduateId: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingInterview(null)
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: Date[] = []

    // Add days from previous month
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const getInterviewsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return interviews.filter(i => i.date === dateStr)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth()
  }

  const filteredInterviews = interviews.filter(i =>
    filterStatus === 'all' || i.status === filterStatus
  ).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())

  const upcomingInterviews = interviews
    .filter(i => i.status === 'scheduled' && new Date(i.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    passed: interviews.filter(i => i.result === 'passed').length,
  }

  if (!user) {
    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section title={t('interview.tracker.title')} className="bg-dark-bg">
          <Card>
            <p className="text-gray-300 text-center py-8">
              {t('interview.tracker.messages.loginRequired')}
            </p>
            <div className="flex justify-center">
              <button onClick={() => navigate('/login')} className="btn-primary">
                {t('interview.tracker.messages.login')}
              </button>
            </div>
          </Card>
        </Section>
      </div>
    )
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-accent-cyan" />
              {t('interview.tracker.title')}
            </h1>
            <p className="text-gray-400 mt-2">{t('interview.tracker.subtitle')}</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('interview.tracker.addInterview')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400 text-sm">{t('interview.tracker.stats.total')}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-blue-400">{stats.scheduled}</div>
            <div className="text-gray-400 text-sm">{t('interview.tracker.stats.scheduled')}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-gray-400 text-sm">{t('interview.tracker.stats.completed')}</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-accent-cyan">{stats.passed}</div>
            <div className="text-gray-400 text-sm">{t('interview.tracker.stats.passed')}</div>
          </Card>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors relative group ${
                viewMode === 'calendar'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-surface text-gray-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-dark-card">
                {t('interview.tracker.calendarView')}
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors relative group ${
                viewMode === 'list'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-surface text-gray-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-dark-card">
                {t('interview.tracker.listView')}
              </span>
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-surface border border-dark-card text-white rounded-lg px-4 py-2"
          >
            <option value="all">{t('interview.tracker.allStatuses')}</option>
            <option value="scheduled">{t('interview.tracker.scheduledStatus')}</option>
            <option value="completed">{t('interview.tracker.completedStatus')}</option>
            <option value="cancelled">{t('interview.tracker.cancelledStatus')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Calendar / List View */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <Card className="h-full">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                  </button>
                  <h2 className="text-xl font-semibold text-white capitalize">
                    {selectedDate.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                    <div key={day} className="text-center text-gray-400 text-sm py-2 font-medium">
                      {t(`interview.tracker.calendar.${day}`)}
                    </div>
                  ))}
                  {getDaysInMonth(selectedDate).map((date, index) => {
                    const dayInterviews = getInterviewsForDate(date)
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedDate(date)
                          if (dayInterviews.length === 0) openModal()
                        }}
                        className={`
                          min-h-[80px] p-2 rounded-lg cursor-pointer transition-colors border
                          ${isCurrentMonth(date) ? 'bg-dark-surface border-dark-card' : 'bg-dark-bg border-transparent opacity-50'}
                          ${isToday(date) ? 'border-accent-cyan' : ''}
                          hover:border-accent-cyan/50
                        `}
                      >
                        <div className={`text-sm ${isToday(date) ? 'text-accent-cyan font-bold' : 'text-gray-400'}`}>
                          {date.getDate()}
                        </div>
                        {dayInterviews.slice(0, 2).map(interview => (
                          <div
                            key={interview.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              openModal(interview)
                            }}
                            className={`
                              mt-1 px-2 py-1 rounded text-xs truncate cursor-pointer
                              ${STATUS_COLORS[interview.status]}
                            `}
                          >
                            {interview.time} {interview.company}
                          </div>
                        ))}
                        {dayInterviews.length > 2 && (
                          <div className="text-xs text-gray-400 mt-1">
                            +{dayInterviews.length - 2} {t('interview.tracker.more')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                  <Card>
                    <p className="text-gray-400 text-center py-8">
                      {t('interview.tracker.noInterviews')}
                    </p>
                  </Card>
                ) : (
                  filteredInterviews.map(interview => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      onEdit={() => openModal(interview)}
                      onDelete={() => handleDelete(interview.id)}
                      onStatusChange={(status) => handleStatusChange(interview.id, status)}
                      onResultChange={(result) => handleResultChange(interview.id, result)}
                      onInvitationResponse={(action) => handleInvitationResponse(interview.id, action)}
                      isEmployer={isEmployer}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Upcoming Interviews */}
          <div className="space-y-6 flex flex-col" style={{ height: '100%' }}>
            <Card className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent-cyan" />
                {t('interview.tracker.upcoming')}
              </h3>
              <div className="flex-1 overflow-y-auto">
                {upcomingInterviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t('interview.tracker.noUpcoming')}</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingInterviews.slice(0, 5).map(interview => {
                      const TypeIcon = INTERVIEW_TYPES[interview.type].icon
                      const daysUntil = Math.ceil(
                        (new Date(interview.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )
                      return (
                        <div
                          key={interview.id}
                          onClick={() => openModal(interview)}
                          className="p-3 bg-dark-surface rounded-lg cursor-pointer hover:bg-dark-card transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-white">{interview.company}</div>
                              <div className="text-sm text-gray-400">{interview.position}</div>
                            </div>
                            <TypeIcon className={`h-5 w-5 ${INTERVIEW_TYPES[interview.type].color}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{interview.time}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                              daysUntil === 0 ? 'bg-red-500/20 text-red-400' :
                              daysUntil === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {daysUntil === 0 ? t('interview.tracker.today') : daysUntil === 1 ? t('interview.tracker.tomorrow') : t('interview.tracker.inDays', { count: daysUntil })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-white mb-4">{t('interview.tracker.tips.title')}</h3>
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                    {t('interview.tracker.tips.tip1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                    {t('interview.tracker.tips.tip2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                    {t('interview.tracker.tips.tip3')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                    {t('interview.tracker.tips.tip4')}
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingInterview ? t('interview.tracker.form.editInterview') : t('interview.tracker.form.newInterview')}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Выбор кандидата для работодателя */}
                {isEmployer && !editingInterview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('interview.tracker.form.candidate') || 'Кандидат'} *
                    </label>
                    <select
                      value={formData.graduateId}
                      onChange={(e) => setFormData({ ...formData, graduateId: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">{t('interview.tracker.form.selectCandidate') || 'Выберите кандидата'}</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.firstName && candidate.lastName
                            ? `${candidate.firstName} ${candidate.lastName}`
                            : candidate.username}
                          {candidate.vacancyTitle && ` (${candidate.vacancyTitle})`}
                          {candidate.source === 'chat' && ` (${t('interview.tracker.form.fromChat') || 'из чата'})`}
                        </option>
                      ))}
                    </select>
                    {candidates.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {t('interview.tracker.form.noCandidates') || 'Нет кандидатов. Получите отклики на вакансии или начните чат с выпускниками.'}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Поле компании только для выпускников */}
                  {!isEmployer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.company')} *</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                        required
                      />
                    </div>
                  )}
                  <div className={isEmployer ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.position')} *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.date')} *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.time')} *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.type')}</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    >
                      <option value="online">{t('interview.tracker.form.online')}</option>
                      <option value="offline">{t('interview.tracker.form.offline')}</option>
                      <option value="phone">{t('interview.tracker.form.phone')}</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'online' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.meetingLink')}</label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                {formData.type === 'offline' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.address')}</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.contactPerson')}</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.contactPhone')}</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.notes')}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white h-24 resize-none"
                    placeholder={t('interview.tracker.form.notesPlaceholder')}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-dark-surface"
                  />
                  <label htmlFor="reminder" className="text-gray-300">
                    {t('interview.tracker.form.reminder')}
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingInterview ? t('interview.tracker.form.save') : t('interview.tracker.form.add')}
                  </button>
                  {editingInterview && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(editingInterview.id)
                        closeModal()
                      }}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('interview.tracker.form.delete')}
                    </button>
                  )}
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    {t('interview.tracker.form.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={t('interview.tracker.messages.deleteConfirm')}
        message={t('interview.tracker.messages.deleteConfirmText') || 'Вы уверены, что хотите удалить это собеседование? Это действие нельзя отменить.'}
        confirmText={t('common.delete') || 'Удалить'}
        cancelText={t('common.cancel') || 'Отмена'}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  )
}

// Interview Card Component
interface InterviewCardProps {
  interview: Interview
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: Interview['status']) => void
  onResultChange: (result: Interview['result']) => void
  onInvitationResponse?: (action: 'accept' | 'decline') => void
  isEmployer?: boolean
}

const InterviewCard = ({ interview, onEdit, onDelete, onStatusChange, onResultChange, onInvitationResponse, isEmployer }: InterviewCardProps) => {
  const { t, i18n } = useTranslation()
  const TypeIcon = INTERVIEW_TYPES[interview.type].icon
  const [showFeedback, setShowFeedback] = useState(false)

  // Определяем отображаемое имя и иконку
  const hasGraduate = interview.graduate || interview.graduateId
  const displayName = hasGraduate && interview.graduate
    ? (interview.graduate.firstName && interview.graduate.lastName
        ? `${interview.graduate.firstName} ${interview.graduate.lastName}`
        : interview.graduate.username)
    : interview.company
  const DisplayIcon = hasGraduate ? Users : Building2

  // Проверяем, является ли это приглашением от работодателя для выпускника
  const isPendingInvitation = interview.invitationStatus === 'pending' && !isEmployer

  return (
    <Card className={`hover:border-accent-cyan/30 transition-colors ${isPendingInvitation ? 'border-orange-500/50' : ''}`}>
      {/* Баннер приглашения */}
      {isPendingInvitation && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 font-medium">
              {t('interview.tracker.invitation.pending') || 'Приглашение на собеседование'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onInvitationResponse?.('accept')}
              className="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
            >
              {t('interview.tracker.invitation.accept') || 'Принять'}
            </button>
            <button
              onClick={() => onInvitationResponse?.('decline')}
              className="px-4 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              {t('interview.tracker.invitation.decline') || 'Отклонить'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <DisplayIcon className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-semibold text-white">{displayName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[interview.status]}`}>
              {t(`interview.tracker.status.${interview.status}`)}
            </span>
            {interview.invitationStatus && interview.invitationStatus !== 'none' && (
              <span className={`px-2 py-0.5 rounded text-xs border ${INVITATION_COLORS[interview.invitationStatus]}`}>
                {t(`interview.tracker.invitation.status.${interview.invitationStatus}`) || interview.invitationStatus}
              </span>
            )}
            {interview.result && (
              <span className={`px-2 py-0.5 rounded text-xs ${RESULT_COLORS[interview.result]}`}>
                {t(`interview.tracker.result.${interview.result}`)}
              </span>
            )}
          </div>
          <p className="text-gray-400 mb-2">{interview.position}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(interview.date).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {interview.time}
            </span>
            <span className={`flex items-center gap-1 ${INTERVIEW_TYPES[interview.type].color}`}>
              <TypeIcon className="h-4 w-4" />
              {t(`interview.tracker.types.${interview.type}`)}
            </span>
            {interview.contactPerson && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {interview.contactPerson}
              </span>
            )}
          </div>
          {interview.notes && (
            <p className="mt-2 text-sm text-gray-500 italic">📝 {interview.notes}</p>
          )}
          {interview.feedback && (
            <div className="mt-3">
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-accent-cyan text-sm hover:underline"
              >
                {showFeedback ? t('interview.tracker.actions.hideFeedback') : t('interview.tracker.actions.showFeedback')}
              </button>
              {showFeedback && (
                <p className="mt-2 p-3 bg-dark-surface rounded-lg text-gray-300 text-sm">
                  {interview.feedback}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {interview.status === 'scheduled' && (
            <>
              <button
                onClick={() => onStatusChange('completed')}
                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                title={t('interview.tracker.actions.markCompleted')}
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => onStatusChange('cancelled')}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title={t('interview.tracker.actions.markCancelled')}
              >
                <AlertCircle className="h-5 w-5" />
              </button>
            </>
          )}
          {interview.status === 'completed' && !interview.result && (
            <div className="flex gap-1">
              <button
                onClick={() => onResultChange('passed')}
                className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
              >
                {t('interview.tracker.result.passed')}
              </button>
              <button
                onClick={() => onResultChange('failed')}
                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
              >
                {t('interview.tracker.result.failed')}
              </button>
              <button
                onClick={() => onResultChange('pending')}
                className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
              >
                {t('interview.tracker.result.pending')}
              </button>
            </div>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
            title={t('interview.tracker.actions.edit')}
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title={t('interview.tracker.actions.delete')}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default InterviewTracker