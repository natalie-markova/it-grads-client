import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Edit, Trash2, Building2, Globe, MapPin, Users, Briefcase } from 'lucide-react';
import { OutletContext } from '../../../types';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';

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

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    if (!user || user.role !== 'employer') {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await $api.get(`/user/${user?.id}`);
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
    } catch (error) {
      console.error('Error loading profile:', error);
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
      await $api.put(`/user/${user?.id}`, formData);
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
                    <img src={profile.avatar} alt={profile.companyName} className="w-full h-full object-cover rounded-lg" />
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

        {/* My Vacancies Section */}
        <div className="mt-8 bg-dark-surface rounded-lg p-8 border border-dark-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Мои вакансии</h2>
            <button
              onClick={() => navigate('/vacancies')}
              className="btn-primary text-sm"
            >
              Управлять вакансиями
            </button>
          </div>
          <p className="text-gray-400">
            Перейдите на страницу вакансий для создания и управления вашими вакансиями
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
