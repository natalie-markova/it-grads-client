import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/Card';
import toast from 'react-hot-toast';

interface ResumeFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const ResumeForm = ({ onClose, onSuccess }: ResumeFormProps) => {
  const navigate = useNavigate();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

      const response = await fetch(`${apiUrl}/resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          skillsArray,
          skills: JSON.stringify(skillsArray),
          desiredSalary: parseInt(formData.desiredSalary) || 0,
        }),
      });

      if (response.ok) {
        toast.success('Резюме успешно создано!');
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        } else {
          navigate('/profile/graduate');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Ошибка при создании резюме');
      }
    } catch (error) {
      console.error('Error creating resume:', error);
      toast.error('Ошибка при создании резюме');
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Создать резюме</h2>
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
              onChange={(e) => setFormData({ ...formData, desiredSalary: e.target.value })}
              className="input-field w-full"
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
            Создать резюме
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default ResumeForm;
