import React, { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { Edit, Trash2, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Code, Github, Linkedin, Globe, Award, X } from 'lucide-react'
import Card from '../../ui/Card'
import Section from '../../ui/Section'
import { useScrollAnimation } from '../../../hooks/useScrollAnimation'
import { type OutletContext } from '../../../types'
import toast from 'react-hot-toast'
import ResumeForm from '../Resume/ResumeForm'
import { $api, clearAccessToken } from '../../../utils/axios.instance'
import GraduateProfileNav from './GraduateProfileNav'
import { useTranslation } from 'react-i18next'
import AutoSkillsRadar from '../../AutoSkillsRadar'
import SkillsRadarCompact from '../../SkillsRadarCompact'
import ChangePassword from './ChangePassword'
import ConfirmModal from '../../ui/ConfirmModal'
import { getImageUrl } from '../../../utils/image.utils'

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


interface ProfileEditFormProps {
  profile: Profile
  onSave: (profile: Profile) => void
  onCancel: () => void
}

const ProfileEditForm = ({ profile, onSave, onCancel }: ProfileEditFormProps) => {
  const { t } = useTranslation()
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
        toast.error(t('profile.errors.selectImage'))
        return
      }
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profile.errors.fileTooLarge'))
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
      toast.success(t('profile.success.photoUploaded'))
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      
      // Более детальная обработка ошибок
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error(t('profile.errors.serverConnection'))
      } else if (error.response) {
        // Сервер ответил с ошибкой
        const errorMessage = error.response?.data?.error || error.response?.data?.message || t('profile.errors.uploadError')
        toast.error(errorMessage)
      } else {
        // Другая ошибка
        const errorMessage = error.message || t('profile.errors.uploadError')
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

  // Ref для input file чтобы программно открывать диалог
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSelectFromSystem = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.profilePhoto')}</label>
        <div className="space-y-3">
          {photoPreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-dark-card">
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null)
                  setPhotoFile(null)
                  setUploadedPhotoUrl(null)
                  setFormData({ ...formData, photo: '' })
                }}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-all cursor-default"
                title={t('profile.tooltips.deletePhoto')}
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleSelectFromSystem}
              className="px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              📁 {photoFile ? t('profile.fileSelected') : t('profile.selectFile')}
            </button>
            {photoFile && (
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={isUploading}
                className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {isUploading ? t('profile.uploading') : t('profile.upload')}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">{t('profile.maxFileSize')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.lastName')}</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.firstName')}</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.middleName')}</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.birthDate')}</label>
          <input
            type="text"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="input-field"
            placeholder="01.01.2000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.city')}</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.education')}</label>
        <input
          type="text"
          value={formData.education}
          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.experience')}</label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.about')}</label>
        <textarea
          value={formData.about}
          onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          className="input-field"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.email')}</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.phone')}</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.portfolio')}</label>
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
          {t('common.save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}

const GraduateProfile = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser } = useOutletContext<OutletContext>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  })

  // Функция для формирования полного URL изображения
  const [applications, setApplications] = useState<Application[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isCreatingResume, setIsCreatingResume] = useState(false)
  const [showManualRadar, setShowManualRadar] = useState(false)

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

      setProfile({...loadedProfile})
    } catch (error: any) {
      console.error('Error loading profile:', error)
      // При ошибке загрузки показываем пустой профиль для заполнения
      // Не показываем демо-данные, чтобы пользователь заполнил свои
      if (!profile) {
        setProfile({
          photo: '',
          lastName: '',
          firstName: '',
          middleName: '',
          birthDate: '',
          city: '',
          education: '',
          experience: '',
          about: '',
          email: user?.email || '',
          phone: '',
          github: '',
          linkedin: '',
          portfolio: '',
          skills: [],
          projects: []
        })
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
          jobTitle: app.vacancy?.title || t('profile.vacancyDeleted'),
          company: app.vacancy?.companyName || app.vacancy?.employer?.companyName || app.vacancy?.employer?.username || t('profile.unknownCompany'),
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
        toast.success(t('profile.success.removedFromFavorites'))
      } else {
        const data = await response.json()
        toast.error(data.error || t('profile.errors.removeFavoriteError'))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error(t('profile.errors.removeFavoriteError'))
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
      // Логика сохранения фото:
      // 1. Если пользователь загрузил новое фото - используем его
      // 2. Если фото есть в текущем профиле - сохраняем его
      // 3. Никогда не отправляем пустое/null значение, чтобы не затереть существующее фото на сервере

      // Определяем фото для сохранения
      const photoToSave = (newProfile.photo && newProfile.photo.trim() !== '')
        ? newProfile.photo
        : (profile?.photo && profile.photo.trim() !== '')
          ? profile.photo
          : undefined // Не отправляем поле вообще если фото нет

      console.log('Saving profile with photo:', photoToSave)
      console.log('newProfile.photo:', newProfile.photo)
      console.log('profile?.photo:', profile?.photo)

      // Формируем объект для отправки, включая photo только если оно есть
      const dataToSend: Record<string, unknown> = {
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
      }

      // Добавляем photo только если оно определено
      if (photoToSave !== undefined) {
        dataToSend.photo = photoToSave
      }

      const response = await $api.put('/user/profile', dataToSend)
      
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

      setProfile({...updatedProfile})
      setIsEditingProfile(false)
      
      toast.success(t('profile.success.profileUpdated'))

      // Прокручиваем страницу к верху
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error.response?.data?.message || error.message || t('profile.errors.saveError')
      toast.error(errorMessage)
    }
  }

  const handleDeleteProfile = async () => {
    if (!user) return
    setConfirmModal({
      isOpen: true,
      title: t('profile.confirmDelete.profileTitle'),
      message: t('profile.confirmDelete.profileMessage'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await $api.delete('/user/profile')
          // Очищаем токен авторизации
          clearAccessToken()
          // Сбрасываем состояние пользователя
          setUser(null)
          setProfile(null)
          toast.success(t('profile.success.profileDeleted'))
          // Переходим на главную страницу
          navigate('/')
        } catch (error: any) {
          console.error('Error deleting profile:', error)
          const errorMessage = error.response?.data?.message || error.message || t('profile.errors.deleteError')
          toast.error(errorMessage)
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      }
    })
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
        toast.success(t('profile.success.applicationDeleted'))
      } else {
        const data = await response.json()
        toast.error(data.error || t('profile.errors.deleteApplicationError'))
      }
    } catch (error) {
      console.error('Error deleting application:', error)
      toast.error(t('profile.errors.deleteApplicationError'))
    }
  }

  const handleDeleteResume = async (id: number) => {
    if (!user) return
    setConfirmModal({
      isOpen: true,
      title: t('profile.confirmDelete.resumeTitle'),
      message: t('profile.confirmDelete.resumeMessage'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await $api.delete(`/resumes/${id}`)
          setResumes(resumes.filter(resume => resume.id !== id))
          toast.success(t('profile.success.resumeDeleted'))
        } catch (error: any) {
          console.error('Error deleting resume:', error)
          toast.error(error.response?.data?.message || t('profile.errors.deleteResumeError'))
        } finally {
          setConfirmModal({ ...confirmModal, isOpen: false })
        }
      }
    })
  }

  useScrollAnimation()

  const [searchParams] = useSearchParams()
  // Читаем активную вкладку напрямую из URL
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabChange = (tab: string) => {
    // Мгновенный переход по нужному URL
    navigate(`/profile/graduate?tab=${tab}`, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Menu */}
        <GraduateProfileNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Profile Header Section */}
        {activeTab === 'profile' && (
          <Section key="profile" title="" className="bg-dark-bg py-0 scroll-animate-item">
          {profile ? (
            <>
              {/* Header Card with Photo and Basic Info */}
              <Card className="mb-6">
              <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-white">{t('profile.myProfile')}</h2>
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
                      title={t('profile.editProfile')}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                      title={t('profile.deleteProfile')}
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
                              <span className="text-sm">{t('profile.portfolio')}</span>
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
                    <h3 className="text-xl font-semibold text-white">{t('profile.about')}</h3>
                      </div>
                  <p className="text-gray-300 leading-relaxed text-base">{profile.about}</p>
                </Card>
                    )}

              {/* Skills Section */}
              {profile.skills && profile.skills.length > 0 && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">{t('profile.skills')}</h3>
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
                    <h3 className="text-xl font-semibold text-white">{t('profile.education')}</h3>
                      </div>
                  <p className="text-gray-300 leading-relaxed">{profile.education}</p>
                </Card>
              )}

              {/* Experience Section */}
              {profile.experience && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">{t('profile.experience')}</h3>
                  </div>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">{profile.experience}</div>
                </Card>
              )}

              {/* Projects Section */}
              {profile.projects && profile.projects.length > 0 && !isEditingProfile && (
                <Card className="mb-6 scroll-animate-item">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="h-6 w-6 text-accent-cyan" />
                    <h3 className="text-xl font-semibold text-white">{t('profile.projects')}</h3>
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
                              <span>{t('profile.demo')}</span>
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
              <p className="text-gray-300 mb-4">{t('profile.profileNotFilled')}</p>
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
                {t('profile.createProfile')}
              </button>
            </Card>
          )}
        </Section>
        )}

        {/* Change Password Section - только на вкладке Профиль */}
        {activeTab === 'profile' && (
          <Section key="password" title="" className="bg-dark-bg py-0 scroll-animate-item">
            <ChangePassword />
          </Section>
        )}

        {/* Skills Radar Section */}
        {activeTab === 'radar' && (
          <Section key="radar" title={t('profile.skillsRadar')} subtitle={t('skills.autoSubtitle')} className="bg-dark-bg py-0 scroll-animate-item">
            <div className="space-y-6">
              {/* Tab switcher */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowManualRadar(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    !showManualRadar
                      ? 'bg-accent-cyan text-white'
                      : 'bg-dark-surface text-gray-400 hover:text-white'
                  }`}
                >
                  {t('skills.autoRadar')}
                </button>
                <button
                  onClick={() => setShowManualRadar(true)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    showManualRadar
                      ? 'bg-accent-cyan text-white'
                      : 'bg-dark-surface text-gray-400 hover:text-white'
                  }`}
                >
                  {t('skills.manualMode')}
                </button>
              </div>

              {/* Info banner for auto radar */}
              {!showManualRadar && (
                <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border border-accent-cyan/30 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">
                    <span className="text-accent-cyan font-medium">{t('skills.howItWorks')}</span> {t('skills.howItWorksDesc')}
                  </p>
                  <ul className="text-gray-400 text-sm mt-2 space-y-1 ml-4 list-disc">
                    <li><strong className="text-white">{t('skills.codeBattle')}</strong> - {t('skills.codeBattleDesc')}</li>
                    <li><strong className="text-white">{t('resume.title')}</strong> - {t('skills.resumeDesc')}</li>
                    <li><strong className="text-white">{t('interview.aiInterview.title')}</strong> - {t('skills.aiInterviewDesc')}</li>
                    <li><strong className="text-white">{t('interview.audioInterview.title')}</strong> - {t('skills.audioInterviewDesc')}</li>
                    <li><strong className="text-white">{t('roadmap.title')}</strong> - {t('skills.roadmapsDesc')}</li>
                  </ul>
                </div>
              )}

              {/* Radar */}
              {showManualRadar ? (
                user && <SkillsRadarCompact user={user} />
              ) : (
                user?.id && <AutoSkillsRadar userId={user.id} />
              )}
            </div>
          </Section>
        )}

        {/* Resumes Section */}
        {activeTab === 'resumes' && (
          <Section key="resumes" title={t('profile.myResumes')} className="bg-dark-bg py-0 scroll-animate-item">
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
                  {t('profile.createResume')}
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
                            {t('profile.experience')}
                          </h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{resume.experience}</p>
                        </div>
                      )}

                      {resume.education && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-accent-cyan" />
                            {t('profile.education')}
                          </h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{resume.education}</p>
                        </div>
                      )}

                      {resume.portfolio && (
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-accent-cyan" />
                            {t('profile.portfolio')}
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
                            {t('profile.skills')}
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
                        title={t('profile.tooltips.editResume')}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title={t('profile.tooltips.deleteResume')}
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
              <p className="text-gray-300">{t('profile.noResumes')}</p>
            </Card>
          )}
            </>
          )}
        </Section>
        )}

        {/* Favorites Section */}
        {activeTab === 'favorites' && (
          <Section key="favorites" title={t('profile.favorites')} className="bg-dark-bg py-0 scroll-animate-item">
          {favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((fav, index) => (
                <Card key={fav.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{fav.title}</h3>
                      <p className="text-gray-300 mb-1">
                        {t('profile.company')}: {fav.companyName || fav.employer?.companyName || fav.employer?.username || t('common.noResults')}
                      </p>
                      {fav.location && (
                        <p className="text-gray-400 text-sm mb-1">📍 {fav.location}</p>
                      )}
                      {fav.salary && (
                        <p className="text-gray-400 text-sm mb-1">💰 {fav.salary.toLocaleString()} {t('common.rub')}</p>
                      )}
                      {fav.description && (
                        <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{fav.description}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-2">
                        {t('profile.addedOn')}: {new Date(fav.createdAt || Date.now()).toLocaleDateString('ru-RU', {
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
                        {t('profile.details')}
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title={t('profile.tooltips.removeFromFavorites')}
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
              <p className="text-gray-300 text-center py-8">{t('profile.noFavorites')}</p>
            </Card>
          )}
        </Section>
        )}

        {/* Applications Section */}
        {activeTab === 'applications' && (
          <Section key="applications" title={t('profile.myResponses')} className="bg-dark-bg py-0 scroll-animate-item">
          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <Card key={app.id} className="scroll-animate-item" style={{ transitionDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{app.jobTitle}</h3>
                      <p className="text-gray-300 mb-1">{t('profile.company')}: {app.company}</p>
                      <p className="text-gray-400 text-sm mb-2">{t('profile.responseSent')}: {app.appliedDate}</p>
                      {app.status && (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                            app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {app.status === 'accepted' ? t('profile.accepted') :
                             app.status === 'rejected' ? t('profile.rejected') :
                             t('profile.pending')}
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
                          {t('profile.details')}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-2 text-red-400 hover:bg-dark-surface rounded-lg transition-colors"
                        title={t('profile.tooltips.deleteApplication')}
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
              <p className="text-gray-300">{t('profile.noResponses')}</p>
            </Card>
          )}
        </Section>
        )}

      </div>

      {/* Модальное окно подтверждения */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  )
}

export default GraduateProfile

