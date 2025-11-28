import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { Edit, Trash2, Mail, Phone, Building2, Star, Briefcase, MapPin, DollarSign, ExternalLink, X, Save, Archive, User, Calendar, FileText, Heart, GraduationCap, Send, MessageCircle } from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'

interface EmployerProfile {
  photo: string
  lastName: string
  firstName: string
  middleName: string
  company: string
  companyPhoto: string
  contactPhone: string
  contactEmail: string
}

interface Job {
  id: string
  title: string
  company: string
  description: string
  salary: string
  location: string
  type: 'full-time' | 'part-time' | 'remote' | 'hybrid' | 'internship' | 'freelance'
  experience: 'no-experience' | 'junior' | 'middle' | 'senior' | 'lead'
  requirements?: string
  responsibilities?: string
  conditions?: string
  contactInfo?: string
  isArchived?: boolean
  createdAt: string
}

interface Application {
  id: string
  jobId: string
  jobTitle: string
  graduateId: string
  graduateName: string
  graduateEmail: string
  graduatePhoto?: string
  coverLetter?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  createdAt: string
}

interface FavoriteResume {
  id: string
  graduateId: string
  graduateName: string
  graduateEmail: string
  graduatePhoto?: string
  position?: string
  experience?: string
  skills?: string[]
  education?: string
  addedAt: string
}

interface Chat {
  id: string
  graduateName: string
  graduateEmail?: string
  lastMessage: string
  lastMessageTime: string
  messages: Message[]
}

interface Message {
  id: string
  text: string
  sender: 'graduate' | 'employer'
  timestamp: string
  isEdited?: boolean
}

interface EmployerProfileEditFormProps {
  profile: EmployerProfile
  onSave: (profile: EmployerProfile) => void
  onCancel: () => void
}

const EmployerProfileEditForm = ({ profile, onSave, onCancel }: EmployerProfileEditFormProps) => {
  const [formData, setFormData] = useState<EmployerProfile>(profile)

  useEffect(() => {
    setFormData(profile)
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Фото (URL)</label>
        <input
          type="text"
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          className="input-field"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Фамилия</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Имя</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Отчество</label>
          <input
            type="text"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Компания</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Фото компании (URL)</label>
        <input
          type="text"
          value={formData.companyPhoto}
          onChange={(e) => setFormData({ ...formData, companyPhoto: e.target.value })}
          className="input-field"
          placeholder="https://..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Контактный телефон</label>
          <input
            type="text"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="input-field"
            placeholder="+7 (999) 123-45-67"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Контактный email</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="input-field"
            placeholder="contact@company.com"
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
      </div>
    </form>
  )
}

const EmployerProfile = () => {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [profile, setProfile] = useState<EmployerProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [companyRating, setCompanyRating] = useState<{ rating: number; reviewCount: number; companyId: string | null } | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [archivedJobs, setArchivedJobs] = useState<Job[]>([])
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isCreatingJob, setIsCreatingJob] = useState(false)
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    description: '',
    requirements: '',
    responsibilities: '',
    conditions: '',
    salary: '',
    type: 'full-time',
    location: '',
    contactInfo: '',
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [favoriteResumes, setFavoriteResumes] = useState<FavoriteResume[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageText, setEditingMessageText] = useState<string>('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'employer') {
      navigate('/login')
      return
    }
    loadProfile()
  }, [user])

  useEffect(() => {
    if (profile?.company) {
      loadCompanyRating(profile.company)
      loadEmployerJobs()
    }
  }, [profile?.company])

  useEffect(() => {
    if (user && user.role === 'employer') {
      loadApplications()
      loadFavoriteResumes()
      loadChats()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/profile/employer`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProfile({
          photo: data.photo || '',
          lastName: data.lastName || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          company: data.company || '',
          companyPhoto: data.companyPhoto || data.company_photo || '',
          contactPhone: data.contactPhone || data.contact_phone || '',
          contactEmail: data.contactEmail || data.contact_email || user.email || '',
        })
      } else if (response.status === 404) {
        // Примерные данные для демонстрации
        setProfile({
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          lastName: 'Петрова',
          firstName: 'Мария',
          middleName: 'Ивановна',
          company: 'Яндекс',
          companyPhoto: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop',
          contactPhone: '+7 (999) 123-45-67',
          contactEmail: user.email || 'maria.petrova@yandex.ru',
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // В случае ошибки также загружаем примерные данные
      if (!profile) {
        setProfile({
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          lastName: 'Петрова',
          firstName: 'Мария',
          middleName: 'Ивановна',
          company: 'Яндекс',
          companyPhoto: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop',
          contactPhone: '+7 (999) 123-45-67',
          contactEmail: user?.email || 'maria.petrova@yandex.ru',
        })
      }
    }
  }

  const handleSaveProfile = async (newProfile: EmployerProfile) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/profile/employer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProfile)
      })
      if (response.ok) {
        const updatedProfile = await response.json()
        const savedProfile = {
          photo: updatedProfile.photo || '',
          lastName: updatedProfile.lastName || '',
          firstName: updatedProfile.firstName || '',
          middleName: updatedProfile.middleName || '',
          company: updatedProfile.company || '',
          companyPhoto: updatedProfile.companyPhoto || updatedProfile.company_photo || '',
          contactPhone: updatedProfile.contactPhone || updatedProfile.contact_phone || '',
          contactEmail: updatedProfile.contactEmail || updatedProfile.contact_email || '',
        }
        setIsEditingProfile(false)
        await loadProfile()
        setProfile(savedProfile)
        toast.success('Профиль успешно сохранен')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сохранения' }))
        toast.error(errorData.error || 'Ошибка при сохранении профиля')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Ошибка при сохранении профиля')
    }
  }

  const loadCompanyRating = async (companyName: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/companies/ratings`)
      if (response.ok) {
        const data = await response.json()
        const company = data.find((c: any) => 
          c.name === companyName || 
          c.name?.toLowerCase() === companyName.toLowerCase()
        )
        if (company) {
          setCompanyRating({
            rating: company.average_rating || company.averageRating || 0,
            reviewCount: company.review_count || company.reviewCount || 0,
            companyId: company.id?.toString() || company.id || null,
          })
        } else {
          // Если компания не найдена, используем моковые данные для демонстрации
          const mockRatings: { [key: string]: { rating: number; reviewCount: number; companyId: string } } = {
            'Яндекс': { rating: 4.8, reviewCount: 245, companyId: '1' },
            'Сбер': { rating: 4.6, reviewCount: 189, companyId: '2' },
            'VK': { rating: 4.5, reviewCount: 156, companyId: '3' },
            'Тинькофф': { rating: 4.4, reviewCount: 134, companyId: '4' },
            'Ozon': { rating: 4.3, reviewCount: 112, companyId: '5' },
            'Альфа-Банк': { rating: 4.2, reviewCount: 98, companyId: '6' },
            'Mail.ru Group': { rating: 4.1, reviewCount: 87, companyId: '7' },
            'Лаборатория Касперского': { rating: 4.0, reviewCount: 76, companyId: '8' },
          }
          const mockRating = mockRatings[companyName]
          if (mockRating) {
            setCompanyRating(mockRating)
          }
        }
      } else if (response.status === 404) {
        // Моковые данные для демонстрации
        const mockRatings: { [key: string]: { rating: number; reviewCount: number; companyId: string } } = {
          'Яндекс': { rating: 4.8, reviewCount: 245, companyId: '1' },
          'Сбер': { rating: 4.6, reviewCount: 189, companyId: '2' },
          'VK': { rating: 4.5, reviewCount: 156, companyId: '3' },
          'Тинькофф': { rating: 4.4, reviewCount: 134, companyId: '4' },
          'Ozon': { rating: 4.3, reviewCount: 112, companyId: '5' },
          'Альфа-Банк': { rating: 4.2, reviewCount: 98, companyId: '6' },
          'Mail.ru Group': { rating: 4.1, reviewCount: 87, companyId: '7' },
          'Лаборатория Касперского': { rating: 4.0, reviewCount: 76, companyId: '8' },
        }
        const mockRating = mockRatings[companyName]
        if (mockRating) {
          setCompanyRating(mockRating)
        }
      }
    } catch (error) {
      console.error('Error loading company rating:', error)
      // В случае ошибки используем моковые данные
      const mockRatings: { [key: string]: { rating: number; reviewCount: number; companyId: string } } = {
        'Яндекс': { rating: 4.8, reviewCount: 245, companyId: '1' },
        'Сбер': { rating: 4.6, reviewCount: 189, companyId: '2' },
        'VK': { rating: 4.5, reviewCount: 156, companyId: '3' },
        'Тинькофф': { rating: 4.4, reviewCount: 134, companyId: '4' },
        'Ozon': { rating: 4.3, reviewCount: 112, companyId: '5' },
        'Альфа-Банк': { rating: 4.2, reviewCount: 98, companyId: '6' },
        'Mail.ru Group': { rating: 4.1, reviewCount: 87, companyId: '7' },
        'Лаборатория Касперского': { rating: 4.0, reviewCount: 76, companyId: '8' },
      }
      const mockRating = mockRatings[companyName]
      if (mockRating) {
        setCompanyRating(mockRating)
      }
    }
  }

  const loadEmployerJobs = async () => {
    if (!user || !profile?.company) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/jobs?employer=${user.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const allJobs = data.map((job: any) => ({
          id: job.id.toString(),
          title: job.title,
          company: job.company,
          description: job.description || '',
          salary: job.salary || '',
          location: job.location || '',
          type: job.type || 'full-time',
          experience: job.experience || 'junior',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          conditions: job.conditions || '',
          contactInfo: job.contactInfo || job.contact_info || '',
          isArchived: job.is_archived || job.isArchived || false,
          createdAt: job.created_at || job.createdAt || new Date().toISOString(),
        }))
        setJobs(allJobs.filter((job: Job) => !job.isArchived))
        setArchivedJobs(allJobs.filter((job: Job) => job.isArchived))
      } else if (response.status === 404) {
        // Моковые данные для демонстрации
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Frontend Developer',
            company: profile.company,
            description: 'Разработка пользовательских интерфейсов на React и TypeScript',
            salary: '150 000 - 250 000 ₽',
            location: 'Москва',
            type: 'full-time',
            experience: 'middle',
            requirements: 'Опыт работы с React, TypeScript, Redux',
            responsibilities: 'Разработка новых компонентов, оптимизация производительности, код-ревью',
            conditions: 'Удаленная работа, гибкий график, медицинская страховка',
            contactInfo: profile.contactEmail || 'hr@company.com',
            isArchived: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            title: 'Backend Developer',
            company: profile.company,
            description: 'Разработка серверной части приложений на Node.js',
            salary: '180 000 - 300 000 ₽',
            location: 'Москва',
            type: 'full-time',
            experience: 'senior',
            requirements: 'Опыт работы с Node.js, PostgreSQL, Docker',
            responsibilities: 'Проектирование архитектуры, разработка API, работа с базами данных',
            conditions: 'Офис в центре Москвы, корпоративные обеды, спортзал',
            contactInfo: profile.contactEmail || 'hr@company.com',
            isArchived: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            title: 'DevOps Engineer',
            company: profile.company,
            description: 'Настройка CI/CD, мониторинг инфраструктуры',
            salary: '200 000 - 350 000 ₽',
            location: 'Москва',
            type: 'full-time',
            experience: 'senior',
            requirements: 'Опыт работы с Kubernetes, AWS, Terraform',
            responsibilities: 'Настройка и поддержка инфраструктуры, автоматизация процессов',
            conditions: 'Гибридный формат работы',
            contactInfo: profile.contactEmail || 'hr@company.com',
            isArchived: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
        ]
        setJobs(mockJobs.filter(job => !job.isArchived))
        setArchivedJobs(mockJobs.filter(job => job.isArchived))
      }
    } catch (error) {
      console.error('Error loading employer jobs:', error)
      // В случае ошибки используем моковые данные
      if (profile?.company) {
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Frontend Developer',
            company: profile.company,
            description: 'Разработка пользовательских интерфейсов на React и TypeScript',
            salary: '150 000 - 250 000 ₽',
            location: 'Москва',
            type: 'full-time',
            experience: 'middle',
            requirements: 'Опыт работы с React, TypeScript, Redux',
            responsibilities: 'Разработка новых компонентов, оптимизация производительности',
            conditions: 'Удаленная работа, гибкий график',
            contactInfo: profile.contactEmail || 'hr@company.com',
            isArchived: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]
        setJobs(mockJobs.filter(job => !job.isArchived))
        setArchivedJobs(mockJobs.filter(job => job.isArchived))
      }
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1
      return (
        <Star
          key={index}
          className={`h-4 w-4 ${
            starValue <= Math.round(rating)
              ? 'text-accent-gold fill-accent-gold'
              : 'text-gray-600'
          }`}
        />
      )
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/applications?employerId=${user.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.map((app: any) => ({
          id: app.id.toString(),
          jobId: app.job_id || app.jobId || '',
          jobTitle: app.job_title || app.jobTitle || '',
          graduateId: app.graduate_id || app.graduateId || '',
          graduateName: app.graduate_name || app.graduateName || 'Выпускник',
          graduateEmail: app.graduate_email || app.graduateEmail || '',
          graduatePhoto: app.graduate_photo || app.graduatePhoto || '',
          coverLetter: app.cover_letter || app.coverLetter || '',
          status: app.status || 'pending',
          createdAt: app.created_at || app.createdAt || new Date().toISOString(),
        })))
      } else if (response.status === 404) {
        // Моковые данные для демонстрации
        setApplications([
          {
            id: '1',
            jobId: '1',
            jobTitle: 'Frontend Developer',
            graduateId: 'grad1',
            graduateName: 'Иван Петров',
            graduateEmail: 'ivan.petrov@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
            coverLetter: 'Здравствуйте! Меня заинтересовала ваша вакансия Frontend Developer. У меня есть опыт работы с React и TypeScript...',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            jobId: '1',
            jobTitle: 'Frontend Developer',
            graduateId: 'grad2',
            graduateName: 'Мария Сидорова',
            graduateEmail: 'maria.sidorova@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
            coverLetter: 'Добрый день! Хотела бы откликнуться на вакансию Frontend Developer. Имею опыт разработки на React...',
            status: 'reviewed',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            jobId: '2',
            jobTitle: 'Backend Developer',
            graduateId: 'grad3',
            graduateName: 'Алексей Козлов',
            graduateEmail: 'alexey.kozlov@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            coverLetter: 'Интересует вакансия Backend Developer. Опыт работы с Node.js более 3 лет...',
            status: 'pending',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      // В случае ошибки используем моковые данные
      setApplications([
        {
          id: '1',
          jobId: '1',
          jobTitle: 'Frontend Developer',
          graduateId: 'grad1',
          graduateName: 'Иван Петров',
          graduateEmail: 'ivan.petrov@example.com',
          graduatePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          coverLetter: 'Здравствуйте! Меня заинтересовала ваша вакансия Frontend Developer...',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'На рассмотрении', color: 'text-yellow-400 bg-yellow-400/10' }
      case 'reviewed':
        return { label: 'Просмотрено', color: 'text-blue-400 bg-blue-400/10' }
      case 'accepted':
        return { label: 'Принято', color: 'text-green-400 bg-green-400/10' }
      case 'rejected':
        return { label: 'Отклонено', color: 'text-red-400 bg-red-400/10' }
      default:
        return { label: 'На рассмотрении', color: 'text-gray-400 bg-gray-400/10' }
    }
  }

  const loadFavoriteResumes = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/favorites/resumes?employerId=${user.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setFavoriteResumes(data.map((resume: any) => ({
          id: resume.id.toString(),
          graduateId: resume.graduate_id || resume.graduateId || '',
          graduateName: resume.graduate_name || resume.graduateName || 'Выпускник',
          graduateEmail: resume.graduate_email || resume.graduateEmail || '',
          graduatePhoto: resume.graduate_photo || resume.graduatePhoto || '',
          position: resume.position || '',
          experience: resume.experience || '',
          skills: resume.skills || [],
          education: resume.education || '',
          addedAt: resume.added_at || resume.addedAt || new Date().toISOString(),
        })))
      } else if (response.status === 404) {
        // Моковые данные для демонстрации
        setFavoriteResumes([
          {
            id: '1',
            graduateId: 'grad1',
            graduateName: 'Анна Смирнова',
            graduateEmail: 'anna.smirnova@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            position: 'Frontend Developer',
            experience: '2 года',
            skills: ['React', 'TypeScript', 'Redux', 'CSS'],
            education: 'МГУ, Факультет вычислительной математики и кибернетики',
            addedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            graduateId: 'grad2',
            graduateName: 'Дмитрий Волков',
            graduateEmail: 'dmitry.volkov@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            position: 'Backend Developer',
            experience: '3 года',
            skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
            education: 'МФТИ, Факультет управления и прикладной математики',
            addedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: '3',
            graduateId: 'grad3',
            graduateName: 'Елена Новикова',
            graduateEmail: 'elena.novikova@example.com',
            graduatePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
            position: 'Fullstack Developer',
            experience: '1 год',
            skills: ['React', 'Node.js', 'MongoDB', 'Express'],
            education: 'СПбГУ, Математико-механический факультет',
            addedAt: new Date(Date.now() - 259200000).toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error('Error loading favorite resumes:', error)
      // В случае ошибки используем моковые данные
      setFavoriteResumes([
        {
          id: '1',
          graduateId: 'grad1',
          graduateName: 'Анна Смирнова',
          graduateEmail: 'anna.smirnova@example.com',
          graduatePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          position: 'Frontend Developer',
          experience: '2 года',
          skills: ['React', 'TypeScript', 'Redux'],
          education: 'МГУ, Факультет вычислительной математики и кибернетики',
          addedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
    }
  }

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!user) return
    if (!confirm('Удалить резюме из избранного?')) {
      return
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/favorites/resumes/${favoriteId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Резюме удалено из избранного')
        loadFavoriteResumes()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка' }))
        toast.error(errorData.error || 'Ошибка при удалении из избранного')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      // В случае ошибки просто удаляем локально для демонстрации
      setFavoriteResumes(favoriteResumes.filter(r => r.id !== favoriteId))
      toast.success('Резюме удалено из избранного')
    }
  }

  const handleEditJob = (job: Job) => {
    setEditingJobId(job.id)
    setEditingJob({ ...job })
  }

  const handleCancelEditJob = () => {
    setEditingJobId(null)
    setEditingJob(null)
  }

  const handleSaveJob = async () => {
    if (!editingJob || !user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingJob)
      })
      if (response.ok) {
        toast.success('Вакансия успешно обновлена')
        setEditingJobId(null)
        setEditingJob(null)
        loadEmployerJobs()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка обновления' }))
        toast.error(errorData.error || 'Ошибка при обновлении вакансии')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Ошибка при обновлении вакансии')
    }
  }

  const handleArchiveJob = async (jobId: string) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите закрыть эту вакансию? Она будет перемещена в архив.')) {
      return
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/jobs/${jobId}/archive`, {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Вакансия закрыта и перемещена в архив')
        loadEmployerJobs()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка' }))
        toast.error(errorData.error || 'Ошибка при закрытии вакансии')
      }
    } catch (error) {
      console.error('Error archiving job:', error)
      // В случае ошибки просто перемещаем локально для демонстрации
      const job = jobs.find(j => j.id === jobId)
      if (job) {
        setJobs(jobs.filter(j => j.id !== jobId))
        setArchivedJobs([...archivedJobs, { ...job, isArchived: true }])
        toast.success('Вакансия закрыта и перемещена в архив')
      }
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите удалить эту вакансию? Это действие нельзя отменить.')) {
      return
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        toast.success('Вакансия удалена')
        loadEmployerJobs()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка' }))
        toast.error(errorData.error || 'Ошибка при удалении вакансии')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      // В случае ошибки просто удаляем локально для демонстрации
      setJobs(jobs.filter(j => j.id !== jobId))
      setArchivedJobs(archivedJobs.filter(j => j.id !== jobId))
      toast.success('Вакансия удалена')
    }
  }

  const handleCreateJob = () => {
    if (profile?.company) {
      setNewJob({
        title: '',
        company: profile.company,
        description: '',
        requirements: '',
        responsibilities: '',
        conditions: '',
        salary: '',
        type: 'full-time',
        location: '',
        contactInfo: profile.contactEmail || profile.contactPhone || '',
      })
      setIsCreatingJob(true)
    }
  }

  const handleCancelCreateJob = () => {
    setIsCreatingJob(false)
    setNewJob({
      title: '',
      company: '',
      description: '',
      requirements: '',
      responsibilities: '',
      conditions: '',
      salary: '',
      type: 'full-time',
      location: '',
      contactInfo: '',
    })
  }

  const handleSaveNewJob = async () => {
    if (!user || !newJob.title || !newJob.company || !newJob.description) {
      toast.error('Заполните обязательные поля: название, компания, описание')
      return
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          description: newJob.description,
          requirements: newJob.requirements || '',
          responsibilities: newJob.responsibilities || '',
          conditions: newJob.conditions || '',
          salary: newJob.salary || '',
          type: newJob.type || 'full-time',
          location: newJob.location || '',
          contactInfo: newJob.contactInfo || '',
          experience: 'junior',
        })
      })
      if (response.ok) {
        toast.success('Вакансия успешно создана')
        setIsCreatingJob(false)
        setNewJob({
          title: '',
          company: '',
          description: '',
          requirements: '',
          responsibilities: '',
          conditions: '',
          salary: '',
          type: 'full-time',
          location: '',
          contactInfo: '',
        })
        loadEmployerJobs()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка создания' }))
        toast.error(errorData.error || 'Ошибка при создании вакансии')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error('Ошибка при создании вакансии')
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    if (confirm('Вы уверены, что хотите удалить профиль?')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
        const response = await fetch(`${apiUrl}/profile/employer`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (response.ok) {
          setProfile(null)
          toast.success('Профиль удален')
        }
      } catch (error) {
        console.error('Error deleting profile:', error)
        toast.error('Ошибка при удалении профиля')
      }
    }
  }

  const loadChats = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data.map((chat: any) => ({
          id: chat.id.toString(),
          graduateName: chat.other_user_name || chat.graduate_name || '',
          graduateEmail: chat.graduate_email || '',
          lastMessage: chat.last_message || '',
          lastMessageTime: chat.last_message_time || '',
          messages: [],
        })))
      } else if (response.status === 404) {
        // Примерные данные для демонстрации
        const mockChats: Chat[] = [
          {
            id: '1',
            graduateName: 'Иван Петров',
            graduateEmail: 'ivan.petrov@example.com',
            lastMessage: 'Спасибо за информацию! Буду ждать ответа.',
            lastMessageTime: '14:30',
            messages: [
              {
                id: '1',
                text: 'Здравствуйте! Я заинтересован в вакансии Frontend Developer.',
                sender: 'graduate',
                timestamp: '10:15',
                isEdited: false,
              },
              {
                id: '2',
                text: 'Здравствуйте! Спасибо за интерес. Расскажите немного о своем опыте работы с React.',
                sender: 'employer',
                timestamp: '10:20',
                isEdited: false,
              },
              {
                id: '3',
                text: 'У меня 2 года опыта работы с React и TypeScript. Участвовал в разработке нескольких крупных проектов.',
                sender: 'graduate',
                timestamp: '10:25',
                isEdited: false,
              },
              {
                id: '4',
                text: 'Отлично! Можем назначить собеседование на следующей неделе?',
                sender: 'employer',
                timestamp: '14:20',
                isEdited: false,
              },
              {
                id: '5',
                text: 'Спасибо за информацию! Буду ждать ответа.',
                sender: 'graduate',
                timestamp: '14:30',
                isEdited: false,
              },
            ],
          },
          {
            id: '2',
            graduateName: 'Мария Сидорова',
            graduateEmail: 'maria.sidorova@example.com',
            lastMessage: 'Хорошо, отправлю резюме сегодня вечером',
            lastMessageTime: 'Вчера',
            messages: [
              {
                id: '1',
                text: 'Добрый день! Видела вашу вакансию на сайте.',
                sender: 'graduate',
                timestamp: '09:00',
                isEdited: false,
              },
              {
                id: '2',
                text: 'Добрый день! Пришлите, пожалуйста, ваше резюме.',
                sender: 'employer',
                timestamp: '09:15',
                isEdited: false,
              },
              {
                id: '3',
                text: 'Конечно, отправлю сегодня вечером.',
                sender: 'graduate',
                timestamp: '09:20',
                isEdited: false,
              },
              {
                id: '4',
                text: 'Хорошо, жду ваше резюме',
                sender: 'employer',
                timestamp: '09:25',
                isEdited: false,
              },
            ],
          },
          {
            id: '3',
            graduateName: 'Алексей Козлов',
            graduateEmail: 'alexey.kozlov@example.com',
            lastMessage: 'Отлично, тогда до встречи!',
            lastMessageTime: '2 дня назад',
            messages: [
              {
                id: '1',
                text: 'Здравствуйте! Хотел бы узнать больше о вакансии.',
                sender: 'graduate',
                timestamp: '16:00',
                isEdited: false,
              },
              {
                id: '2',
                text: 'Здравствуйте! Какие вопросы у вас есть?',
                sender: 'employer',
                timestamp: '16:10',
                isEdited: false,
              },
              {
                id: '3',
                text: 'Интересует формат работы и стек технологий.',
                sender: 'graduate',
                timestamp: '16:15',
                isEdited: false,
              },
              {
                id: '4',
                text: 'Удаленная работа, React, TypeScript, Node.js. Можем обсудить на собеседовании.',
                sender: 'employer',
                timestamp: '16:20',
                isEdited: false,
              },
              {
                id: '5',
                text: 'Спасибо за информацию!',
                sender: 'graduate',
                timestamp: '16:25',
                isEdited: false,
              },
              {
                id: '6',
                text: 'Отлично, тогда до встречи!',
                sender: 'employer',
                timestamp: '16:30',
                isEdited: false,
              },
            ],
          },
        ]
        setChats(mockChats)
        // Автоматически выбираем первый чат для демонстрации
        if (mockChats.length > 0) {
          setSelectedChat(mockChats[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      // В случае ошибки также загружаем примерные данные
      const mockChats: Chat[] = [
        {
          id: '1',
          graduateName: 'Иван Петров',
          graduateEmail: 'ivan.petrov@example.com',
          lastMessage: 'Спасибо за информацию! Буду ждать ответа.',
          lastMessageTime: '14:30',
          messages: [
            {
              id: '1',
              text: 'Здравствуйте! Я заинтересован в вакансии Frontend Developer.',
              sender: 'graduate',
              timestamp: '10:15',
              isEdited: false,
            },
            {
              id: '2',
              text: 'Здравствуйте! Спасибо за интерес. Расскажите немного о своем опыте работы с React.',
              sender: 'employer',
              timestamp: '10:20',
              isEdited: false,
            },
          ],
        },
      ]
      setChats(mockChats)
      if (mockChats.length > 0) {
        setSelectedChat(mockChats[0].id)
      }
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите удалить этот чат?')) return
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== id))
        if (selectedChat === id) {
          setSelectedChat(null)
        }
        toast.success('Чат удален')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error('Ошибка при удалении чата')
    }
  }

  const loadChatMessages = async (chatId: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const messages = data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.text,
          sender: msg.sender_type === 'employer' ? 'employer' : 'graduate',
          timestamp: new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          isEdited: msg.is_edited || false,
        }))
        
        setChats(prevChats => prevChats.map(chat =>
          chat.id === chatId ? { ...chat, messages } : chat
        ))
      } else if (response.status === 404) {
        // Если сообщения не найдены, но чат уже имеет сообщения (из примерных данных), оставляем их
        setChats(prevChats => prevChats.map(chat =>
          chat.id === chatId ? chat : chat
        ))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      // В случае ошибки оставляем существующие сообщения
    }
  }

  useEffect(() => {
    if (selectedChat && user) {
      loadChatMessages(selectedChat)
    }
  }, [selectedChat, user])

  // Автоматически выбираем первый чат при загрузке, если чат не выбран
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0].id)
    }
  }, [chats, selectedChat])

  const handleSendMessage = async (chatId: string) => {
    if (!messageText.trim() || !user) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: messageText })
      })
      if (response.ok) {
        setMessageText('')
        loadChatMessages(chatId)
        toast.success('Сообщение отправлено')
      } else {
        toast.error('Ошибка при отправке сообщения')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Ошибка при отправке сообщения')
    }
  }

  const handleEditMessage = async (chatId: string, messageId: string, newText: string) => {
    if (!user || !newText.trim()) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: newText })
      })
      if (response.ok) {
        setEditingMessageId(null)
        setEditingMessageText('')
        loadChatMessages(chatId)
        toast.success('Сообщение отредактировано')
      } else {
        toast.error('Ошибка при редактировании сообщения')
      }
    } catch (error) {
      console.error('Error editing message:', error)
      toast.error('Ошибка при редактировании сообщения')
    }
  }

  const startEditingMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId)
    setEditingMessageText(currentText)
  }

  const cancelEditingMessage = () => {
    setEditingMessageId(null)
    setEditingMessageText('')
  }

  const handleDeleteMessage = async (chatId: string, messageId: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
      const response = await fetch(`${apiUrl}/chats/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        loadChatMessages(chatId)
        toast.success('Сообщение удалено')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Ошибка при удалении сообщения')
    }
  }

  const selectedChatData = chats.find(c => c.id === selectedChat)

  useScrollAnimation()

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Section */}
        <Section title="" className="bg-dark-bg py-0 scroll-animate-item">
          {profile ? (
            <>
              {/* Header Card with Photo and Basic Info */}
              <Card className="mb-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-white">Мой профиль</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="p-2 text-accent-cyan hover:bg-dark-surface rounded-lg transition-colors"
                      title="Редактировать профиль"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                      title="Удалить профиль"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {isEditingProfile ? (
                  <EmployerProfileEditForm
                    profile={profile}
                    onSave={handleSaveProfile}
                    onCancel={() => setIsEditingProfile(false)}
                  />
                ) : (
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Photo */}
                    <div className="w-full md:w-56 h-56 bg-dark-surface rounded-2xl overflow-hidden border-2 border-accent-cyan/30 flex items-center justify-center shadow-lg">
                      {profile.photo ? (
                        <img 
                          src={profile.photo} 
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-6xl text-gray-400">👤</span>
                      )}
                    </div>
                    
                    {/* Name and Contact Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {profile.lastName} {profile.firstName} {profile.middleName}
                        </h1>
                        <p className="text-accent-cyan text-lg font-medium">Работодатель</p>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {profile.contactEmail && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Mail className="h-5 w-5 text-accent-cyan" />
                            <a href={`mailto:${profile.contactEmail}`} className="hover:text-accent-cyan transition-colors">
                              {profile.contactEmail}
                            </a>
                          </div>
                        )}
                        {profile.contactPhone && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Phone className="h-5 w-5 text-accent-cyan" />
                            <a href={`tel:${profile.contactPhone}`} className="hover:text-accent-cyan transition-colors">
                              {profile.contactPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Company Section */}
              {profile.company && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">Компания</h3>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    {profile.companyPhoto && (
                      <div className="w-full md:w-48 h-48 bg-dark-surface rounded-xl overflow-hidden border border-dark-card flex items-center justify-center flex-shrink-0">
                        <img 
                          src={profile.companyPhoto} 
                          alt={profile.company}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-white text-lg font-semibold">{profile.company}</p>
                          {companyRating && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(companyRating.rating)}
                              </div>
                              <span className="text-gray-300 text-sm font-medium">
                                {companyRating.rating.toFixed(1)}
                              </span>
                              {companyRating.companyId ? (
                                <Link 
                                  to={`/companies/${companyRating.companyId}`}
                                  className="text-gray-400 text-xs hover:text-accent-cyan transition-colors"
                                >
                                  ({companyRating.reviewCount} {companyRating.reviewCount === 1 ? 'отзыв' : companyRating.reviewCount < 5 ? 'отзыва' : 'отзывов'})
                                </Link>
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  ({companyRating.reviewCount} {companyRating.reviewCount === 1 ? 'отзыв' : companyRating.reviewCount < 5 ? 'отзыва' : 'отзывов'})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Jobs Section */}
              {!isEditingProfile && (
                <>
                  <Card className="mb-6 scroll-animate-item">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-6 w-6 text-accent-cyan" />
                        <h3 className="text-xl font-semibold text-white">Мои вакансии</h3>
                      </div>
                      <button
                        onClick={handleCreateJob}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Briefcase className="h-4 w-4" />
                        Создать вакансию
                      </button>
                    </div>
                    
                    {/* Form for creating new job */}
                    {isCreatingJob && (
                      <div className="mb-6 p-4 bg-dark-surface rounded-xl border border-accent-cyan/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Создание новой вакансии</h4>
                          <button
                            onClick={handleCancelCreateJob}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Название вакансии <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={newJob.title}
                              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                              className="input-field"
                              placeholder="Например: Frontend Developer"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Компания <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              value={newJob.company}
                              onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Описание вакансии <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={newJob.description}
                              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                              className="input-field"
                              rows={4}
                              placeholder="Опишите вакансию..."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Требования</label>
                            <textarea
                              value={newJob.requirements}
                              onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                              className="input-field"
                              rows={3}
                              placeholder="Опишите требования к кандидату..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Обязанности</label>
                            <textarea
                              value={newJob.responsibilities}
                              onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })}
                              className="input-field"
                              rows={3}
                              placeholder="Опишите обязанности..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Условия работы</label>
                            <textarea
                              value={newJob.conditions}
                              onChange={(e) => setNewJob({ ...newJob, conditions: e.target.value })}
                              className="input-field"
                              rows={3}
                              placeholder="Опишите условия работы..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Зарплата</label>
                              <input
                                type="text"
                                value={newJob.salary}
                                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                                className="input-field"
                                placeholder="150 000 - 250 000 ₽"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Тип занятости</label>
                              <select
                                value={newJob.type}
                                onChange={(e) => setNewJob({ ...newJob, type: e.target.value as Job['type'] })}
                                className="input-field"
                              >
                                <option value="full-time">Полная занятость</option>
                                <option value="part-time">Частичная занятость</option>
                                <option value="remote">Удаленная работа</option>
                                <option value="hybrid">Гибрид</option>
                                <option value="internship">Стажировка</option>
                                <option value="freelance">Фриланс</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Город</label>
                              <input
                                type="text"
                                value={newJob.location}
                                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                className="input-field"
                                placeholder="Москва"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Контактная информация</label>
                              <input
                                type="text"
                                value={newJob.contactInfo}
                                onChange={(e) => setNewJob({ ...newJob, contactInfo: e.target.value })}
                                className="input-field"
                                placeholder="email@company.com или +7 (999) 123-45-67"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveNewJob}
                              className="btn-primary flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Создать вакансию
                            </button>
                            <button
                              onClick={handleCancelCreateJob}
                              className="btn-secondary flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Отмена
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {jobs.length > 0 ? (
                      <div className="space-y-4">
                        {jobs.map((job, index) => (
                          <div
                            key={job.id}
                            className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-all scroll-animate-item"
                            style={{ transitionDelay: `${index * 0.05}s` }}
                          >
                            {editingJobId === job.id && editingJob ? (
                              // Форма редактирования вакансии
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Название вакансии <span className="text-red-400">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editingJob.title}
                                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Компания <span className="text-red-400">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editingJob.company}
                                    onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                                    className="input-field"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Описание вакансии <span className="text-red-400">*</span>
                                  </label>
                                  <textarea
                                    value={editingJob.description}
                                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                                    className="input-field"
                                    rows={4}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Требования</label>
                                  <textarea
                                    value={editingJob.requirements || ''}
                                    onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Опишите требования к кандидату..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Обязанности</label>
                                  <textarea
                                    value={editingJob.responsibilities || ''}
                                    onChange={(e) => setEditingJob({ ...editingJob, responsibilities: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Опишите обязанности..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Условия работы</label>
                                  <textarea
                                    value={editingJob.conditions || ''}
                                    onChange={(e) => setEditingJob({ ...editingJob, conditions: e.target.value })}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Опишите условия работы..."
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Зарплата</label>
                                    <input
                                      type="text"
                                      value={editingJob.salary}
                                      onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                                      className="input-field"
                                      placeholder="150 000 - 250 000 ₽"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Тип занятости</label>
                                    <select
                                      value={editingJob.type}
                                      onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value as Job['type'] })}
                                      className="input-field"
                                    >
                                      <option value="full-time">Полная занятость</option>
                                      <option value="part-time">Частичная занятость</option>
                                      <option value="remote">Удаленная работа</option>
                                      <option value="hybrid">Гибрид</option>
                                      <option value="internship">Стажировка</option>
                                      <option value="freelance">Фриланс</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Город</label>
                                    <input
                                      type="text"
                                      value={editingJob.location}
                                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                                      className="input-field"
                                      placeholder="Москва"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Контактная информация</label>
                                    <input
                                      type="text"
                                      value={editingJob.contactInfo || ''}
                                      onChange={(e) => setEditingJob({ ...editingJob, contactInfo: e.target.value })}
                                      className="input-field"
                                      placeholder="email@company.com или +7 (999) 123-45-67"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveJob}
                                    className="btn-primary flex items-center gap-2"
                                  >
                                    <Save className="h-4 w-4" />
                                    Сохранить
                                  </button>
                                  <button
                                    onClick={handleCancelEditJob}
                                    className="btn-secondary flex items-center gap-2"
                                  >
                                    <X className="h-4 w-4" />
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Отображение вакансии
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-white mb-2">{job.title}</h4>
                                  <div className="flex flex-wrap gap-4 text-gray-300 text-sm mb-2">
                                    {job.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-accent-cyan" />
                                        <span>{job.location}</span>
                                      </div>
                                    )}
                                    {job.salary && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-accent-cyan" />
                                        <span>{job.salary}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-4 w-4 text-accent-cyan" />
                                      <span>
                                        {job.type === 'full-time' ? 'Полная занятость' :
                                         job.type === 'part-time' ? 'Частичная занятость' :
                                         job.type === 'remote' ? 'Удаленная работа' :
                                         job.type === 'hybrid' ? 'Гибрид' :
                                         job.type === 'internship' ? 'Стажировка' : 'Фриланс'}
                                      </span>
                                    </div>
                                  </div>
                                  {job.description && (
                                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{job.description}</p>
                                  )}
                                  <p className="text-gray-500 text-xs">
                                    Опубликовано: {formatDate(job.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
                                    title="Редактировать"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleArchiveJob(job.id)}
                                    className="p-2 text-yellow-400 hover:bg-dark-card rounded-lg transition-colors"
                                    title="Закрыть вакансию"
                                  >
                                    <Archive className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-2 text-red-400 hover:bg-dark-card rounded-lg transition-colors"
                                    title="Удалить"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <Link
                                    to={`/jobs`}
                                    className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
                                    title="Подробнее"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">У вас пока нет размещенных вакансий</p>
                      </div>
                    )}
                  </Card>

                  {/* Archived Jobs Section */}
                  {archivedJobs.length > 0 && (
                    <Card className="mb-6 scroll-animate-item">
                      <div className="flex items-center gap-3 mb-4">
                        <Archive className="h-6 w-6 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-400">Архив вакансий</h3>
                      </div>
                      <div className="space-y-4">
                        {archivedJobs.map((job, index) => (
                          <div
                            key={job.id}
                            className="bg-dark-surface rounded-xl p-4 border border-gray-700 opacity-75 scroll-animate-item"
                            style={{ transitionDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-400">{job.title}</h4>
                                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">Закрыта</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-2">
                                  {job.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{job.location}</span>
                                    </div>
                                  )}
                                  {job.salary && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      <span>{job.salary}</span>
                                    </div>
                                  )}
                                </div>
                                {job.description && (
                                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{job.description}</p>
                                )}
                                <p className="text-gray-600 text-xs">
                                  Опубликовано: {formatDate(job.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="p-2 text-red-400 hover:bg-dark-card rounded-lg transition-colors"
                                  title="Удалить"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Applications Section */}
                  <Card className="mb-6 scroll-animate-item">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-6 w-6 text-accent-cyan" />
                      <h3 className="text-xl font-semibold text-white">Отклики на вакансии</h3>
                    </div>
                    {applications.length > 0 ? (
                      <div className="space-y-4">
                        {applications.map((application, index) => {
                          const statusInfo = getStatusLabel(application.status)
                          return (
                            <div
                              key={application.id}
                              className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-all scroll-animate-item"
                              style={{ transitionDelay: `${index * 0.05}s` }}
                            >
                              <div className="flex items-start gap-4">
                                {/* Graduate Photo */}
                                <Link
                                  to={`/profile/graduate`}
                                  className="flex-shrink-0"
                                >
                                  <div className="w-16 h-16 bg-dark-card rounded-full overflow-hidden border-2 border-accent-cyan/30 flex items-center justify-center hover:border-accent-cyan transition-colors">
                                    {application.graduatePhoto ? (
                                      <img
                                        src={application.graduatePhoto}
                                        alt={application.graduateName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="h-8 w-8 text-gray-400" />
                                    )}
                                  </div>
                                </Link>

                                {/* Application Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <Link
                                        to={`/profile/graduate`}
                                        className="block"
                                      >
                                        <h4 className="text-lg font-semibold text-white hover:text-accent-cyan transition-colors mb-1">
                                          {application.graduateName}
                                        </h4>
                                      </Link>
                                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span className="truncate">{application.jobTitle}</span>
                                      </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex-shrink-0`}>
                                      {statusInfo.label}
                                    </span>
                                  </div>

                                  {application.coverLetter && (
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                      {application.coverLetter}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDateTime(application.createdAt)}</span>
                                    </div>
                                    {application.graduateEmail && (
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <a
                                          href={`mailto:${application.graduateEmail}`}
                                          className="hover:text-accent-cyan transition-colors"
                                        >
                                          {application.graduateEmail}
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-3 flex items-center gap-2">
                                    <Link
                                      to={`/profile/graduate`}
                                      className="text-sm text-accent-cyan hover:text-accent-gold transition-colors flex items-center gap-1"
                                    >
                                      <User className="h-4 w-4" />
                                      <span>Профиль выпускника</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Пока нет откликов на ваши вакансии</p>
                      </div>
                    )}
                  </Card>

                  {/* Favorite Resumes Section */}
                  <Card className="mb-6 scroll-animate-item">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="h-6 w-6 text-accent-cyan" />
                      <h3 className="text-xl font-semibold text-white">Избранные резюме</h3>
                    </div>
                    {favoriteResumes.length > 0 ? (
                      <div className="space-y-4">
                        {favoriteResumes.map((resume, index) => (
                          <div
                            key={resume.id}
                            className="bg-dark-surface rounded-xl p-4 border border-dark-card hover:border-accent-cyan/30 transition-all scroll-animate-item"
                            style={{ transitionDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex items-start gap-4">
                              {/* Graduate Photo */}
                              <Link
                                to={`/profile/graduate`}
                                className="flex-shrink-0"
                              >
                                <div className="w-16 h-16 bg-dark-card rounded-full overflow-hidden border-2 border-accent-cyan/30 flex items-center justify-center hover:border-accent-cyan transition-colors">
                                  {resume.graduatePhoto ? (
                                    <img
                                      src={resume.graduatePhoto}
                                      alt={resume.graduateName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-8 w-8 text-gray-400" />
                                  )}
                                </div>
                              </Link>

                              {/* Resume Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      to={`/profile/graduate`}
                                      className="block"
                                    >
                                      <h4 className="text-lg font-semibold text-white hover:text-accent-cyan transition-colors mb-1">
                                        {resume.graduateName}
                                      </h4>
                                    </Link>
                                    {resume.position && (
                                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{resume.position}</span>
                                        {resume.experience && (
                                          <span className="text-gray-500">• {resume.experience}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFavorite(resume.id)}
                                    className="p-2 text-red-400 hover:bg-dark-card rounded-lg transition-colors flex-shrink-0"
                                    title="Удалить из избранного"
                                  >
                                    <Heart className="h-4 w-4 fill-red-400" />
                                  </button>
                                </div>

                                {resume.education && (
                                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <GraduationCap className="h-4 w-4" />
                                    <span className="line-clamp-1">{resume.education}</span>
                                  </div>
                                )}

                                {resume.skills && resume.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {resume.skills.slice(0, 5).map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-dark-card text-gray-300 text-xs rounded border border-dark-card"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {resume.skills.length > 5 && (
                                      <span className="px-2 py-1 text-gray-500 text-xs">
                                        +{resume.skills.length - 5}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Добавлено: {formatDateTime(resume.addedAt)}</span>
                                  </div>
                                  {resume.graduateEmail && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <a
                                        href={`mailto:${resume.graduateEmail}`}
                                        className="hover:text-accent-cyan transition-colors"
                                      >
                                        {resume.graduateEmail}
                                      </a>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/profile/graduate`}
                                    className="text-sm text-accent-cyan hover:text-accent-gold transition-colors flex items-center gap-1"
                                  >
                                    <User className="h-4 w-4" />
                                    <span>Профиль выпускника</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">У вас пока нет избранных резюме</p>
                      </div>
                    )}
                  </Card>

                  {/* Chats Section */}
                  <Section title="Чаты с выпускниками" className="bg-dark-bg py-0 scroll-animate-item">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Chat List - Left Panel */}
                      <Card className="scroll-animate-item">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-semibold text-white">Чаты</h3>
                          <span className="text-sm text-gray-400">{chats.length} {chats.length === 1 ? 'чат' : chats.length < 5 ? 'чата' : 'чатов'}</span>
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                          {chats.length > 0 ? (
                            chats.map((chat) => (
                              <div
                                key={chat.id}
                                onClick={() => setSelectedChat(chat.id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                  selectedChat === chat.id
                                    ? 'bg-dark-surface border-accent-cyan shadow-lg'
                                    : 'bg-dark-card border-dark-surface hover:border-accent-cyan/50 hover:bg-dark-surface/50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-accent-cyan font-semibold text-sm">
                                          {chat.graduateName.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold truncate">{chat.graduateName}</p>
                                        {chat.graduateEmail && (
                                          <p className="text-gray-400 text-sm truncate">{chat.graduateEmail}</p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2 truncate">{chat.lastMessage}</p>
                                    <p className="text-gray-600 text-xs mt-2">{chat.lastMessageTime}</p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteChat(chat.id)
                                    }}
                                    className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors flex-shrink-0"
                                    title="Удалить чат"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-gray-400">У вас пока нет чатов</p>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Chat Messages - Right Panel */}
                      <Card className="scroll-animate-item">
                        {selectedChatData ? (
                          <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-surface">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                                  <span className="text-accent-cyan font-semibold text-lg">
                                    {selectedChatData.graduateName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-semibold text-white">{selectedChatData.graduateName}</h3>
                                  {selectedChatData.graduateEmail && (
                                    <p className="text-gray-400 text-sm">{selectedChatData.graduateEmail}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedChat(null)}
                                className="p-2 text-gray-400 hover:bg-dark-surface rounded-lg transition-colors"
                                title="Закрыть чат"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Messages Area */}
                            <div className="h-[500px] overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                              {selectedChatData.messages.length > 0 ? (
                                selectedChatData.messages.map((msg) => {
                                  const isEditing = editingMessageId === msg.id
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`flex ${msg.sender === 'employer' ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div
                                        className={`max-w-[75%] rounded-xl p-4 ${
                                          msg.sender === 'employer'
                                            ? 'bg-accent-cyan text-dark-bg'
                                            : 'bg-dark-surface text-white'
                                        }`}
                                      >
                                        {isEditing ? (
                                          <div className="space-y-2">
                                            <textarea
                                              value={editingMessageText}
                                              onChange={(e) => setEditingMessageText(e.target.value)}
                                              className="w-full p-2 bg-dark-card border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan resize-none"
                                              rows={3}
                                              autoFocus
                                            />
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handleEditMessage(selectedChatData.id, msg.id, editingMessageText)}
                                                className="px-3 py-1 bg-accent-cyan text-dark-bg rounded-lg text-sm font-medium hover:bg-accent-cyan/90 transition-colors"
                                              >
                                                Сохранить
                                              </button>
                                              <button
                                                onClick={cancelEditingMessage}
                                                className="px-3 py-1 bg-dark-card text-gray-300 rounded-lg text-sm font-medium hover:bg-dark-surface transition-colors"
                                              >
                                                Отмена
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                              {msg.sender === 'employer' && (
                                                <div className="flex gap-1 flex-shrink-0">
                                                  <button
                                                    onClick={() => startEditingMessage(msg.id, msg.text)}
                                                    className="p-1.5 hover:bg-black/20 rounded transition-colors"
                                                    title="Редактировать"
                                                  >
                                                    <Edit className="h-3.5 w-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteMessage(selectedChatData.id, msg.id)}
                                                    className="p-1.5 hover:bg-black/20 rounded transition-colors"
                                                    title="Удалить"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/20">
                                              <span className="text-xs opacity-70">{msg.timestamp}</span>
                                              {msg.isEdited && (
                                                <span className="text-xs opacity-70 italic">(изменено)</span>
                                              )}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="text-center py-12">
                                  <p className="text-gray-400">Нет сообщений в этом чате</p>
                                </div>
                              )}
                            </div>

                            {/* Message Input */}
                            <div className="flex gap-3 pt-4 border-t border-dark-surface">
                              <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage(selectedChatData.id)
                                  }
                                }}
                                placeholder="Введите сообщение..."
                                className="input-field flex-1"
                              />
                              <button
                                onClick={() => handleSendMessage(selectedChatData.id)}
                                disabled={!messageText.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Отправить сообщение"
                              >
                                <Send className="h-5 w-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[600px] text-center">
                            <div className="w-16 h-16 rounded-full bg-dark-surface flex items-center justify-center mb-4">
                              <MessageCircle className="h-8 w-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-lg mb-2">Выберите чат</p>
                            <p className="text-gray-500 text-sm">Выберите чат из списка слева, чтобы начать общение</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  </Section>
                </>
              )}
            </>
          ) : (
            <Card>
              <p className="text-gray-300 mb-4">Профиль не заполнен</p>
              <button onClick={() => setIsEditingProfile(true)} className="btn-primary">
                Создать профиль
              </button>
            </Card>
          )}
        </Section>
      </div>
    </div>
  )
}

export default EmployerProfile

