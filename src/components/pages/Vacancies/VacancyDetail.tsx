import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Heart, Calendar, User, Check } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import { OutletContext } from '../../../types';
import toast from 'react-hot-toast';
import Card from '../../ui/Card';

const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();
  const [vacancy, setVacancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVacancy();
      if (user) {
        checkFavorite();
        checkApplication();
      }
    }
  }, [id, user]);

  const checkApplication = async () => {
    if (!user || !id) return;
    try {
      const response = await $api.get('/applications/my');
      const application = response.data.find((app: any) => app.vacancyId === parseInt(id, 10));
      if (application) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const fetchVacancy = async () => {
    try {
      setLoading(true);
      const response = await $api.get(`/vacancies/${id}`);
      setVacancy(response.data);
    } catch (error: any) {
      console.error('Error fetching vacancy:', error);
      if (error.response?.status === 404) {
        toast.error('Вакансия не найдена');
        navigate('/jobs');
      } else {
        toast.error('Ошибка при загрузке вакансии');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id) return;
    try {
      const response = await $api.get(`/favorites/check/${id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Необходимо авторизоваться');
      return;
    }

    if (!id) return;

    try {
      const vacancyId = parseInt(id, 10);
      if (isNaN(vacancyId)) {
        toast.error('Неверный ID вакансии');
        return;
      }

      if (isFavorite) {
        await $api.delete(`/favorites/${vacancyId}`);
        setIsFavorite(false);
        toast.success('Вакансия удалена из избранного');
      } else {
        await $api.post('/favorites', { vacancyId });
        setIsFavorite(true);
        toast.success('Вакансия добавлена в избранное');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при изменении избранного';
      toast.error(errorMessage);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Необходимо авторизоваться');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      const vacancyId = parseInt(id, 10);
      if (isNaN(vacancyId)) {
        toast.error('Неверный ID вакансии');
        return;
      }

      await $api.post('/applications', { vacancyId });
      setHasApplied(true);
      toast.success('Отклик успешно отправлен!');
    } catch (error: any) {
      console.error('Error applying to job:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при отправке отклика';
      toast.error(errorMessage);
    }
  };

  const employmentTypeLabels = {
    'full-time': 'Полная занятость',
    'part-time': 'Частичная занятость',
    'contract': 'Контракт',
    'internship': 'Стажировка'
  };

  const levelLabels = {
    'junior': 'Junior',
    'middle': 'Middle',
    'senior': 'Senior',
    'lead': 'Lead'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Вакансия не найдена</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="btn-primary"
          >
            Вернуться к вакансиям
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-accent-cyan transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Назад
        </button>

        <Card className="p-8">
          {/* Заголовок */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{vacancy.title}</h1>
              {vacancy.employer && (
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <User className="h-4 w-4" />
                  <span>{vacancy.employer.username}</span>
                  {vacancy.companyName && (
                    <>
                      <span>•</span>
                      <span>{vacancy.companyName}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {user && (
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-lg transition-colors ${
                  isFavorite
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-dark-surface text-gray-400 hover:bg-dark-card hover:text-accent-cyan'
                }`}
                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart 
                  className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} 
                />
              </button>
            )}
          </div>

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-dark-card">
            {vacancy.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent-cyan" />
                <div>
                  <p className="text-gray-400 text-sm">Зарплата</p>
                  <p className="text-white font-semibold">{vacancy.salary.toLocaleString()} руб.</p>
                </div>
              </div>
            )}
            {vacancy.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent-cyan" />
                <div>
                  <p className="text-gray-400 text-sm">Местоположение</p>
                  <p className="text-white font-semibold">{vacancy.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-accent-cyan" />
              <div>
                <p className="text-gray-400 text-sm">Тип занятости</p>
                <p className="text-white font-semibold">{employmentTypeLabels[vacancy.employmentType]}</p>
              </div>
            </div>
            {vacancy.level && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent-cyan" />
                <div>
                  <p className="text-gray-400 text-sm">Уровень</p>
                  <p className="text-white font-semibold">{levelLabels[vacancy.level]}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-cyan" />
              <div>
                <p className="text-gray-400 text-sm">Опубликовано</p>
                <p className="text-white font-semibold">
                  {new Date(vacancy.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Описание */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-3">Описание</h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{vacancy.description}</p>
          </div>

          {/* Требования */}
          {vacancy.requirements && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Требования</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{vacancy.requirements}</p>
            </div>
          )}

          {/* Навыки */}
          {vacancy.skills && vacancy.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Требуемые навыки</h2>
              <div className="flex flex-wrap gap-2">
                {vacancy.skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Бенефиты */}
          {vacancy.benefits && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">Условия и бенефиты</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{vacancy.benefits}</p>
            </div>
          )}

          {/* Информация о работодателе */}
          {vacancy.employer && (
            <div className="mb-6 pt-6 border-t border-dark-card">
              <h2 className="text-xl font-semibold text-white mb-3">О работодателе</h2>
              <div className="space-y-2 text-gray-300">
                {vacancy.employer.companyName && (
                  <p><span className="text-gray-400">Компания:</span> {vacancy.employer.companyName}</p>
                )}
                {vacancy.employer.email && (
                  <p><span className="text-gray-400">Email:</span> {vacancy.employer.email}</p>
                )}
                {vacancy.employer.phone && (
                  <p><span className="text-gray-400">Телефон:</span> {vacancy.employer.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          {user && user.role === 'graduate' && (
            <div className="flex gap-4 pt-6 border-t border-dark-card">
              {hasApplied ? (
                <div className="flex-1 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center gap-2 border border-green-500/30">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Вы откликнулись</span>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  className="flex-1 btn-primary"
                >
                  Откликнуться
                </button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VacancyDetail;

