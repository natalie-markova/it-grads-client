import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../ui/Card';
import toast from 'react-hot-toast';
import { $api } from '../../../utils/axios.instance';

interface ResumeFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const ResumeForm = ({ onClose, onSuccess }: ResumeFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    experience: '',
    education: '',
    portfolio: '',
    desiredSalary: '',
    location: '',
    level: 'junior' as 'junior' | 'middle' | 'senior' | 'lead',
  });

  useEffect(() => {
    if (isEditing && id) {
      loadResume(id);
    }
  }, [id, isEditing]);

  const loadResume = async (resumeId: string) => {
    try {
      setIsLoading(true);
      const response = await $api.get(`/resumes/${resumeId}`);
      const resume = response.data;
      
      setFormData({
        title: resume.title || '',
        description: resume.description || '',
        skills: Array.isArray(resume.skillsArray) ? resume.skillsArray.join(', ') : (resume.skills || ''),
        experience: resume.experience || '',
        education: resume.education || '',
        portfolio: resume.portfolio || '',
        desiredSalary: resume.desiredSalary ? resume.desiredSalary.toString() : '',
        location: resume.location || '',
        level: resume.level || 'junior',
      });
    } catch (error: any) {
      console.error('Error loading resume:', error);
      toast.error('Ошибка при загрузке резюме');
      if (onClose) {
        onClose();
      } else {
        navigate('/profile/graduate?tab=resumes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем пустую строку для очистки поля
    if (value === '') {
      setFormData({ ...formData, desiredSalary: '' });
      return;
    }
    // Проверяем, что значение - целое положительное число
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && Number.isInteger(numValue)) {
      setFormData({ ...formData, desiredSalary: value });
    }
    // Если значение невалидно (отрицательное или дробное), просто игнорируем его
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];

      const payload = {
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        skills: skillsArray.length > 0 ? JSON.stringify(skillsArray) : null,
        skillsArray: skillsArray.length > 0 ? skillsArray : [],
        experience: formData.experience.trim() || null,
        education: formData.education.trim() || null,
        portfolio: formData.portfolio.trim() || null,
        desiredSalary: formData.desiredSalary ? parseInt(formData.desiredSalary) : null,
        location: formData.location.trim() || null,
        level: formData.level || 'junior',
      };

      if (isEditing && id) {
        await $api.put(`/resumes/${id}`, payload);
        toast.success('Резюме успешно обновлено!');
      } else {
        await $api.post('/resumes', payload);
        toast.success('Резюме успешно создано!');
      }

      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      } else {
        navigate('/profile/graduate?tab=resumes');
      }
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} resume:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Ошибка при ${isEditing ? 'обновлении' : 'создании'} резюме`;
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-300">Загрузка резюме...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">{isEditing ? 'Редактировать резюме' : 'Создать резюме'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Название должности
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field w-full"
            placeholder="например: Frontend разработчик"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            О себе
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field w-full"
            rows={4}
            placeholder="Расскажите о себе, своем опыте и целях..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Уровень
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="input-field w-full"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Желаемая зарплата (₽)
            </label>
            <input
              type="number"
              value={formData.desiredSalary}
              onChange={handleNumberInputChange}
              min="0"
              step="1"
              className="input-field w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="100000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Город
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input-field w-full"
            placeholder="Москва"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Навыки (через запятую)
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="input-field w-full"
            placeholder="JavaScript, React, TypeScript, Node.js"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Опыт работы
          </label>
          <textarea
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="input-field w-full"
            rows={4}
            placeholder="Опишите ваш опыт работы..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Образование
          </label>
          <textarea
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            className="input-field w-full"
            rows={3}
            placeholder="Укажите ваше образование..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Портфолио / GitHub
          </label>
          <input
            type="url"
            value={formData.portfolio}
            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            className="input-field w-full"
            placeholder="https://github.com/username"
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            {isEditing ? 'Сохранить изменения' : 'Создать резюме'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
          )}
          {!onClose && (
            <button type="button" onClick={() => navigate('/profile/graduate?tab=resumes')} className="btn-secondary">
              Отмена
            </button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default ResumeForm;
