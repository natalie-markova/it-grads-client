import { useState, useEffect } from 'react';
import { Plus, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { Vacancy } from '../../../types';
import { $api } from '../../../utils/axios.instance';
import { useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { OutletContext } from '../../../types';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship'
  });

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await $api.get('/vacancies');
      setVacancies(response.data);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
      toast.error('Ошибка при загрузке вакансий');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Необходимо авторизоваться');
      navigate('/login');
      return;
    }

    try {
      await $api.post('/vacancies', {
        ...formData,
        salary: formData.salary ? parseInt(formData.salary) : undefined
      });
      toast.success('Вакансия создана');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        employmentType: 'full-time'
      });
      fetchVacancies();
    } catch (error) {
      console.error('Error creating vacancy:', error);
      toast.error('Ошибка при создании вакансии');
    }
  };

  const employmentTypeLabels = {
    'full-time': 'Полная занятость',
    'part-time': 'Частичная занятость',
    'contract': 'Контракт',
    'internship': 'Стажировка'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Вакансии</h1>
          {user?.role === 'employer' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Создать вакансию
            </button>
          )}
        </div>

        {/* Список вакансий */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vacancies.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              Вакансии не найдены
            </div>
          ) : (
            vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="bg-dark-surface rounded-lg p-6 border border-dark-card hover:border-accent-cyan transition-colors"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {vacancy.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {vacancy.employer?.username}
                  </p>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-3">
                  {vacancy.description}
                </p>

                {vacancy.requirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-accent-cyan mb-2">
                      Требования:
                    </h4>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {vacancy.requirements}
                    </p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {vacancy.salary && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      {vacancy.salary.toLocaleString()} руб.
                    </div>
                  )}
                  {vacancy.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {vacancy.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    {employmentTypeLabels[vacancy.employmentType]}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/vacancy/${vacancy.id}`)}
                  className="w-full px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors"
                >
                  Подробнее
                </button>
              </div>
            ))
              );
            })
          )}
        </div>

        {/* Модальное окно создания вакансии */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
            <div className="bg-dark-surface rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-card">
              <h2 className="text-2xl font-bold text-white mb-6">Создать вакансию</h2>
              <form onSubmit={handleCreateVacancy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Название должности
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Требования
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Зарплата (руб.)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Местоположение
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип занятости
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  >
                    <option value="full-time">Полная занятость</option>
                    <option value="part-time">Частичная занятость</option>
                    <option value="contract">Контракт</option>
                    <option value="internship">Стажировка</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Создать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacancies;
