import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Edit, Trash2, Building2, Globe, MapPin, Users, Briefcase, Check, X, User as UserIcon, RefreshCw } from 'lucide-react';
import { OutletContext } from '../../../types';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';
import VacanciesManagement from '../Vacancies/VacanciesManagement';
import Card from '../../ui/Card';
import EmployerProfileNav from './EmployerProfileNav';


interface EmployerProfileData {
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  companyAddress: string;
  companySize: string;
  industry: string;
  phone: string;
  email: string;
  avatar?: string;
}

interface Application {
  id: number;
  vacancyId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected';
  coverLetter?: string;
  createdAt: string;
  vacancy?: {
    id: number;
    title: string;
    companyName?: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    phone?: string;
    avatar?: string;
    resumes?: Array<{
      id: number;
      title: string;
    }>;
  };
}

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Функция для формирования полного URL изображения
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return ''
    // Если URL уже полный (начинается с http), возвращаем как есть
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // Если это относительный путь к загруженному файлу, добавляем базовый URL сервера
    if (url.startsWith('/uploads/')) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
      const baseUrl = apiUrl.replace('/api', '')
      return `${baseUrl}${url}`
    }
    return url
  }
  const [formData, setFormData] = useState<EmployerProfileData>({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyAddress: '',
    companySize: '',
    industry: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (!user) {
            navigate('/login')
      return
          }
    // Этот компонент только для работодателей
    if (user.role !== 'employer') {
        navigate('/login')
      return
    }
      loadProfile()
      loadApplications()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    try {
      const response = await $api.get('/user/profile')
      const data = response.data

      const profileData: EmployerProfileData = {
        companyName: data.companyName || '',
        companyDescription: data.companyDescription || '',
        companyWebsite: data.companyWebsite || '',
        companyAddress: data.companyAddress || '',
        companySize: data.companySize || '',
        industry: data.industry || '',
        phone: data.phone || '',
        email: data.email || user.email || '',
        avatar: data.avatar
      }

      setProfile(profileData)
      setFormData(profileData)
      setAvatarPreview(profileData.avatar || null)
    } catch (error: any) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      // Убеждаемся, что если аватар был загружен, он включен в данные для сохранения
      const dataToSave = {
        ...formData,
        avatar: formData.avatar || (avatarPreview && avatarPreview.startsWith('data:') ? null : avatarPreview) || formData.avatar || ''
      }

      const response = await $api.put('/user/profile', dataToSave)
      // Обновляем профиль из ответа сервера, чтобы получить актуальные данные
      if (response.data) {
        const profileData: EmployerProfileData = {
          companyName: response.data.companyName || '',
          companyDescription: response.data.companyDescription || '',
          companyWebsite: response.data.companyWebsite || '',
          companyAddress: response.data.companyAddress || '',
          companySize: response.data.companySize || '',
          industry: response.data.industry || '',
          phone: response.data.phone || '',
          email: response.data.email || user.email || '',
          avatar: response.data.avatar || response.data.photo
        }
        setProfile(profileData)
        setFormData(profileData)
        setAvatarPreview(profileData.avatar ? getImageUrl(profileData.avatar) : null)
      } else {
        setProfile(formData)
        setFormData(formData)
      }
      setIsEditing(false)
      toast.success('Профиль обновлен')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      
      // Обработка различных типов ошибок
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Ошибка подключения к серверу. Проверьте, что сервер запущен.')
      } else if (error.response?.status === 401) {
        // Ошибка авторизации - не разлогиниваем автоматически, показываем сообщение
        toast.error('Ошибка авторизации. Пожалуйста, войдите заново.')
        // Не делаем автоматический редирект, чтобы пользователь мог увидеть ошибку
      } else if (error.response?.status === 403) {
        toast.error('Недостаточно прав для выполнения этого действия.')
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Ошибка при сохранении профиля'
        toast.error(errorMessage)
      }
      // Не закрываем форму редактирования при ошибке, чтобы пользователь мог исправить данные
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAvatarFile(file)
      // Создаем превью
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return

    setIsUploadingAvatar(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('photo', avatarFile)

      const response = await $api.post('/user/upload-photo', uploadFormData)

      const data = response.data
      const avatarUrl = data.photo || data.avatar || ''
      
      // Обновляем форму с новым URL аватара
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl
      }))
      setAvatarPreview(getImageUrl(avatarUrl))
      setAvatarFile(null)
      toast.success('Аватар успешно загружен')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      
      // Более детальная обработка ошибок
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        toast.error('Ошибка подключения к серверу. Проверьте, что сервер запущен.')
      } else if (error.response) {
        // Сервер ответил с ошибкой
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Ошибка при загрузке аватара'
        toast.error(errorMessage)
      } else {
        // Другая ошибка
        const errorMessage = error.message || 'Ошибка при загрузке аватара'
        toast.error(errorMessage)
      }
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const loadApplications = async () => {
    if (!user) return
    try {
      const response = await $api.get('/applications/employer/all')
      const apps = Array.isArray(response.data) ? response.data : []
      setApplications(apps)
    } catch (error) {
      console.error('Error loading applications:', error)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      await $api.put(`/applications/${applicationId}/status`, { status });
      toast.success(`Отклик ${status === 'accepted' ? 'принят' : 'отклонен'}`);
      loadApplications();
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.error || 'Ошибка при обновлении статуса отклика');
    }
  };

  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabChange = (tab: string) => {
    navigate(`/profile/employer?tab=${tab}`, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Menu */}
        <EmployerProfileNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-white">Профиль работодателя</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Загрузка аватара */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Аватар компании
                </label>
                <div className="space-y-3">
                  {avatarPreview && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-dark-card">
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <span className="inline-block px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors text-sm">
                        {avatarFile ? 'Файл выбран' : 'Выбрать файл'}
                      </span>
                    </label>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleUploadAvatar}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {isUploadingAvatar ? 'Загрузка...' : 'Загрузить'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название компании *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Отрасль
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  >
                    <option value="">Выберите отрасль</option>
                    <option value="IT">IT и технологии</option>
                    <option value="Finance">Финансы</option>
                    <option value="Healthcare">Здравоохранение</option>
                    <option value="Education">Образование</option>
                    <option value="Retail">Розничная торговля</option>
                    <option value="Manufacturing">Производство</option>
                    <option value="Other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Размер компании
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  >
                    <option value="">Выберите размер</option>
                    <option value="1-10">1-10 сотрудников</option>
                    <option value="11-50">11-50 сотрудников</option>
                    <option value="51-200">51-200 сотрудников</option>
                    <option value="201-500">201-500 сотрудников</option>
                    <option value="501+">501+ сотрудников</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Адрес
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание компании
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Расскажите о вашей компании..."
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Восстанавливаем данные из сохраненного профиля
                    if (profile) {
                      setFormData(profile);
                      setAvatarPreview(profile.avatar ? getImageUrl(profile.avatar) : null);
                      setAvatarFile(null);
                    }
                  }}
                  className="px-6 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Company Header */}
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={getImageUrl(profile.avatar)} alt={profile.companyName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Building2 className="h-12 w-12 text-accent-cyan" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {profile.companyName || 'Название не указано'}
                  </h2>
                  {profile.industry && (
                    <p className="text-accent-cyan font-medium mb-2">{profile.industry}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                    {profile.companySize && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {profile.companySize}
                      </div>
                    )}
                    {profile.companyAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {profile.companyAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Description */}
              {profile.companyDescription && (
                <div className="bg-dark-card rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent-cyan" />
                    О компании
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {profile.companyDescription}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-dark-card rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Контактная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.email && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <a href={`mailto:${profile.email}`} className="text-accent-cyan hover:text-accent-cyan/80">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Телефон</p>
                      <a href={`tel:${profile.phone}`} className="text-accent-cyan hover:text-accent-cyan/80">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {profile.companyWebsite && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Веб-сайт</p>
                      <a
                        href={profile.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-cyan hover:text-accent-cyan/80 flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        {profile.companyWebsite}
                      </a>
                    </div>
                  )}
                  {profile.companyAddress && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Адрес</p>
                      <p className="text-white">{profile.companyAddress}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Empty State */}
              {!profile.companyName && !profile.companyDescription && (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Профиль не заполнен</h3>
                  <p className="text-gray-400 mb-6">Заполните информацию о вашей компании</p>
                  <button onClick={() => setIsEditing(true)} className="btn-primary">
                    Заполнить профиль
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Отклики на вакансии</h2>
            <button
              onClick={loadApplications}
              className="p-2 text-accent-cyan hover:bg-dark-card rounded-lg transition-colors"
              title="Обновить список откликов"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  console.log('Rendering application:', app);
                  return (
                  <Card key={app.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {app.user?.avatar ? (
                            <img
                              src={getImageUrl(app.user.avatar)}
                              alt={app.user.username} 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-accent-cyan" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {app.user?.username || app.user?.email || 'Пользователь'}
                            </h3>
                            {app.user?.email && (
                              <p className="text-gray-400 text-sm">{app.user.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="ml-16">
                          <p className="text-white font-medium mb-1">
                            Вакансия: {app.vacancy?.title || `Вакансия #${app.vacancyId}` || 'Вакансия удалена'}
                          </p>
                          <p className="text-gray-400 text-sm mb-2">
                            Отклик отправлен: {new Date(app.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {app.coverLetter && (
                            <div className="mt-3 p-3 bg-dark-card rounded-lg">
                              <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.coverLetter}</p>
                            </div>
                          )}
                          {app.user?.resumes && app.user.resumes.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-sm mb-1">Резюме:</p>
                              <p className="text-accent-cyan text-sm">{app.user.resumes[0].title}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {app.status === 'accepted' ? 'Принят' :
                           app.status === 'rejected' ? 'Отклонен' :
                           'На рассмотрении'}
                        </span>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" />
                              Принять
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Отклонить
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <p className="text-gray-300 text-center py-8">
                  У вас пока нет откликов на вакансии
                  <br />
                  <span className="text-gray-400 text-sm">Убедитесь, что у вас есть активные вакансии и на них есть отклики</span>
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Vacancies Tab */}
        {activeTab === 'vacancies' && (
          <div className="bg-dark-surface rounded-lg p-8 border border-dark-card">
            <VacanciesManagement userId={user?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerProfile;
