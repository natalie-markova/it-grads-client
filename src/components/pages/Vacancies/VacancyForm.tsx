import { useState, FormEvent } from 'react';
import { Briefcase, DollarSign, MapPin, FileText, X } from 'lucide-react';
import type { Vacancy } from '../../../types';
import toast from 'react-hot-toast';

interface VacancyFormProps {
  vacancy?: Vacancy;
  onSubmit: (data: Partial<Vacancy>) => Promise<void>;
  onCancel: () => void;
}

export default function VacancyForm({ vacancy, onSubmit, onCancel }: VacancyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>(vacancy?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleNumberInputInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;

    if (value === '') {
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
      const validValue = value.replace(/[^0-9]/g, '');
      input.value = validValue;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const data: Partial<Vacancy> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        requirements: formData.get('requirements') as string,
        salary: formData.get('salary') ? Number(formData.get('salary')) : undefined,
        location: formData.get('location') as string,
        employmentType: formData.get('employmentType') as any,
        level: formData.get('level') as any,
        benefits: formData.get('benefits') as string,
        skills: skills,
      };

      await onSubmit(data);
      toast.success(vacancy ? 'Вакансия обновлена!' : 'Вакансия создана!');
    } catch (error) {
      console.error('Error submitting vacancy:', error);
      toast.error('Ошибка при сохранении вакансии');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-accent-cyan" />
          {vacancy ? 'Редактировать вакансию' : 'Новая вакансия'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-dark-card rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Название вакансии *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={vacancy?.title}
            className="input-field"
            placeholder="Например: Frontend разработчик"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Описание *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            defaultValue={vacancy?.description}
            className="input-field resize-none"
            placeholder="Опишите обязанности, задачи и ожидания от кандидата"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
            Требования
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={4}
            defaultValue={vacancy?.requirements}
            className="input-field resize-none"
            placeholder="Опишите требования к кандидату"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Требуемые навыки
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input-field flex-1"
              placeholder="Добавьте навык и нажмите Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn-secondary"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Зарплата (₽/месяц)
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              defaultValue={vacancy?.salary}
              onKeyDown={handleNumberInputKeyDown}
              onInput={handleNumberInputInput}
              min="0"
              step="1"
              className="input-field [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="Например: 150000"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Локация
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={vacancy?.location}
              className="input-field"
              placeholder="Например: Москва, удаленно"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-300 mb-2">
              Тип занятости *
            </label>
            <select
              id="employmentType"
              name="employmentType"
              required
              defaultValue={vacancy?.employmentType || 'full-time'}
              className="input-field"
            >
              <option value="full-time">Полная занятость</option>
              <option value="part-time">Частичная занятость</option>
              <option value="contract">Контракт</option>
              <option value="internship">Стажировка</option>
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-2">
              Уровень
            </label>
            <select
              id="level"
              name="level"
              defaultValue={vacancy?.level || 'middle'}
              className="input-field"
            >
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="benefits" className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Бенефиты и преимущества
          </label>
          <textarea
            id="benefits"
            name="benefits"
            rows={3}
            defaultValue={vacancy?.benefits}
            className="input-field resize-none"
            placeholder="ДМС, гибкий график, обучение и т.д."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? 'Сохранение...' : (vacancy ? 'Сохранить изменения' : 'Создать вакансию')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
