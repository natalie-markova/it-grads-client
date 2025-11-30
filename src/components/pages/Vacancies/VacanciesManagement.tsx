import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Briefcase } from 'lucide-react';
import { vacanciesAPI } from '../../../utils/vacancies.api';
import VacancyForm from './VacancyForm';
import type { Vacancy } from '../../../types';
import toast from 'react-hot-toast';

interface VacanciesManagementProps {
  userId?: number;
}

export default function VacanciesManagement({ userId }: VacanciesManagementProps) {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | undefined>();

  useEffect(() => {
    if (userId) {
      loadVacancies();
    }
  }, [userId]);

  const loadVacancies = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await vacanciesAPI.getEmployerVacancies(userId);
      setVacancies(data);
    } catch (error) {
      console.error('Error loading vacancies:', error);
      toast.error('Ошибка при загрузке вакансий');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Vacancy>) => {
    try {
      await vacanciesAPI.create(data as any);
      await loadVacancies();
      setShowForm(false);
      toast.success('Вакансия создана!');
    } catch (error) {
      console.error('Error creating vacancy:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: Partial<Vacancy>) => {
    if (!editingVacancy) return;
    
    try {
      await vacanciesAPI.update(editingVacancy.id, data);
      await loadVacancies();
      setEditingVacancy(undefined);
      toast.success('Вакансия обновлена!');
    } catch (error) {
      console.error('Error updating vacancy:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;
    
    try {
      await vacanciesAPI.delete(id);
      await loadVacancies();
      toast.success('Вакансия удалена');
    } catch (error) {
      console.error('Error deleting vacancy:', error);
      toast.error('Ошибка при удалении вакансии');
    }
  };

  const handleToggleStatus = async (vacancy: Vacancy) => {
    try {
      await vacanciesAPI.toggleStatus(vacancy.id);
      await loadVacancies();
      toast.success(vacancy.isActive ? 'Вакансия деактивирована' : 'Вакансия активирована');
    } catch (error) {
      console.error('Error toggling vacancy status:', error);
      toast.error('Ошибка при изменении статуса');
    }
  };

  if (showForm) {
    return (
      <VacancyForm
        onSubmit={handleCreate}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  if (editingVacancy) {
    return (
      <VacancyForm
        vacancy={editingVacancy}
        onSubmit={handleUpdate}
        onCancel={() => setEditingVacancy(undefined)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-accent-cyan" />
          Мои вакансии ({vacancies.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Создать вакансию
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-lg">
          <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            У вас пока нет вакансий
          </h3>
          <p className="text-gray-400 mb-6">
            Создайте первую вакансию для поиска кандидатов
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Создать вакансию
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className={`bg-dark-card rounded-lg p-6 border ${
                vacancy.isActive ? 'border-accent-cyan/20' : 'border-dark-card opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{vacancy.title}</h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        vacancy.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {vacancy.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {vacancy.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                    {vacancy.location && (
                      <span>{vacancy.location}</span>
                    )}
                    {vacancy.salary && (
                      <span className="text-accent-cyan font-medium">
                        {vacancy.salary.toLocaleString()} ₽
                      </span>
                    )}
                    {vacancy.level && (
                      <span className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded">
                        {vacancy.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(vacancy)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    title={vacancy.isActive ? 'Деактивировать' : 'Активировать'}
                  >
                    {vacancy.isActive ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingVacancy(vacancy)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="h-5 w-5 text-accent-cyan" />
                  </button>
                  <button
                    onClick={() => handleDelete(vacancy.id)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>

              {vacancy.skills && vacancy.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dark-bg">
                  {vacancy.skills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-dark-bg text-gray-300 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {vacancy.skills.length > 5 && (
                    <span className="px-3 py-1 text-gray-400 text-sm">
                      +{vacancy.skills.length - 5} ещё
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}