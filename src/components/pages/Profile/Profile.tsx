import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Edit, Trash2, X, Send, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Code, Github, Linkedin, Globe, Award, MessageCircle } from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import ResumeForm from '../Resume/ResumeForm'
import { $api } from '../../../utils/axios.instance'

// Функция для формирования полного URL изображения
const getImageUrl = (url: string | undefined | null): string => {
  if (!url || url.trim() === '') return ''
  
  // Если URL уже полный (начинается с http), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Если это относительный путь к загруженному файлу, добавляем базовый URL сервера
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const baseUrl = apiUrl.replace('/api', '')
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    return `${baseUrl}${cleanUrl}`
  }
  
  // Если это просто путь без слеша в начале, добавляем базовый URL
  if (!url.startsWith('/') && !url.startsWith('http')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}/uploads/avatars/${url}`
  }
  
  return url
}

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
  status?: 'pending' | 'accepted' | 'rejected'
  vacancyId?: number
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData(profile)
      // Устанавливаем превью с правильным URL
      const photoUrl = profile.photo ? getImageUrl(profile.photo) : null
      setPhotoPreview(photoUrl)
      // Прокручиваем к верху формы при открытии редактирования
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [profile])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите файл изображения')
        return
      }
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB')
        return
      }
      setPhotoFile(file)
      // Создаем превью
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) return

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('photo', photoFile)

      // Не указываем Content-Type явно - axios автоматически установит правильный заголовок с boundary
      const response = await $api.post('/user/upload-photo', uploadFormData)

      const data = response.data
      const photoUrl = data.photo || data.avatar || ''
      
      console.log('Photo uploaded successfully, URL:', photoUrl)
      
      // Сохраняем URL загруженного фото
      setUploadedPhotoUrl(photoUrl)
      
      // Обновляем форму с новым URL фото (сохраняем относительный путь)
      setFormData(prev => {
        const updated = { ...prev, photo: photoUrl }
        console.log('Updated formData with photo:', updated.photo)
        return updated
      })
      // Обновляем превью с правильным URL
      setPhotoPreview(getImageUrl(photoUrl))
      setPhotoFile(null)
      toast.success('Фото успешно загружено')
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      
      // Более детальная обработка ошибок
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Ошибка подключения к серверу. Проверьте, что сервер запущен.')
      } else if (error.response) {
        // Сервер ответил с ошибкой
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Ошибка при загрузке фото'
        toast.error(errorMessage)
      } else {
        // Другая ошибка
        const errorMessage = error.message || 'Ошибка при загрузке фото'
        toast.error(errorMessage)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Убеждаемся, что если фото было загружено, оно включено в данные для сохранения
    const dataToSave = {
      ...formData,
      photo: formData.photo || uploadedPhotoUrl || formData.photo || ''
    }
    console.log('Submitting form with photo:', dataToSave.photo)
    console.log('formData.photo:', formData.photo)
    console.log('uploadedPhotoUrl:', uploadedPhotoUrl)
    onSave(dataToSave)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Фото профиля</label>
        <div className="space-y-3">
          {photoPreview && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-dark-card">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <span className="inline-block px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors text-sm">
                {photoFile ? 'Файл выбран' : 'Выбрать файл'}
              </span>
            </label>
            {photoFile && (
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={isUploading}
                className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {isUploading ? 'Загрузка...' : 'Загрузить'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">Или введите URL фото</p>
          <input
            type="text"
            value={formData.photo}
            onChange={(e) => {
              const newPhoto = e.target.value
              setFormData({ ...formData, photo: newPhoto })
              setPhotoPreview(newPhoto ? getImageUrl(newPhoto) : null)
            }}
            className="input-field"
            placeholder="https://..."
          />
        </div>
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

  // Функция для формирования полного URL изображения
  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === '') return ''
    
    // Если URL уже полный (начинается с http), возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Если это относительный путь к загруженному файлу, добавляем базовый URL сервера
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
      const baseUrl = apiUrl.replace('/api', '')
      const cleanUrl = url.startsWith('/') ? url : `/${url}`
      return `${baseUrl}${cleanUrl}`
    }
    
    // Если это просто путь без слеша в начале, добавляем базовый URL
    if (!url.startsWith('/') && !url.startsWith('http')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
      const baseUrl = apiUrl.replace('/api', '')
      return `${baseUrl}/uploads/avatars/${url}`
    }
    
    return url
  }
  const [applications, setApplications] = useState<Application[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
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
      loadFavorites()
      loadChats()
      loadResumes()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const response = await $api.get('/user/profile')
      const data = response.data
      
      // Правильно обрабатываем null значения - преобразуем их в пустые строки или массивы
      const loadedProfile = {
        photo: data.photo || data.avatar || '',
        lastName: data.lastName ?? '',
        firstName: data.firstName ?? '',
        middleName: data.middleName ?? '',
        birthDate: data.birthDate ?? '',
        city: data.city ?? '',
        education: data.education ?? '',
        experience: data.experience ?? '',
        about: data.about ?? '',
        email: data.email || user.email || '',
        phone: data.phone ?? '',
        github: data.github ?? '',
        linkedin: data.linkedin ?? '',
        portfolio: data.portfolio ?? '',
        skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
        projects: Array.isArray(data.projects) ? data.projects : (data.projects ? [data.projects] : []),
      }
      
      console.log('Profile loaded successfully:', loadedProfile)
      console.log('About:', loadedProfile.about)
      console.log('Education:', loadedProfile.education)
      console.log('Experience:', loadedProfile.experience)
      console.log('Skills:', loadedProfile.skills)
      console.log('Projects:', loadedProfile.projects)
      
      setProfile(loadedProfile)
    } catch (error: any) {
      console.error('Error loading profile:', error)
      if (error.response?.status === 404) {
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
      } else {
        // В случае другой ошибки также загружаем примерные данные
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
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${apiUrl}/applications/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.map((app: any) => ({
          id: app.id.toString(),
          jobTitle: app.vacancy?.title || 'Вакансия удалена',
          company: app.vacancy?.companyName || app.vacancy?.employer?.companyName || app.vacancy?.employer?.username || 'Неизвестная компания',
          appliedDate: new Date(app.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          status: app.status || 'pending',
          vacancyId: app.vacancyId || app.vacancy?.id
        })))
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${apiUrl}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setFavorites(data || [])
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleRemoveFavorite = async (vacancyId: number) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${apiUrl}/favorites/${vacancyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.id !== vacancyId))
        toast.success('Вакансия удалена из избранного')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка при удалении из избранного')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Ошибка при удалении из избранного')
    }
  }

  const loadChats = async () => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${apiUrl}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
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
      // Убеждаемся, что фото сохраняется (не отправляем null, если фото было загружено)
      // Если photo пустое или null, но в профиле есть фото, сохраняем текущее фото
      // Если photo есть в newProfile, используем его
      let photoToSave: string | null = newProfile.photo || null
      
      // Если фото пустое, но в текущем профиле есть фото, сохраняем его
      if (!photoToSave || photoToSave.trim() === '') {
        photoToSave = profile?.photo || null
      }
      
      // Не отправляем null, если фото было загружено - отправляем пустую строку или текущее значение
      if (photoToSave === null && profile?.photo) {
        photoToSave = profile.photo
      }
      
      console.log('Saving profile with photo:', photoToSave)
      console.log('newProfile.photo:', newProfile.photo)
      console.log('profile?.photo:', profile?.photo)
      
      const response = await $api.put('/user/profile', {
        photo: photoToSave,
        lastName: newProfile.lastName || null,
        firstName: newProfile.firstName || null,
        middleName: newProfile.middleName || null,
        birthDate: newProfile.birthDate || null,
        city: newProfile.city || null,
        education: newProfile.education || null,
        experience: newProfile.experience || null,
        about: newProfile.about || null,
        email: newProfile.email || null,
        phone: newProfile.phone || null,
        github: newProfile.github || null,
        linkedin: newProfile.linkedin || null,
        portfolio: newProfile.portfolio || null,
        skills: newProfile.skills || [],
        projects: newProfile.projects || [],
      })
      
      // Обновляем профиль сразу из ответа сервера
      const savedData = response.data
      const updatedProfile = {
        photo: savedData.photo || savedData.avatar || photoToSave || '',
        lastName: savedData.lastName ?? '',
        firstName: savedData.firstName ?? '',
        middleName: savedData.middleName ?? '',
        birthDate: savedData.birthDate ?? '',
        city: savedData.city ?? '',
        education: savedData.education ?? '',
        experience: savedData.experience ?? '',
        about: savedData.about ?? '',
        email: savedData.email || user.email || '',
        phone: savedData.phone ?? '',
        github: savedData.github ?? '',
        linkedin: savedData.linkedin ?? '',
        portfolio: savedData.portfolio ?? '',
        skills: Array.isArray(savedData.skills) ? savedData.skills : (savedData.skills ? [savedData.skills] : []),
        projects: Array.isArray(savedData.projects) ? savedData.projects : (savedData.projects ? [savedData.projects] : []),
      }
      
      setProfile(updatedProfile)
      setIsEditingProfile(false)
      
      toast.success('Профиль успешно обновлен')
      
      // Прокручиваем страницу к верху
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при сохранении профиля'
      toast.error(errorMessage)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    if (confirm('Вы уверены, что хотите удалить профиль?')) {
      try {
        await $api.delete('/user/profile')
        setProfile(null)
        toast.success('Профиль успешно удален')
        navigate('/login')
      } catch (error: any) {
        console.error('Error deleting profile:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Ошибка при удалении профиля'
        toast.error(errorMessage)
      }
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!user) return
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('accessToken') || '';
      const response = await fetch(`${apiUrl}/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      if (response.ok) {
        setApplications(applications.filter(app => app.id !== id))
        toast.success('Отклик удален')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Ошибка при удалении отклика')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error('Ошибка при удалении отклика')
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
                    onClick={() => {
                      setIsEditingProfile(true)
                      // Прокручиваем к верху страницы при открытии редактирования
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }, 100)
                    }}
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
                    <div className="w-full md:w-56 h-56 bg-dark-surface rounded-2xl overflow-hidden border-2 border-accent-cyan/30 flex items-center justify-center shadow-lg relative">
                      {profile.photo ? (
                        <>
                          <img 
                            src={getImageUrl(profile.photo)} 
                            alt={`${profile.firstName} ${profile.lastName}`}
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              console.error('Error loading profile photo:', getImageUrl(profile.photo))
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span className="text-6xl text-gray-400 absolute" style={{ display: 'none' }}>👤</span>
                        </>
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
              <button 
                onClick={() => {
                  setIsEditingProfile(true)
                  // Прокручиваем к верху страницы при открытии редактирования
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }, 100)
                }} 
                className="btn-primary"
              >
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
                      try {
                        await $api.put(`/resumes/${resumes[0].id}`, { radarImage: null })
                        toast.success('Радар навыков удалён')
                        loadResumes()
                      } catch (error: any) {
                        console.error('Error deleting radar:', error)
                        const errorMessage = error.response?.data?.error || error.message || 'Ошибка при удалении радара'
                        toast.error(errorMessage)
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
              <div className="mb-4 flex justify-center">
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
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{resume.title}</h3>
                        {resume.description && (
                          <p className="text-gray-300 mb-3 whitespace-pre-wrap">{resume.description}</p>
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
                      </div>

                      {resume.experience && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Award className="h-5 w-5 text-accent-cyan" />
                            Опыт работы
                          </h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{resume.experience}</p>
                        </div>
                      )}

                      {resume.education && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-accent-cyan" />
                            Образование
                          </h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{resume.education}</p>
                        </div>
                      )}

                      {resume.portfolio && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-accent-cyan" />
                            Портфолио
                          </h4>
                          <a
                            href={resume.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-cyan hover:text-accent-cyan/80 transition-colors break-all"
                          >
                            {resume.portfolio}
                          </a>
                        </div>
                      )}

                      {resume.skillsArray && resume.skillsArray.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Code className="h-5 w-5 text-accent-cyan" />
                            Навыки
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {resume.skillsArray.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-dark-surface border border-accent-cyan/30 rounded text-xs text-gray-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
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

        {/* Favorites Section */}
        <Section title="Избранные вакансии" className="bg-dark-bg py-0 scroll-animate-item">
          {favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((fav, index) => (
                <Card key={fav.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{fav.title}</h3>
                      <p className="text-gray-300 mb-1">
                        Компания: {fav.companyName || fav.employer?.companyName || fav.employer?.username || 'Неизвестная компания'}
                      </p>
                      {fav.location && (
                        <p className="text-gray-400 text-sm mb-1">📍 {fav.location}</p>
                      )}
                      {fav.salary && (
                        <p className="text-gray-400 text-sm mb-1">💰 {fav.salary.toLocaleString()} руб.</p>
                      )}
                      {fav.description && (
                        <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{fav.description}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-2">
                        Добавлено: {new Date(fav.createdAt || Date.now()).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 items-center">
                      <button
                        onClick={() => navigate(`/vacancy/${fav.id}`)}
                        className="btn-secondary text-sm whitespace-nowrap"
                      >
                        Подробнее
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title="Удалить из избранного"
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
              <p className="text-gray-300 text-center py-8">У вас пока нет избранных вакансий</p>
            </Card>
          )}
        </Section>

        {/* Applications Section */}
        <Section title="Мои отклики" className="bg-dark-bg py-0 scroll-animate-item">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <Card key={app.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{app.jobTitle}</h3>
                      <p className="text-gray-300 mb-1">Компания: {app.company}</p>
                      <p className="text-gray-400 text-sm mb-2">Отклик отправлен: {app.appliedDate}</p>
                      {app.status && (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {app.status === 'accepted' ? 'Принят' :
                             app.status === 'rejected' ? 'Отклонен' :
                             'На рассмотрении'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4 items-center">
                      {app.vacancyId && (
                        <button
                          onClick={() => navigate(`/vacancy/${app.vacancyId}`)}
                          className="btn-secondary text-sm whitespace-nowrap"
                        >
                          Подробнее
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title="Удалить отклик"
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
              <div className="space-y-2 custom-scrollbar pr-2">
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
                              <p className="text-white font-semibold">{chat.employerName}</p>
                              <p className="text-gray-400 text-sm">{chat.company}</p>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm mt-2 whitespace-pre-wrap break-words">{chat.lastMessage}</p>
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
                  <div className="space-y-4 mb-4 custom-scrollbar pr-2">
                    {selectedChatData.messages.length > 0 ? (
                      selectedChatData.messages.map((msg) => {
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

