import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Edit, Trash2, X, Send, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Code, Github, Linkedin, Globe, Award, MessageCircle } from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type User, type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import ResumeForm from '../Resume/ResumeForm'

interface Profile {
  photo: string
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  city: string
  education: string
  experience: string
  about: string
  email?: string
  phone?: string
  github?: string
  linkedin?: string
  portfolio?: string
  skills?: string[]
  projects?: Project[]
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link?: string
  githubLink?: string
}

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedDate: string
}

interface Resume {
  id: number
  title: string
  description: string
  skills: string[]
  skillsArray: string[]
  experience: string
  education: string
  portfolio: string
  desiredSalary: number
  location: string
  level: 'junior' | 'middle' | 'senior' | 'lead'
  isActive: boolean
  radarImage?: string
}

interface Chat {
  id: string
  employerName: string
  company: string
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

interface ProfileEditFormProps {
  profile: Profile
  onSave: (profile: Profile) => void
  onCancel: () => void
}

const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  const [formData, setFormData] = useState<Profile>(profile)

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Дата рождения</label>
          <input
            type="text"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="input-field"
            placeholder="Например: 01.01.2000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Город</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Образование</label>
        <input
          type="text"
          value={formData.education}
          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Опыт работы</label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">О себе</label>
        <textarea
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          className="input-field"
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Телефон</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field"
            placeholder="+7 (999) 123-45-67"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
          <input
            type="url"
            value={formData.github || ''}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="input-field"
            placeholder="https://github.com/username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
          <input
            type="url"
            value={formData.linkedin || ''}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            className="input-field"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Портфолио</label>
          <input
            type="url"
            value={formData.portfolio || ''}
            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            className="input-field"
            placeholder="https://your-portfolio.com"
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

const GraduateProfile = () => {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isCreatingResume, setIsCreatingResume] = useState(false)

  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageText, setEditingMessageText] = useState<string>('')

  useEffect(() => {
    if (!user) {
            navigate('/login')
      return
          }
    // Этот компонент только для выпускников
    if (user.role !== 'graduate') {
        navigate('/login')
      return
    }
      loadProfile()
      loadApplications()
      loadChats()
      loadResumes()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/profile/graduate`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const loadedProfile = {
          photo: data.photo || '',
          lastName: data.lastName || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          birthDate: data.birthDate || '',
          city: data.city || '',
          education: data.education || '',
          experience: data.experience || '',
          about: data.about || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          portfolio: data.portfolio || '',
          skills: data.skills || [],
          projects: data.projects || [],
        }
        setProfile(loadedProfile)
      } else if (response.status === 404) {
        // Если профиль не найден, загружаем примерные данные для демонстрации
        setProfile({
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          lastName: 'Иванов',
          firstName: 'Алексей',
          middleName: 'Сергеевич',
          birthDate: '1998-05-15',
          city: 'Москва',
          education: 'МГУ им. М.В. Ломоносова, Факультет вычислительной математики и кибернетики, Специалист по прикладной математике и информатике (2016-2021)',
          experience: 'Frontend Developer в ООО "ТехноСофт" (2021-2023)\n• Разработка пользовательских интерфейсов на React и TypeScript\n• Оптимизация производительности приложений\n• Работа в команде по методологии Agile\n\nСтажер в IT-компании "СтартАп" (2020-2021)\n• Изучение современных технологий веб-разработки\n• Участие в разработке внутренних проектов',
          about: 'Увлеченный разработчик с опытом создания современных веб-приложений. Специализируюсь на React, TypeScript и Node.js. Постоянно изучаю новые технологии и стремлюсь к профессиональному росту. Имею опыт работы в команде и готов к новым вызовам.',
          email: user.email || 'alexey.ivanov@example.com',
          phone: '+7 (999) 123-45-67',
          github: 'https://github.com/alexey-ivanov',
          linkedin: 'https://linkedin.com/in/alexey-ivanov',
          portfolio: 'https://alexey-ivanov.dev',
          skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'HTML/CSS', 'Git', 'Redux', 'Next.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
          projects: [
            {
              id: '1',
              name: 'E-commerce платформа',
              description: 'Полнофункциональная платформа для онлайн-торговли с корзиной, оплатой и админ-панелью. Реализована система рекомендаций на основе машинного обучения.',
              technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe API'],
              link: 'https://ecommerce-demo.example.com',
              githubLink: 'https://github.com/alexey-ivanov/ecommerce-platform'
            },
            {
              id: '2',
              name: 'Система управления задачами',
              description: 'Коллаборативное приложение для управления проектами с real-time обновлениями, уведомлениями и аналитикой.',
              technologies: ['React', 'Socket.io', 'Express', 'PostgreSQL', 'Redis'],
              link: 'https://taskmanager-demo.example.com',
              githubLink: 'https://github.com/alexey-ivanov/task-manager'
            },
            {
              id: '3',
              name: 'Погодное приложение',
              description: 'Мобильное веб-приложение для прогноза погоды с красивой визуализацией и интеграцией с несколькими API.',
              technologies: ['React', 'TypeScript', 'Chart.js', 'Weather API'],
              githubLink: 'https://github.com/alexey-ivanov/weather-app'
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // В случае ошибки также загружаем примерные данные
      if (!profile) {
        setProfile({
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          lastName: 'Иванов',
          firstName: 'Алексей',
          middleName: 'Сергеевич',
          birthDate: '1998-05-15',
          city: 'Москва',
          education: 'МГУ им. М.В. Ломоносова, Факультет вычислительной математики и кибернетики, Специалист по прикладной математике и информатике (2016-2021)',
          experience: 'Frontend Developer в ООО "ТехноСофт" (2021-2023)\n• Разработка пользовательских интерфейсов на React и TypeScript\n• Оптимизация производительности приложений\n• Работа в команде по методологии Agile\n\nСтажер в IT-компании "СтартАп" (2020-2021)\n• Изучение современных технологий веб-разработки\n• Участие в разработке внутренних проектов',
          about: 'Увлеченный разработчик с опытом создания современных веб-приложений. Специализируюсь на React, TypeScript и Node.js. Постоянно изучаю новые технологии и стремлюсь к профессиональному росту. Имею опыт работы в команде и готов к новым вызовам.',
          email: user?.email || 'alexey.ivanov@example.com',
          phone: '+7 (999) 123-45-67',
          github: 'https://github.com/alexey-ivanov',
          linkedin: 'https://linkedin.com/in/alexey-ivanov',
          portfolio: 'https://alexey-ivanov.dev',
          skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'HTML/CSS', 'Git', 'Redux', 'Next.js', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS'],
          projects: [
            {
              id: '1',
              name: 'E-commerce платформа',
              description: 'Полнофункциональная платформа для онлайн-торговли с корзиной, оплатой и админ-панелью. Реализована система рекомендаций на основе машинного обучения.',
              technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe API'],
              link: 'https://ecommerce-demo.example.com',
              githubLink: 'https://github.com/alexey-ivanov/ecommerce-platform'
            },
            {
              id: '2',
              name: 'Система управления задачами',
              description: 'Коллаборативное приложение для управления проектами с real-time обновлениями, уведомлениями и аналитикой.',
              technologies: ['React', 'Socket.io', 'Express', 'PostgreSQL', 'Redis'],
              link: 'https://taskmanager-demo.example.com',
              githubLink: 'https://github.com/alexey-ivanov/task-manager'
            },
            {
              id: '3',
              name: 'Погодное приложение',
              description: 'Мобильное веб-приложение для прогноза погоды с красивой визуализацией и интеграцией с несколькими API.',
              technologies: ['React', 'TypeScript', 'Chart.js', 'Weather API'],
              githubLink: 'https://github.com/alexey-ivanov/weather-app'
            }
          ]
        })
      }
    }
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/applications`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.map((app: any) => ({
          id: app.id.toString(),
          jobTitle: app.title,
          company: app.company,
          appliedDate: app.applied_at,
        })))
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const loadChats = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data.map((chat: any) => ({
          id: chat.id.toString(),
          employerName: chat.other_user_name || '',
          company: chat.company || '',
          lastMessage: chat.last_message || '',
          lastMessageTime: chat.last_message_time || '',
          messages: [],
        })))
      } else if (response.status === 404) {
        // Примерные данные для демонстрации
        const mockChats: Chat[] = [
          {
            id: '1',
            employerName: 'Мария Петрова',
            company: 'Яндекс',
            lastMessage: 'Спасибо за отклик! Можем обсудить детали?',
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
                text: 'Спасибо за отклик! Можем обсудить детали?',
                sender: 'employer',
                timestamp: '14:30',
                isEdited: false,
              },
            ],
          },
          {
            id: '2',
            employerName: 'Дмитрий Смирнов',
            company: 'Сбер',
            lastMessage: 'Хорошо, жду ваше резюме',
            lastMessageTime: 'Вчера',
            messages: [
              {
                id: '1',
                text: 'Добрый день! Видел вашу вакансию на сайте.',
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
            employerName: 'Анна Козлова',
            company: 'VK',
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
          employerName: 'Мария Петрова',
          company: 'Яндекс',
          lastMessage: 'Спасибо за отклик! Можем обсудить детали?',
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

  const loadResumes = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/resumes/user/${user.id}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setResumes(data)
      }
    } catch (error) {
      console.error('Error loading resumes:', error)
    }
  }

  const handleSaveProfile = async (newProfile: Profile) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/profile/graduate`, {
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
          birthDate: updatedProfile.birthDate || '',
          city: updatedProfile.city || '',
          education: updatedProfile.education || '',
          experience: updatedProfile.experience || '',
          about: updatedProfile.about || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          github: updatedProfile.github || '',
          linkedin: updatedProfile.linkedin || '',
          portfolio: updatedProfile.portfolio || '',
          skills: updatedProfile.skills || [],
          projects: updatedProfile.projects || [],
        }
        setIsEditingProfile(false)
        // Reload profile to ensure it's saved
        await loadProfile()
        setProfile(savedProfile)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сохранения' }))
        toast.error(errorData.error || 'Ошибка при сохранении профиля')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    if (confirm('Вы уверены, что хотите удалить профиль?')) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${apiUrl}/profile/graduate`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (response.ok) {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error deleting profile:', error)
      }
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setApplications(applications.filter(app => app.id !== id))
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const handleDeleteChat = async (id: string) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите удалить этот чат?')) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setChats(chats.filter(chat => chat.id !== id))
        if (selectedChat === id) {
          setSelectedChat(null)
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleDeleteResume = async (id: number) => {
    if (!user) return
    if (!confirm('Вы уверены, что хотите удалить это резюме?')) return

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/resumes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setResumes(resumes.filter(resume => resume.id !== id))
        toast.success('Резюме удалено')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Ошибка при удалении резюме')
    }
  }

  const loadChatMessages = async (chatId: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const messages = data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.text,
          sender: msg.sender_type === 'graduate' ? 'graduate' : 'employer',
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
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
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/chats/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        loadChatMessages(chatId)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
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
                <ProfileEditForm
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
                        <p className="text-accent-cyan text-lg font-medium">Frontend Developer</p>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {profile.email && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Mail className="h-5 w-5 text-accent-cyan" />
                            <a href={`mailto:${profile.email}`} className="hover:text-accent-cyan transition-colors">
                              {profile.email}
                            </a>
                      </div>
                        )}
                        {profile.phone && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Phone className="h-5 w-5 text-accent-cyan" />
                            <a href={`tel:${profile.phone}`} className="hover:text-accent-cyan transition-colors">
                              {profile.phone}
                            </a>
                      </div>
                        )}
                        {profile.city && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <MapPin className="h-5 w-5 text-accent-cyan" />
                            <span>{profile.city}</span>
                    </div>
                        )}
                    {profile.birthDate && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <Calendar className="h-5 w-5 text-accent-cyan" />
                            <span>
                          {profile.birthDate.includes('T') 
                            ? new Date(profile.birthDate).toLocaleDateString('ru-RU', { 
                                year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                              })
                            : profile.birthDate}
                            </span>
                      </div>
                    )}
                      </div>

                      {/* Social Links */}
                      {(profile.github || profile.linkedin || profile.portfolio) && (
                        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-dark-surface">
                          {profile.github && (
                            <a 
                              href={profile.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-300 hover:text-accent-cyan transition-colors"
                            >
                              <Github className="h-5 w-5" />
                              <span className="text-sm">GitHub</span>
                            </a>
                          )}
                          {profile.linkedin && (
                            <a 
                              href={profile.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-300 hover:text-accent-cyan transition-colors"
                            >
                              <Linkedin className="h-5 w-5" />
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                          {profile.portfolio && (
                            <a 
                              href={profile.portfolio} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-300 hover:text-accent-cyan transition-colors"
                            >
                              <Globe className="h-5 w-5" />
                              <span className="text-sm">Портфолио</span>
                            </a>
                          )}
                      </div>
                    )}
                    </div>
                  </div>
                )}
              </Card>

              {/* About Section */}
              {profile.about && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">О себе</h3>
                      </div>
                  <p className="text-gray-300 leading-relaxed text-base">{profile.about}</p>
                </Card>
                    )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">Навыки</h3>
                      </div>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-dark-surface border border-accent-cyan/30 rounded-lg text-white text-sm hover:border-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Education Section */}
              {profile.education && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <GraduationCap className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">Образование</h3>
                      </div>
                  <p className="text-gray-300 leading-relaxed">{profile.education}</p>
                </Card>
              )}

              {/* Experience Section */}
              {profile.experience && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">Опыт работы</h3>
                  </div>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">{profile.experience}</div>
                </Card>
              )}

              {/* Projects Section */}
              {profile.projects && profile.projects.length > 0 && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">Проекты</h3>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-dark-surface rounded-xl p-6 border border-dark-card hover:border-accent-cyan/50 transition-all"
                      >
                        <h4 className="text-lg font-semibold text-white mb-2">{project.name}</h4>
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-dark-card border border-gray-700 rounded text-xs text-gray-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent-cyan hover:text-accent-gold transition-colors text-sm"
                            >
                              <Globe className="h-4 w-4" />
                              <span>Демо</span>
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent-cyan hover:text-accent-gold transition-colors text-sm"
                            >
                              <Github className="h-4 w-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
            </Card>
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

        {/* Skills Radar Section */}
        {resumes.length > 0 && resumes[0].radarImage && (
          <Section title="Радар навыков" className="bg-dark-bg py-0 scroll-animate-item">
            <Card>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <p className="text-gray-300">
                    Визуализация ваших навыков, созданная на основе интерактивного радара
                  </p>
                  <button
                    onClick={async () => {
                      if (!confirm('Вы уверены, что хотите удалить радар навыков?')) return
                      try {
                        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api"
                        const response = await fetch(`${apiUrl}/resumes/${resumes[0].id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({ radarImage: null }),
                        })
                        if (response.ok) {
                          toast.success('Радар навыков удалён')
                          loadResumes()
                        }
                      } catch (error) {
                        console.error('Error deleting radar:', error)
                        toast.error('Ошибка при удалении радара')
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                    title="Удалить радар навыков"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <img
                    src={resumes[0].radarImage}
                    alt="Радар навыков"
                    className="max-w-full h-auto rounded-lg border border-dark-card"
                  />
                </div>
              </div>
            </Card>
          </Section>
        )}

        {/* Resumes Section */}
        <Section title="Мои резюме" className="bg-dark-bg py-0 scroll-animate-item">
          {isCreatingResume ? (
            <ResumeForm
              onClose={() => setIsCreatingResume(false)}
              onSuccess={() => {
                setIsCreatingResume(false)
                loadResumes()
              }}
            />
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setIsCreatingResume(true)}
                  className="btn-primary"
                >
                  Создать резюме
                </button>
              </div>
              {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume, index) => (
                <Card key={resume.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{resume.title}</h3>
                      {resume.description && (
                        <p className="text-gray-300 mb-3">{resume.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mb-3">
                        {resume.location && (
                          <span className="text-sm text-gray-400">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            {resume.location}
                          </span>
                        )}
                        {resume.level && (
                          <span className="text-sm text-gray-400">
                            <Briefcase className="inline h-4 w-4 mr-1" />
                            {resume.level}
                          </span>
                        )}
                        {resume.desiredSalary && (
                          <span className="text-sm text-accent-cyan font-semibold">
                            от {resume.desiredSalary.toLocaleString()} ₽
                          </span>
                        )}
                      </div>
                      {resume.skillsArray && resume.skillsArray.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {resume.skillsArray.slice(0, 10).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-dark-surface border border-accent-cyan/30 rounded text-xs text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/resume/${resume.id}`)}
                        className="p-2 text-accent-cyan hover:bg-dark-surface rounded-lg transition-colors"
                        title="Редактировать резюме"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title="Удалить резюме"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-300">У вас пока нет резюме. Создайте своё первое резюме!</p>
            </Card>
          )}
            </>
          )}
        </Section>

        {/* Applications Section */}
        <Section title="Мои отклики" className="bg-dark-bg py-0 scroll-animate-item">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <Card key={app.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{app.jobTitle}</h3>
                      <p className="text-gray-300 mb-1">Компания: {app.company}</p>
                      <p className="text-gray-400 text-sm">Отклик отправлен: {app.appliedDate}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-300">У вас пока нет откликов</p>
            </Card>
          )}
        </Section>

        {/* Chats Section */}
        <Section title="Чаты с работодателями" className="bg-dark-bg py-0 scroll-animate-item">
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
                                {chat.employerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate">{chat.employerName}</p>
                              <p className="text-gray-400 text-sm truncate">{chat.company}</p>
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
                          {selectedChatData.employerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedChatData.employerName}</h3>
                      <p className="text-gray-400 text-sm">{selectedChatData.company}</p>
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
                      selectedChatData.messages.map((msg, index) => {
                        const isEditing = editingMessageId === msg.id
                        return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'graduate' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                              className={`max-w-[75%] rounded-xl p-4 ${
                            msg.sender === 'graduate'
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
                                    {msg.sender === 'graduate' && (
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
      </div>
    </div>
  )
}

export default GraduateProfile

