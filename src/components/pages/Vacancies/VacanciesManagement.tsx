import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Briefcase, X, MapPin, DollarSign, Clock } from 'lucide-react';
import { vacanciesAPI } from '../../../utils/vacancies.api';
import VacancyForm from './VacancyForm';
import type { Vacancy } from '../../../types';
import toast from 'react-hot-toast';
import ConfirmModal from '../../ui/ConfirmModal';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';

interface VacanciesManagementProps {
  userId?: number;
}

export default function VacanciesManagement({ userId }: VacanciesManagementProps) {
  const { t } = useTranslation();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | undefined>();
  const [viewingVacancy, setViewingVacancy] = useState<Vacancy | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

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
      toast.error(t('myVacancies.loadError', t('toasts.vacanciesLoadError')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Vacancy>) => {
    try {
      await vacanciesAPI.create(data as any);
      await loadVacancies();
      setShowForm(false);
      toast.success(t('toasts.vacancyCreated'));
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
      toast.success(t('toasts.vacancySaved'));
    } catch (error) {
      console.error('Error updating vacancy:', error);
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await vacanciesAPI.delete(deleteConfirm.id);
      await loadVacancies();
      toast.success(t('toasts.vacancyDeleted'));
    } catch (error) {
      console.error('Error deleting vacancy:', error);
      toast.error(t('myVacancies.deleteError', t('toasts.vacancySaveError')));
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleToggleStatus = async (vacancy: Vacancy) => {
    try {
      await vacanciesAPI.toggleStatus(vacancy.id);
      await loadVacancies();
      toast.success(t('myVacancies.statusUpdated'));
    } catch (error) {
      console.error('Error toggling vacancy status:', error);
      toast.error(t('myVacancies.statusError', t('toasts.vacancySaveError')));
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-accent-cyan" />
          {t('myVacancies.title')} ({vacancies.length})
        </h2>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-white text-xl">{t('common.loading')}</div>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-lg">
          <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {t('myVacancies.noVacancies')}
          </h3>
          <p className="text-gray-400 mb-6">
            {t('myVacancies.createFirst')}
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            {t('myVacancies.createNew')}
          </button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              {t('myVacancies.createNew')}
            </button>
          </div>
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
                      {vacancy.isActive ? t('myVacancies.status.active') : t('myVacancies.status.paused')}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {vacancy.description}
                  </p>
                  <button
                    onClick={() => setViewingVacancy(vacancy)}
                    className="text-accent-cyan hover:text-accent-cyan/80 text-sm mb-3 transition-colors"
                  >
                    {t('myVacancies.viewDetails')}
                  </button>
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
                    title={vacancy.isActive ? t('myVacancies.actions.pause') : t('myVacancies.actions.activate')}
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
                    title={t('myVacancies.actions.edit')}
                  >
                    <Edit className="h-5 w-5 text-accent-cyan" />
                  </button>
                  <button
                    onClick={() => handleDelete(vacancy.id)}
                    className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                    title={t('myVacancies.actions.delete')}
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
                      +{vacancy.skills.length - 5} {t('common.more').toLowerCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Модальное окно просмотра вакансии */}
      {viewingVacancy && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setViewingVacancy(null)}
        >
          <div
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{viewingVacancy.title}</h2>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        viewingVacancy.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {viewingVacancy.isActive ? t('myVacancies.status.active') : t('myVacancies.status.paused')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingVacancy(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {viewingVacancy.location && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-5 w-5 text-accent-cyan" />
                    <span>{viewingVacancy.location}</span>
                  </div>
                )}
                {viewingVacancy.salary && (
                  <div className="flex items-center gap-2 text-accent-cyan font-semibold">
                    <DollarSign className="h-5 w-5" />
                    <span>{viewingVacancy.salary.toLocaleString()} ₽</span>
                  </div>
                )}
                {viewingVacancy.level && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Briefcase className="h-5 w-5 text-accent-cyan" />
                    <span className="capitalize">{viewingVacancy.level}</span>
                  </div>
                )}
                {viewingVacancy.employmentType && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-5 w-5 text-accent-cyan" />
                    <span>{viewingVacancy.employmentType}</span>
                  </div>
                )}
              </div>

              {/* Описание */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t('myVacancies.modal.description')}</h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {viewingVacancy.description}
                </p>
              </div>

              {/* Требования */}
              {viewingVacancy.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{t('myVacancies.modal.requirements')}</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {viewingVacancy.requirements}
                  </p>
                </div>
              )}

              {/* Навыки */}
              {viewingVacancy.skills && viewingVacancy.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{t('myVacancies.modal.skills')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingVacancy.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex gap-3 pt-4 border-t border-dark-card">
                <button
                  onClick={() => {
                    setViewingVacancy(null);
                    setEditingVacancy(viewingVacancy);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {t('myVacancies.actions.edit')}
                </button>
                <button
                  onClick={() => {
                    setViewingVacancy(null);
                    handleToggleStatus(viewingVacancy);
                  }}
                  className="px-4 py-2 bg-dark-card hover:bg-dark-card/80 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {viewingVacancy.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      {t('myVacancies.actions.pause')}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      {t('myVacancies.actions.activate')}
                    </>
                  )}
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={t('myVacancies.deleteTitle', t('common.delete'))}
        message={t('myVacancies.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}