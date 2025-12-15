import React, { useState, useEffect, useRef } from 'react'
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
  Users,
  Shield,
  User,
  Eye
} from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import { $api } from '../../../utils/axios.instance'
import { getImageUrl } from '../../../utils/image.utils'
import ConfirmModal from '../../ui/ConfirmModal'
import { useParmaEvents } from '../../mascot'

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
  userId?: number
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
  linkedInterviewId?: number
  invitationStatus?: 'none' | 'pending' | 'accepted' | 'declined'
  vacancy?: {
    id: number
    title: string
  }
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
  const { onInterviewScheduled } = useParmaEvents()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'access'>('calendar')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null })
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [allGraduates, setAllGraduates] = useState<any[]>([])
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('')
  const [employers, setEmployers] = useState<any[]>([])
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('')
  const [grantedByMe, setGrantedByMe] = useState<any[]>([])
  const [grantedToMe, setGrantedToMe] = useState<any[]>([])
  const [loadingAccess, setLoadingAccess] = useState(false)
  const [accessSearchQuery, setAccessSearchQuery] = useState<string>('')
  const [selectedGraduateForAccess, setSelectedGraduateForAccess] = useState<number | null>(null)
  const [accessCompanySearchQuery, setAccessCompanySearchQuery] = useState<string>('')
  const [selectedEmployerForAccess, setSelectedEmployerForAccess] = useState<number | null>(null)
  const [viewingCalendar, setViewingCalendar] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: ''
  })
  const [calendarInterviews, setCalendarInterviews] = useState<any[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [viewingCalendarDate, setViewingCalendarDate] = useState<Date>(new Date())

  const isEmployer = user?.role === 'employer'
  const socketRef = useRef<Socket | null>(null)

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
    employerId: '' as string | number,
  })

  useEffect(() => {
    if (user) {
      loadInterviews()
      if (isEmployer) {
        loadCandidates()
      }
    }
  }, [user, isEmployer])

  useEffect(() => {
    if (viewMode === 'access' && isEmployer && allGraduates.length === 0) {
      loadAllGraduates()
    }
  }, [viewMode, isEmployer])

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('accessToken') || document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]

    if (!token) return

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001'
    const socketUrl = apiUrl.replace('/api', '')

    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('✅ Interview Tracker WebSocket подключен')
    })

    socket.on('interview-tracker-access:update', (data: { type: string; access: any }) => {
      console.log('📨 Получено обновление доступа:', data)
      
      const { type, access } = data

      if (type === 'deleted' || type === 'updated') {
        loadAccess()
      } else if (type === 'created') {
        loadAccess()
      }
    })

    socket.on('interview-tracker:update', (data: { type: string; interview: Interview }) => {
      console.log('📨 Получено обновление собеседования:', data)

      const { type, interview } = data

      if (viewingCalendar.isOpen && viewingCalendar.userId != null) {
        const interviewUserId = interview.userId
        const isViewingThisUserCalendar = interviewUserId != null && Number(interviewUserId) === Number(viewingCalendar.userId)
        
        console.log(`🔍 Проверка обновления календаря в модальном окне:`, {
          isOpen: viewingCalendar.isOpen,
          viewingUserId: viewingCalendar.userId,
          viewingUserIdType: typeof viewingCalendar.userId,
          interviewUserId: interviewUserId,
          interviewUserIdType: typeof interviewUserId,
          isViewingThisUserCalendar,
          type,
          interviewId: interview.id,
          interviewData: interview
        })
        
        if (isViewingThisUserCalendar) {
          console.log(`✅ Обновление календаря в модальном окне: ${type}`, {
            interviewId: interview.id,
            interviewUserId: interview.userId,
            viewingUserId: viewingCalendar.userId,
            type
          })
          
          if (type === 'created') {
            setCalendarInterviews(prev => {
              const exists = prev.some(i => i.id === interview.id)
              if (exists) {
                console.log(`⏭️ Собеседование ${interview.id} уже есть в календаре`)
                return prev
              }
              console.log(`➕ Добавление собеседования ${interview.id} в календарь`)
              return [...prev, interview].sort((a, b) => 
                new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
              )
            })
          } else if (type === 'updated' || type === 'status-updated' || type === 'result-updated') {
            console.log(`🔄 Обновление собеседования ${interview.id} в календаре`)
            setCalendarInterviews(prev => prev.map(i => i.id === interview.id ? interview : i))
          } else if (type === 'deleted') {
            console.log(`🗑️ Удаление собеседования ${interview.id} из календаря в модальном окне`)
            setCalendarInterviews(prev => {
              const filtered = prev.filter(i => i.id !== interview.id)
              console.log(`📊 Календарь после удаления: было ${prev.length}, стало ${filtered.length}`)
              return filtered
            })
          }
        } else {
          console.log(`⚠️ Событие не для просматриваемого календаря:`, {
            interviewUserId: interview.userId,
            viewingUserId: viewingCalendar.userId,
            type,
            interviewId: interview.id,
            comparison: `${Number(interviewUserId)} === ${Number(viewingCalendar.userId)} = ${Number(interviewUserId) === Number(viewingCalendar.userId)}`
          })
        }
      } else {
        if (viewingCalendar.isOpen) {
          console.log(`ℹ️ Модальное окно открыто, но нет userId:`, {
            isOpen: viewingCalendar.isOpen,
            viewingUserId: viewingCalendar.userId,
            interviewUserId: interview.userId,
            type
          })
        }
      }

      if (!isEmployer && interview.userId !== user?.id && type !== 'deleted') {
        if (interview.linkedInterviewId) {
          return
        }
      }

      if (type === 'created') {
        setInterviews(prev => {
          const exists = prev.some(i => i.id === interview.id)
          if (exists) return prev

          if (!isEmployer && interview.userId !== user?.id) {
            if (interview.linkedInterviewId) {
              return prev
            }
            const hasGraduateInterview = prev.some(i =>
              i.userId === user?.id && i.linkedInterviewId === interview.id
            )
            if (hasGraduateInterview) {
              return prev
            }
          }

          return [...prev, interview].sort((a, b) =>
            new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
          )
        })
      } else if (type === 'updated' || type === 'status-updated' || type === 'result-updated') {
        setInterviews(prev => prev.map(i => i.id === interview.id ? interview : i))
      } else if (type === 'deleted') {
        setInterviews(prev => prev.filter(i => i.id !== interview.id))
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ Interview Tracker WebSocket отключен')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket ошибка подключения:', error)
    })

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user, t, viewingCalendar])

  const loadCandidates = async () => {
    try {
      const response = await $api.get('/interview-tracker/employer/candidates')
      setCandidates(response.data)
    } catch (error) {
      console.error('Error loading candidates:', error)
      setCandidates([])
    }
  }

  const loadAllGraduates = async () => {
    try {
      console.log('Loading all graduates from /user/graduates...')
      const response = await $api.get('/user/graduates')
      console.log('Loaded graduates:', response.data?.length || 0, response.data)
      setAllGraduates(response.data || [])
    } catch (error) {
      console.error('Error loading all graduates:', error)
      setAllGraduates([])
    }
  }

  const getFilteredGraduates = () => {
    const query = candidateSearchQuery.toLowerCase().trim()
    console.log('=== FILTERING GRADUATES ===')
    console.log('Query:', query)
    console.log('Total graduates:', allGraduates.length)
    console.log('Sample graduate:', allGraduates[0])
    
    if (query.length === 0) {
      const sorted = allGraduates.sort((a, b) => {
        const nameA = `${a.lastName || ''} ${a.firstName || ''}`.trim() || a.username || ''
        const nameB = `${b.lastName || ''} ${b.firstName || ''}`.trim() || b.username || ''
        return nameA.localeCompare(nameB)
      })
      console.log('No query, returning all sorted:', sorted.length)
      return sorted
    }
    
    const filtered = allGraduates.filter(graduate => {
      const lastName = (graduate.lastName || '').toLowerCase()
      const firstName = (graduate.firstName || '').toLowerCase()
      const username = (graduate.username || '').toLowerCase()
      const fullName = `${lastName} ${firstName}`.trim().toLowerCase()

      console.log('Checking graduate:', {
        lastName,
        firstName,
        username,
        fullName,
        query
      })

      const matches = lastName.includes(query) || 
             firstName.includes(query) || 
             username.includes(query) ||
             fullName.includes(query)
      
      if (matches) {
        console.log('✓ Match found:', graduate.lastName, graduate.firstName, graduate.username)
      }
      
      return matches
    }).sort((a, b) => {
      const lastNameA = (a.lastName || a.username || '').toLowerCase()
      const lastNameB = (b.lastName || b.username || '').toLowerCase()
      if (lastNameA !== lastNameB) {
        return lastNameA.localeCompare(lastNameB)
      }
      const firstNameA = (a.firstName || '').toLowerCase()
      const firstNameB = (b.firstName || '').toLowerCase()
      return firstNameA.localeCompare(firstNameB)
    })
    
    console.log('Filtered graduates:', filtered.length, filtered)
    console.log('=== END FILTERING ===')
    return filtered
  }

  const loadEmployers = async () => {
    try {
      const response = await $api.get('/user/employers')
      setEmployers(response.data)
    } catch (error) {
      console.error('Error loading employers:', error)
      setEmployers([])
    }
  }

  const getFilteredEmployers = () => {
    const query = companySearchQuery.toLowerCase().trim()
    
    if (query.length === 0) {
      return employers.sort((a, b) => {
        const nameA = (a.companyName || a.username || '').toLowerCase()
        const nameB = (b.companyName || b.username || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    }
    
    return employers.filter(employer => {
      const companyName = (employer.companyName || employer.username || '').toLowerCase()
      if (query.length === 1) {
        return companyName.length > 0 && companyName[0] === query[0]
      }
      return companyName.includes(query)
    }).sort((a, b) => {
      const nameA = (a.companyName || a.username || '').toLowerCase()
      const nameB = (b.companyName || b.username || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
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

  const loadAccess = async () => {
    setLoadingAccess(true)
    try {
      const response = await $api.get('/interview-tracker/access')
      if (!isEmployer && employers.length === 0) {
        loadEmployers()
      }
      if (isEmployer && response.data.grantedByMe && response.data.grantedToMe) {
        setGrantedByMe(response.data.grantedByMe)
        setGrantedToMe(response.data.grantedToMe)
      } else {
        if (response.data && response.data.grantedByMe && response.data.grantedToMe) {
          setGrantedByMe(response.data.grantedByMe)
          setGrantedToMe(response.data.grantedToMe)
        } else {
          const accesses = Array.isArray(response.data) ? response.data : []
          setGrantedByMe(accesses)
          setGrantedToMe([])
        }
      }
    } catch (error) {
      console.error('Error loading access:', error)
      setGrantedByMe([])
      setGrantedToMe([])
    } finally {
      setLoadingAccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isNewInterview = !editingInterview

    try {
      if (isEmployer) {
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
        const payload = {
          ...formData,
          employerId: formData.employerId ? Number(formData.employerId) : undefined,
        }
        if (editingInterview) {
          await $api.put(`/interview-tracker/${editingInterview.id}`, payload)
          toast.success(t('interview.tracker.messages.updated'))
        } else {
          await $api.post('/interview-tracker', payload)
          toast.success(t('interview.tracker.messages.added'))
        }
      }

      if (isNewInterview) {
        onInterviewScheduled()
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

  const handleDeleteAccess = async (accessId: number) => {
    try {
      const accessToDelete = isEmployer 
        ? grantedByMe.find(a => a.id === accessId) || grantedToMe.find(a => a.id === accessId)
        : grantedByMe.find(a => a.id === accessId) || grantedToMe.find(a => a.id === accessId)
      
      const targetUserId = isEmployer 
        ? (accessToDelete?.graduate?.id || accessToDelete?.graduateId)
        : (accessToDelete?.employer?.id || accessToDelete?.employerId)
      
      await $api.delete(`/interview-tracker/access/${accessId}`)
      toast.success('Доступ запрещен')

      if (viewingCalendar.isOpen && viewingCalendar.userId === targetUserId) {
        setViewingCalendar({ isOpen: false, userId: null, userName: '' })
        setCalendarInterviews([])
      }

      loadAccess()
    } catch (error: any) {
      console.error('Error deleting access:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при запрете доступа'
      toast.error(errorMessage)
    }
  }

  const handleGrantAccess = async (targetId: number | null) => {
    if (!targetId) {
      toast.error(isEmployer ? 'Выберите выпускника' : 'Выберите компанию')
      return
    }
    
    try {
      console.log('Granting access to targetId:', targetId)
      const response = await $api.post('/interview-tracker/access', { targetId })
      console.log('Access granted successfully:', response.data)
      toast.success('Доступ предоставлен')
      loadAccess()
      if (isEmployer) {
        setSelectedGraduateForAccess(null)
        setAccessSearchQuery('')
      } else {
        setSelectedEmployerForAccess(null)
        setAccessCompanySearchQuery('')
      }
    } catch (error: any) {
      console.error('Error adding access:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.message || 'Ошибка при предоставлении доступа'
      toast.error(errorMessage)
    }
  }

  const handleViewCalendar = async (userId: number, userName: string) => {
    setViewingCalendar({ isOpen: true, userId, userName })
    setLoadingCalendar(true)
    try {
      const response = await $api.get(`/interview-tracker/access/${userId}/calendar`)
      setCalendarInterviews(response.data)
    } catch (error: any) {
      console.error('Error loading calendar:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка при загрузке календаря'
      toast.error(errorMessage)
      setViewingCalendar({ isOpen: false, userId: null, userName: '' })
    } finally {
      setLoadingCalendar(false)
    }
  }

  const getFilteredEmployersForAccess = () => {
    const query = accessCompanySearchQuery.toLowerCase().trim()

    if (query.length === 0) {
      const addedEmployerIds = new Set(grantedByMe.map((a: any) => a.employerId).filter(Boolean))
      return employers
        .filter((employer: any) => !addedEmployerIds.has(employer.id))
        .sort((a: any, b: any) => {
          const nameA = (a.companyName || a.username || '').toLowerCase()
          const nameB = (b.companyName || b.username || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
    }

    const addedEmployerIds = new Set(grantedByMe.map((a: any) => a.employerId).filter(Boolean))

    let availableEmployers = employers.filter((employer: any) => !addedEmployerIds.has(employer.id))

    const filtered = availableEmployers.filter((employer: any) => {
      const companyName = (employer.companyName || employer.username || '').toLowerCase()
      if (query.length === 1) {
        return companyName.length > 0 && companyName[0] === query[0]
      }
      return companyName.includes(query)
    })
    
    return filtered.sort((a: any, b: any) => {
      const nameA = (a.companyName || a.username || '').toLowerCase()
      const nameB = (b.companyName || b.username || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }

  const getFilteredGraduatesForAccess = () => {
    const query = accessSearchQuery.toLowerCase().trim()

    if (query.length === 0) {
      const addedGraduateIds = new Set(grantedByMe.map((a: any) => a.graduateId).filter(Boolean))
      return allGraduates
        .filter((graduate: any) => !addedGraduateIds.has(graduate.id))
        .sort((a: any, b: any) => {
          const lastNameA = (a.lastName || a.username || '').toLowerCase()
          const lastNameB = (b.lastName || b.username || '').toLowerCase()
          if (lastNameA !== lastNameB) {
            return lastNameA.localeCompare(lastNameB)
          }
          const firstNameA = (a.firstName || '').toLowerCase()
          const firstNameB = (b.firstName || '').toLowerCase()
          return firstNameA.localeCompare(firstNameB)
        })
    }

    const addedGraduateIds = new Set(grantedByMe.map((a: any) => a.graduateId).filter(Boolean))

    let availableGraduates = allGraduates.filter((graduate: any) => !addedGraduateIds.has(graduate.id))

    const filtered = availableGraduates.filter((graduate: any) => {
      const lastName = (graduate.lastName || '').toLowerCase()
      const firstName = (graduate.firstName || '').toLowerCase()
      const username = (graduate.username || '').toLowerCase()
      const fullName = `${lastName} ${firstName}`.trim().toLowerCase()

      return lastName.includes(query) || 
             firstName.includes(query) || 
             username.includes(query) ||
             fullName.includes(query)
    })

    return filtered.sort((a: any, b: any) => {
      const lastNameA = (a.lastName || a.username || '').toLowerCase()
      const lastNameB = (b.lastName || b.username || '').toLowerCase()
      if (lastNameA !== lastNameB) {
        return lastNameA.localeCompare(lastNameB)
      }
      const firstNameA = (a.firstName || '').toLowerCase()
      const firstNameB = (b.firstName || '').toLowerCase()
      return firstNameA.localeCompare(firstNameB)
    })
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

  const openModal = (interview?: Interview, date?: Date) => {
    if (isEmployer && allGraduates.length === 0) {
      loadAllGraduates()
    }
    if (!isEmployer && employers.length === 0) {
      loadEmployers()
    }

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
        employerId: interview.employerId || interview.employer?.id || '',
      })
      if (isEmployer && (interview.graduateId || interview.graduate?.id)) {
        const graduateId = interview.graduateId || interview.graduate?.id
        const graduate = allGraduates.find(g => g.id === Number(graduateId))
        if (graduate) {
          setCandidateSearchQuery(graduate.lastName && graduate.firstName
            ? `${graduate.lastName} ${graduate.firstName}`
            : graduate.username || '')
        }
      }
      if (!isEmployer && (interview.employerId || interview.employer?.id)) {
        const employerId = interview.employerId || interview.employer?.id
        const employer = employers.find(e => e.id === Number(employerId))
        if (employer) {
          setCompanySearchQuery(employer.companyName || employer.username || '')
        }
      }
    } else {
      setEditingInterview(null)
      const dateToUse = date || selectedDate
      const year = dateToUse.getFullYear()
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0')
      const day = String(dateToUse.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
          setFormData({
            company: '',
            position: '',
            date: dateString,
            time: '',
            type: 'online',
            location: '',
            meetingLink: '',
            contactPerson: '',
            contactPhone: '',
            notes: '',
            reminder: true,
            graduateId: '',
            employerId: '',
          })
          setCandidateSearchQuery('')
          setCandidateSearchQuery('')
      setCompanySearchQuery('')
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
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
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
            <button
              onClick={() => {
                setViewMode('access')
                loadAccess()
              }}
              className={`px-4 py-2 rounded-lg transition-colors relative group ${
                viewMode === 'access'
                  ? 'bg-accent-cyan text-dark-bg'
                  : 'bg-dark-surface text-gray-300 hover:bg-dark-card'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark-surface text-gray-300 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-dark-card">
                {t('interview.tracker.accessView')}
              </span>
            </button>
          </div>
        </div>

        {viewMode === 'access' ? (
          <Card className="h-full flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
              {loadingAccess ? (
                <div className="py-8">
                  <p className="text-gray-400 text-center">{t('common.loading')}</p>
                </div>
              ) : (
                <>
                  {/* Блок поиска выпускников для работодателя */}
                  {isEmployer && (
                    <Card className="border-2 border-dark-card hover:border-accent-cyan/50 transition-all duration-300">
                      <div className="p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('interview.tracker.access.searchGraduate')}
                        </label>
                        <div className="relative z-10">
                          <input
                            type="text"
                            value={accessSearchQuery || (selectedGraduateForAccess ? (() => {
                              const graduate = allGraduates.find(g => g.id === selectedGraduateForAccess)
                              return graduate?.lastName && graduate?.firstName
                                ? `${graduate.lastName} ${graduate.firstName}`
                                : graduate?.username || ''
                            })() : '')}
                            onChange={(e) => {
                              const value = e.target.value
                              setAccessSearchQuery(value)
                              setSelectedGraduateForAccess(null)
                              if (value === '') {
                                setSelectedGraduateForAccess(null)
                              }
                            }}
                            placeholder={t('interview.tracker.access.searchGraduatePlaceholder')}
                            className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                          />
                          {accessSearchQuery && !selectedGraduateForAccess && getFilteredGraduatesForAccess().length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg max-h-60 overflow-y-auto custom-scrollbar shadow-lg">
                              {getFilteredGraduatesForAccess().slice(0, 20).map((graduate) => {
                                const displayName = graduate.lastName && graduate.firstName
                                  ? `${graduate.lastName} ${graduate.firstName}`
                                  : graduate.username || ''
                                return (
                                  <div
                                    key={graduate.id}
                                    onClick={() => {
                                      setSelectedGraduateForAccess(graduate.id)
                                      setAccessSearchQuery(displayName)
                                    }}
                                    className="px-4 py-2 hover:bg-dark-surface cursor-pointer text-white border-b border-dark-surface last:border-b-0 flex items-center gap-3"
                                  >
                                    {graduate.avatar ? (
                                      <img
                                        src={getImageUrl(graduate.avatar)}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium">{displayName}</div>
                                      {graduate.email && (
                                        <div className="text-xs text-gray-400">{graduate.email}</div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        {accessSearchQuery && getFilteredGraduatesForAccess().length === 0 && allGraduates.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('interview.tracker.access.graduatesNotFound')}
                          </p>
                        )}
                        {selectedGraduateForAccess && (
                          <div className="mt-3 flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const graduate = allGraduates.find(g => g.id === selectedGraduateForAccess)
                                const displayName = graduate?.lastName && graduate?.firstName
                                  ? `${graduate.lastName} ${graduate.firstName}`
                                  : graduate?.username || ''
                                return (
                                  <>
                                    {graduate?.avatar ? (
                                      <img
                                        src={getImageUrl(graduate.avatar)}
                                        alt={displayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-white font-medium">{displayName}</div>
                                      {graduate?.email && (
                                        <div className="text-xs text-gray-400">{graduate.email}</div>
                                      )}
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                            <button
                              onClick={() => {
                                if (selectedGraduateForAccess) {
                                  handleGrantAccess(selectedGraduateForAccess)
                                } else {
                                  toast.error(t('interview.tracker.access.selectGraduate'))
                                }
                              }}
                              disabled={!selectedGraduateForAccess}
                              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Shield className="h-4 w-4" />
                              {t('interview.tracker.access.grantAccess')}
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Блок поиска компаний для выпускника */}
                  {!isEmployer && (
                    <Card className="border-2 border-dark-card hover:border-accent-cyan/50 transition-all duration-300 mb-6">
                      <div className="p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('interview.tracker.access.searchCompany')}
                        </label>
                        <div className="relative z-10">
                          <input
                            type="text"
                            value={accessCompanySearchQuery || (selectedEmployerForAccess ? (() => {
                              const employer = employers.find(e => e.id === selectedEmployerForAccess)
                              return employer?.companyName || employer?.username || ''
                            })() : '')}
                            onChange={(e) => {
                              const value = e.target.value
                              setAccessCompanySearchQuery(value)
                              setSelectedEmployerForAccess(null)
                              if (value === '') {
                                setSelectedEmployerForAccess(null)
                              }
                            }}
                            placeholder={t('interview.tracker.access.searchCompanyPlaceholder')}
                            className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                          />
                          {accessCompanySearchQuery && !selectedEmployerForAccess && getFilteredEmployersForAccess().length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg max-h-60 overflow-y-auto custom-scrollbar shadow-lg">
                              {getFilteredEmployersForAccess().slice(0, 20).map((employer) => {
                                const displayName = employer.companyName || employer.username || ''
                                return (
                                  <div
                                    key={employer.id}
                                    onClick={() => {
                                      setSelectedEmployerForAccess(employer.id)
                                      setAccessCompanySearchQuery(displayName)
                                    }}
                                    className="px-4 py-2 hover:bg-dark-surface cursor-pointer text-white border-b border-dark-surface last:border-b-0 flex items-center gap-3"
                                  >
                                    {employer.avatar ? (
                                      <img
                                        src={getImageUrl(employer.avatar)}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium">{displayName}</div>
                                      {employer.companyDescription && (
                                        <div className="text-xs text-gray-400 line-clamp-1">{employer.companyDescription}</div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        {accessCompanySearchQuery && getFilteredEmployersForAccess().length === 0 && employers.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {t('interview.tracker.access.companiesNotFound')}
                          </p>
                        )}
                        {selectedEmployerForAccess && (
                          <div className="mt-3 flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                            <div className="flex items-center gap-3">
                              {(() => {
                                const employer = employers.find(e => e.id === selectedEmployerForAccess)
                                const displayName = employer?.companyName || employer?.username || ''
                                return (
                                  <>
                                    {employer?.avatar ? (
                                      <img
                                        src={getImageUrl(employer.avatar)}
                                        alt={displayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-white font-medium">{displayName}</div>
                                      {employer?.companyDescription && (
                                        <div className="text-xs text-gray-400 line-clamp-1">{employer.companyDescription}</div>
                                      )}
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                            <button
                              onClick={() => handleGrantAccess(selectedEmployerForAccess)}
                              disabled={!selectedEmployerForAccess}
                              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Shield className="h-4 w-4" />
                              {t('interview.tracker.access.grantAccess')}
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Я разрешаю доступ */}
                  <Card className="border-2 border-dark-card hover:border-accent-cyan/50 transition-all duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {t('interview.tracker.access.iGrantAccess')}
                      </h3>
                      {grantedByMe.length === 0 ? (
                        <p className="text-gray-400 text-sm">{t('interview.tracker.access.noGrantedByMe')}</p>
                      ) : (
                        <div className="space-y-3">
                          {grantedByMe.map((access) => {
                            const user = isEmployer ? access.graduate : access.employer
                            const name = isEmployer
                              ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || t('interview.tracker.access.unknown')
                              : user?.companyName || user?.username || t('interview.tracker.access.unknown')
                            return (
                              <div
                                key={access.id}
                                className="p-4 bg-dark-surface rounded-lg flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  {user?.avatar ? (
                                    <img
                                      src={getImageUrl(user.avatar)}
                                      alt={name}
                                      className="w-10 h-10 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center ${user?.avatar ? 'hidden' : ''}`}>
                                    {isEmployer ? (
                                      <Users className="h-5 w-5 text-accent-cyan" />
                                    ) : (
                                      <Building2 className="h-5 w-5 text-accent-cyan" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{name}</div>
                                    {isEmployer && user?.email && (
                                      <div className="text-sm text-gray-400">{user.email}</div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteAccess(access.id)}
                                  className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                >
                                  {t('interview.tracker.access.revokeAccess')}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Мне разрешили доступ */}
                  <Card className="border-2 border-dark-card hover:border-accent-cyan/50 transition-all duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {t('interview.tracker.access.grantedToMe')}
                      </h3>
                      {grantedToMe.length === 0 ? (
                        <p className="text-gray-400 text-sm">{t('interview.tracker.access.noGrantedToMe')}</p>
                      ) : (
                        <div className="space-y-3">
                          {grantedToMe.map((access) => {
                            const user = isEmployer ? access.graduate : access.employer
                            const name = isEmployer
                              ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || t('interview.tracker.access.unknown')
                              : user?.companyName || user?.username || t('interview.tracker.access.unknown')
                            return (
                              <div
                                key={access.id}
                                className="p-4 bg-dark-surface rounded-lg flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  {user?.avatar ? (
                                    <img
                                      src={getImageUrl(user.avatar)}
                                      alt={name}
                                      className="w-10 h-10 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center ${user?.avatar ? 'hidden' : ''}`}>
                                    {isEmployer ? (
                                      <Users className="h-5 w-5 text-accent-cyan" />
                                    ) : (
                                      <Building2 className="h-5 w-5 text-accent-cyan" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{name}</div>
                                    {user?.email && (
                                      <div className="text-sm text-gray-400">{user.email}</div>
                                    )}
                                  </div>
                                </div>
                                {user?.id && (
                                  <button
                                    onClick={() => handleViewCalendar(user.id, name)}
                                    className="p-2 text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                                    title={t('interview.tracker.access.viewCalendar')}
                                  >
                                    <Eye className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch" style={{ minHeight: '600px' }}>
            {/* Calendar / List View */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              {viewMode === 'calendar' ? (
              <Card className="h-full flex flex-col min-h-0">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
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
                <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
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
                          if (dayInterviews.length === 0) openModal(undefined, date)
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
              <Card className="h-full flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {filteredInterviews.length === 0 ? (
                    <div className="py-8">
                      <p className="text-gray-400 text-center">
                        {t('interview.tracker.noInterviews')}
                      </p>
                    </div>
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
              </Card>
            )}
            </div>

            {/* Sidebar - Upcoming Interviews */}
            <div className="space-y-6 flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                <Bell className="h-5 w-5 text-accent-cyan" />
                {t('interview.tracker.upcoming')}
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
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
              <h3 className="text-lg font-semibold text-white mb-4 flex-shrink-0">{t('interview.tracker.tips.title')}</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
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
        )}

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                    <div className="relative z-10">
                      <input
                        type="text"
                        value={candidateSearchQuery || (formData.graduateId ? (() => {
                          const graduate = allGraduates.find(g => g.id === Number(formData.graduateId))
                          return graduate?.lastName && graduate?.firstName
                            ? `${graduate.lastName} ${graduate.firstName}`
                            : graduate?.username || ''
                        })() : '')}
                        onChange={(e) => {
                          const value = e.target.value
                          console.log('Candidate search query changed:', value)
                          console.log('All graduates count:', allGraduates.length)
                          const filtered = getFilteredGraduates()
                          console.log('Filtered graduates count:', filtered.length)
                          setCandidateSearchQuery(value)
                          if (value === '') {
                            setFormData({ ...formData, graduateId: '' })
                          }
                        }}
                        placeholder="Введите имя или фамилию кандидата..."
                        className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                        required={!formData.graduateId}
                      />
                      {candidateSearchQuery && !formData.graduateId && (
                        <>
                          {getFilteredGraduates().length > 0 ? (
                            <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg max-h-60 overflow-y-auto custom-scrollbar shadow-lg">
                              {getFilteredGraduates().slice(0, 20).map((graduate) => {
                                const displayName = graduate.lastName && graduate.firstName
                                  ? `${graduate.lastName} ${graduate.firstName}`
                                  : graduate.username || ''
                                return (
                                  <div
                                    key={graduate.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        graduateId: graduate.id,
                                      })
                                      setCandidateSearchQuery(displayName)
                                    }}
                                    className="px-4 py-2 hover:bg-dark-surface cursor-pointer text-white border-b border-dark-surface last:border-b-0 flex items-center gap-3"
                                  >
                                    {graduate.avatar ? (
                                      <img
                                        src={getImageUrl(graduate.avatar)}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium">{displayName}</div>
                                      {graduate.email && (
                                        <div className="text-xs text-gray-400">{graduate.email}</div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : allGraduates.length > 0 ? (
                            <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg p-4 text-gray-400 text-sm">
                              Кандидаты не найдены
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                    {allGraduates.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Загрузка списка выпускников...</p>
                    )}
                    {allGraduates.length > 0 && candidateSearchQuery && !formData.graduateId && (
                      <p className="text-xs text-gray-400 mt-1">
                        Найдено: {getFilteredGraduates().length} из {allGraduates.length}
                      </p>
                    )}
                  </div>
                )}

                {/* Поле компании и позиции для выпускников */}
                {!isEmployer && !editingInterview && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.company')} *</label>
                      <div className="relative z-10">
                        <input
                          type="text"
                          value={companySearchQuery || (formData.employerId ? (() => {
                            const employer = employers.find(e => e.id === Number(formData.employerId))
                            return employer?.companyName || employer?.username || ''
                          })() : '')}
                          onChange={(e) => {
                            const value = e.target.value
                            setCompanySearchQuery(value)
                            if (value === '') {
                              setFormData({ ...formData, employerId: '', company: '' })
                            }
                          }}
                          placeholder="Введите название компании..."
                          className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                          required={!formData.employerId}
                        />
                        {companySearchQuery && !formData.employerId && (
                          <>
                            {getFilteredEmployers().length > 0 ? (
                              <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg max-h-60 overflow-y-auto custom-scrollbar shadow-lg">
                                {getFilteredEmployers().slice(0, 20).map((employer) => {
                                  const displayName = employer.companyName || employer.username || ''
                                  return (
                                    <div
                                      key={employer.id}
                                      onClick={() => {
                                        setFormData({
                                          ...formData,
                                          employerId: employer.id,
                                          company: displayName,
                                        })
                                        setCompanySearchQuery(displayName)
                                      }}
                                      className="px-4 py-2 hover:bg-dark-surface cursor-pointer text-white border-b border-dark-surface last:border-b-0 flex items-center gap-3"
                                    >
                                      {employer.avatar ? (
                                        <img
                                          src={getImageUrl(employer.avatar)}
                                          alt={displayName}
                                          className="w-8 h-8 rounded-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center">
                                          <Building2 className="h-4 w-4 text-gray-400" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium">{displayName}</div>
                                        {employer.companyDescription && (
                                          <div className="text-xs text-gray-400 line-clamp-1">{employer.companyDescription}</div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : employers.length > 0 ? (
                              <div className="absolute z-50 w-full mt-1 bg-dark-card border border-dark-card rounded-lg p-4 text-gray-400 text-sm">
                                Компании не найдены
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                      {employers.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">Загрузка списка компаний...</p>
                      )}
                      {employers.length > 0 && companySearchQuery && !formData.employerId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Найдено: {getFilteredEmployers().length} из {employers.length}
                        </p>
                      )}
                    </div>
                    <div>
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
                )}

                {/* Поле позиции для работодателя */}
                {isEmployer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('interview.tracker.form.position')} *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full bg-dark-surface border border-dark-card rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>
                )}

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

      {/* Модальное окно просмотра календаря */}
      {viewingCalendar.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0 border-b border-dark-card">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-accent-cyan" />
                  <h2 className="text-2xl font-bold text-white">
                    Календарь собеседований: {viewingCalendar.userName}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setViewingCalendar({ isOpen: false, userId: null, userName: '' })
                    setCalendarInterviews([])
                    setViewingCalendarDate(new Date())
                  }}
                  className="p-2 hover:bg-dark-surface rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {loadingCalendar ? (
                <div className="text-center py-8 text-gray-400">{t('common.loading')}</div>
              ) : (
                <Card className="h-full flex flex-col min-h-0">
                  {/* Calendar Header */}
                  <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <button
                      onClick={() => setViewingCalendarDate(new Date(viewingCalendarDate.getFullYear(), viewingCalendarDate.getMonth() - 1))}
                      className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-400" />
                    </button>
                    <h2 className="text-xl font-semibold text-white capitalize">
                      {viewingCalendarDate.toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => setViewingCalendarDate(new Date(viewingCalendarDate.getFullYear(), viewingCalendarDate.getMonth() + 1))}
                      className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                      <div key={day} className="text-center text-gray-400 text-sm py-2 font-medium">
                        {t(`interview.tracker.calendar.${day}`)}
                      </div>
                    ))}
                    {getDaysInMonth(viewingCalendarDate).map((date, index) => {
                      const dayInterviews = calendarInterviews.filter((interview: any) => {
                        const interviewDate = new Date(interview.date)
                        return interviewDate.toDateString() === date.toDateString()
                      })
                      const isCurrentMonth = date.getMonth() === viewingCalendarDate.getMonth()
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[80px] p-2 rounded-lg border
                            ${isCurrentMonth ? 'bg-dark-surface border-dark-card' : 'bg-dark-bg border-transparent opacity-50'}
                            ${isToday ? 'border-accent-cyan' : ''}
                          `}
                        >
                          <div className={`text-sm ${isToday ? 'text-accent-cyan font-bold' : 'text-gray-400'}`}>
                            {date.getDate()}
                          </div>
                          {dayInterviews.slice(0, 2).map((interview: any) => {
                            const statusColor = interview.status === 'scheduled' 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : interview.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            
                            return (
                              <div
                                key={interview.id}
                                className={`
                                  mt-1 px-2 py-1 rounded text-xs truncate cursor-pointer border
                                  ${statusColor}
                                `}
                                title={`${interview.time} - ${interview.company} - ${interview.position}`}
                              >
                                {interview.time} {interview.company}
                              </div>
                            )
                          })}
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
              )}
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
  onInvitationResponse?: (action: 'accept' | 'decline') => void
  isEmployer?: boolean
}

const InterviewCard = ({ interview, onEdit, onDelete, onStatusChange, onResultChange, onInvitationResponse, isEmployer }: InterviewCardProps) => {
  const { t, i18n } = useTranslation()
  const TypeIcon = INTERVIEW_TYPES[interview.type].icon
  const [showFeedback, setShowFeedback] = useState(false)

  const hasGraduate = interview.graduate || interview.graduateId
  const displayName = hasGraduate && interview.graduate
    ? (interview.graduate.firstName && interview.graduate.lastName
        ? `${interview.graduate.firstName} ${interview.graduate.lastName}`
        : interview.graduate.username)
    : interview.company
  const DisplayIcon = hasGraduate ? Users : Building2

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
          {interview.location && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{interview.location}</span>
            </div>
          )}
          {interview.meetingLink && (
            <div className="mt-2">
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent-cyan hover:underline flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                {t('interview.tracker.meetingLink') || 'Ссылка на встречу'}
              </a>
            </div>
          )}
          {interview.contactPhone && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <Phone className="h-4 w-4" />
              <a href={`tel:${interview.contactPhone}`} className="hover:text-accent-cyan transition-colors">
                {interview.contactPhone}
              </a>
            </div>
          )}
          {interview.vacancy && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <FileText className="h-4 w-4" />
              <span>{interview.vacancy.title || t('interview.tracker.vacancy') || 'Вакансия'}</span>
            </div>
          )}
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