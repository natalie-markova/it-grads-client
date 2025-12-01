import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Edit, Trash2, Building2, Globe, MapPin, Users, Briefcase, Check, X, User as UserIcon, RefreshCw } from 'lucide-react';
import { OutletContext } from '../../../types';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';
import VacanciesManagement from '../Vacancies/VacanciesManagement';
import Card from '../../ui/Card';


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
    // Проверяем авторизацию только один раз при монтировании или при изменении user
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'employer') {
      navigate('/login');
      return;
    }
    // Загружаем данные только если пользователь авторизован и является работодателем
    loadProfile();
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]); // Зависимости только от критических полей, чтобы избежать лишних редиректов

  const loadProfile = async () => {
    if (!user || user.role !== 'employer') {
      return; // Не загружаем профиль, если пользователь не авторизован или не работодатель
    }
    try {
      const response = await $api.get(`/user/profile`);
      const data = response.data;

      const profileData: EmployerProfileData = {
        companyName: data.companyName || '',
        companyDescription: data.companyDescription || '',
        companyWebsite: data.companyWebsite || '',
        companyAddress: data.companyAddress || '',
        companySize: data.companySize || '',
        industry: data.industry || '',
        phone: data.phone || '',
        email: data.email || user?.email || '',
        avatar: data.avatar
      };

      setProfile(profileData);
      setFormData(profileData);
      setAvatarPreview(profileData.avatar || null);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      // Если ошибка 401 или 403, не делаем редирект здесь - это обработается в useEffect
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Ошибка авторизации будет обработана в useEffect
        return;
      }
      // Если профиль не загружен, используем пустые данные
      const emptyProfile: EmployerProfileData = {
        companyName: '',
        companyDescription: '',
        companyWebsite: '',
        companyAddress: '',
        companySize: '',
        industry: '',
        phone: '',
        email: user?.email || ''
      };
      setProfile(emptyProfile);
      setFormData(emptyProfile);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await $api.put(`/user/profile`, formData);
      setProfile(formData);
      setIsEditing(false);
      toast.success('Профиль обновлен');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Ошибка при сохранении профиля');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadApplications = async () => {
    if (!user) {
      console.log('No user, skipping loadApplications');
      return;
    }
    if (user.role !== 'employer') {
      console.log('User is not employer, skipping loadApplications');
      return;
    }
    try {
      console.log('Loading applications for employer:', user.id);
      const response = await $api.get('/applications/employer/all');
      console.log('Applications API response:', response);
      console.log('Applications data:', response.data);
      console.log('Applications data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      console.log('Applications count:', response.data?.length || 0);
      
      // Убеждаемся, что данные - это массив
      const apps = Array.isArray(response.data) ? response.data : [];
      console.log('Processed applications:', apps);
      console.log('Processed applications count:', apps.length);
      
      if (apps.length > 0) {
        console.log('First application:', apps[0]);
        console.log('First application user:', apps[0]?.user);
        console.log('First application vacancy:', apps[0]?.vacancy);
      }
      
      setApplications(apps);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      // Если ошибка 401 или 403, не делаем редирект здесь - это обработается в useEffect
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Access denied or unauthorized - will be handled in useEffect');
        // Ошибка авторизации будет обработана в useEffect, не делаем редирект здесь
        return;
      }
      toast.error(error.response?.data?.error || 'Ошибка при загрузке откликов');
    }
  };

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
                    setFormData(profile);
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

        {/* Applications Section */}
        <div className="mt-8 bg-dark-surface rounded-lg p-8 border border-dark-card">
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

        {/* My Vacancies Section */}
        <div className="mt-8 bg-dark-surface rounded-lg p-8 border border-dark-card">
          <VacanciesManagement userId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
