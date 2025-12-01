import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
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

const InterviewTracker = () => {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [filterStatus, setFilterStatus] = useState<string>('all')

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
  })

  useEffect(() => {
    if (user) {
      loadInterviews()
    }
  }, [user])

  const loadInterviews = async () => {
    try {
      const response = await $api.get('/interview-tracker')
      setInterviews(response.data)
    } catch (error) {
      console.error('Error loading interviews:', error)
      // Загрузим демо-данные для отображения
      setInterviews([
        {
          id: 1,
          company: 'Яндекс',
          position: 'Frontend Developer',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          type: 'online',
          status: 'scheduled',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          contactPerson: 'Мария Петрова',
          notes: 'Подготовить портфолио, изучить React 18',
          reminder: true,
        },
        {
          id: 2,
          company: 'Сбер',
          position: 'Full Stack Developer',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '11:00',
          type: 'offline',
          status: 'scheduled',
          location: 'ул. Вавилова, 19, Москва',
          contactPerson: 'Иван Смирнов',
          contactPhone: '+7 (999) 123-45-67',
          notes: 'Взять паспорт для пропуска',
          reminder: true,
        },
        {
          id: 3,
          company: 'VK',
          position: 'React Developer',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '16:00',
          type: 'online',
          status: 'completed',
          result: 'passed',
          feedback: 'Хорошее знание React и TypeScript. Пригласят на финальное собеседование.',
          reminder: false,
        },
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingInterview) {
        await $api.put(`/interview-tracker/${editingInterview.id}`, formData)
        toast.success('Собеседование обновлено')
      } else {
        await $api.post('/interview-tracker', formData)
        toast.success('Собеседование добавлено')
      }
      loadInterviews()
      closeModal()
    } catch (error) {
      console.error('Error saving interview:', error)
      // Локальное добавление для демо
      if (editingInterview) {
        setInterviews(prev => prev.map(i =>
          i.id === editingInterview.id
            ? { ...i, ...formData, status: i.status }
            : i
        ))
        toast.success('Собеседование обновлено')
      } else {
        const newInterview: Interview = {
          id: Date.now(),
          ...formData,
          status: 'scheduled',
        }
        setInterviews(prev => [...prev, newInterview])
        toast.success('Собеседование добавлено')
      }
      closeModal()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить это собеседование?')) return

    try {
      await $api.delete(`/interview-tracker/${id}`)
      toast.success('Собеседование удалено')
      loadInterviews()
    } catch (error) {
      console.error('Error deleting interview:', error)
      setInterviews(prev => prev.filter(i => i.id !== id))
      toast.success('Собеседование удалено')
    }
  }

  const handleStatusChange = async (id: number, status: Interview['status']) => {
    try {
      await $api.patch(`/interview-tracker/${id}/status`, { status })
      loadInterviews()
    } catch (error) {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    }
    toast.success('Статус обновлён')
  }

  const handleResultChange = async (id: number, result: Interview['result']) => {
    try {
      await $api.patch(`/interview-tracker/${id}/result`, { result })
      loadInterviews()
    } catch (error) {
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, result } : i))
    }
    toast.success('Результат сохранён')
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
        <Section title="Трекер собеседований" className="bg-dark-bg">
          <Card>
            <p className="text-gray-300 text-center py-8">
              Войдите в систему, чтобы использовать трекер собеседований
            </p>
            <div className="flex justify-center">
              <button onClick={() => navigate('/login')} className="btn-primary">
                Войти
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
              Трекер собеседований
            </h1>
            <p className="text-gray-400 mt-2">Управляйте своими собеседованиями в одном месте</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить собеседование
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400 text-sm">Всего</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-blue-400">{stats.scheduled}</div>
            <div className="text-gray-400 text-sm">Запланировано</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-gray-400 text-sm">Пройдено</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-accent-cyan">{stats.passed}</div>
            <div className="text-gray-400 text-sm">Успешных</div>
          </Card>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-surface border border-dark-card text-white rounded-lg px-4 py-2"
          >
            <option value="all">Все статусы</option>
            <option value="scheduled">Запланированные</option>
            <option value="completed">Завершённые</option>
            <option value="cancelled">Отменённые</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar / List View */}
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <Card>
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                  </button>
                  <h2 className="text-xl font-semibold text-white">
                    {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
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
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center text-gray-400 text-sm py-2 font-medium">
                      {day}
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
                            +{dayInterviews.length - 2} ещё
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
                      Нет собеседований для отображения
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
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Upcoming Interviews */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent-cyan" />
                Ближайшие собеседования
              </h3>
              {upcomingInterviews.length === 0 ? (
                <p className="text-gray-400 text-sm">Нет запланированных собеседований</p>
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
                            {daysUntil === 0 ? 'Сегодня' : daysUntil === 1 ? 'Завтра' : `Через ${daysUntil} дн.`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Quick Tips */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Советы</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  Подготовьте вопросы к компании заранее
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  Изучите проекты и технологии компании
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  Проверьте связь за 15 минут до онлайн-собеседования
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  Записывайте обратную связь после каждого интервью
                </li>
              </ul>
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
                  {editingInterview ? 'Редактировать собеседование' : 'Новое собеседование'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-dark-surface rounded-lg">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Компания *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Позиция *</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Дата *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Время *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    >
                      <option value="online">Онлайн</option>
                      <option value="offline">Офис</option>
                      <option value="phone">Телефон</option>
                    </select>
                  </div>
                </div>

                {formData.type === 'online' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ссылка на встречу</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Адрес</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      placeholder="Адрес офиса"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Контактное лицо</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Телефон контакта</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Заметки</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white h-24 resize-none"
                    placeholder="Что подготовить, вопросы к компании..."
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
                    Напомнить за день до собеседования
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingInterview ? 'Сохранить' : 'Добавить'}
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
                      Удалить
                    </button>
                  )}
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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
}

const InterviewCard = ({ interview, onEdit, onDelete, onStatusChange, onResultChange }: InterviewCardProps) => {
  const TypeIcon = INTERVIEW_TYPES[interview.type].icon
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <Card className="hover:border-accent-cyan/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-semibold text-white">{interview.company}</h3>
            <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[interview.status]}`}>
              {interview.status === 'scheduled' ? 'Запланировано' :
               interview.status === 'completed' ? 'Завершено' : 'Отменено'}
            </span>
            {interview.result && (
              <span className={`px-2 py-0.5 rounded text-xs ${RESULT_COLORS[interview.result]}`}>
                {interview.result === 'passed' ? 'Успешно' :
                 interview.result === 'failed' ? 'Отказ' : 'Ожидание'}
              </span>
            )}
          </div>
          <p className="text-gray-400 mb-2">{interview.position}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(interview.date).toLocaleDateString('ru-RU')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {interview.time}
            </span>
            <span className={`flex items-center gap-1 ${INTERVIEW_TYPES[interview.type].color}`}>
              <TypeIcon className="h-4 w-4" />
              {INTERVIEW_TYPES[interview.type].label}
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
                {showFeedback ? 'Скрыть обратную связь' : 'Показать обратную связь'}
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
                title="Отметить как пройденное"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => onStatusChange('cancelled')}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Отменить"
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
                Успешно
              </button>
              <button
                onClick={() => onResultChange('failed')}
                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
              >
                Отказ
              </button>
              <button
                onClick={() => onResultChange('pending')}
                className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
              >
                Ожидание
              </button>
            </div>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Удалить"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default InterviewTracker