import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, Award, GraduationCap, Globe, Code, MessageSquare, Map, Users, X } from 'lucide-react';
import Card from '../../ui/Card';
import Section from '../../ui/Section';
import { chatAPI } from '../../../utils/chat.api';
import type { OutletContext } from '../../../types';
import toast from 'react-hot-toast';

interface Resume {
  id: number;
  title: string;
  description: string;
  skillsArray: string[];
  location: string;
  level: string;
  desiredSalary: number;
  experience?: string;
  education?: string;
  portfolio?: string;
  userId?: number;
  user?: {
    id: number;
    username: string;
  };
}

const Candidates = () => {
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChatFor, setCreatingChatFor] = useState<number | null>(null);

  // Фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${apiUrl}/resumes`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получаем все уникальные значения для фильтров
  const filterOptions = useMemo(() => {
    const skills = new Set<string>();
    const locations = new Set<string>();

    resumes.forEach(r => {
      r.skillsArray?.forEach(s => skills.add(s));
      if (r.location) locations.add(r.location);
    });

    return {
      skills: Array.from(skills).sort(),
      locations: Array.from(locations).sort(),
    };
  }, [resumes]);

  // Фильтруем резюме
  const filteredResumes = useMemo(() => {
    return resumes.filter(resume => {
      // Поиск по тексту
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          resume.title?.toLowerCase().includes(searchLower) ||
          resume.description?.toLowerCase().includes(searchLower) ||
          resume.user?.username?.toLowerCase().includes(searchLower) ||
          resume.location?.toLowerCase().includes(searchLower) ||
          resume.skillsArray?.some(s => s.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Фильтр по навыкам
      if (selectedSkills.length > 0) {
        const hasSkills = selectedSkills.some(skill =>
          resume.skillsArray?.includes(skill)
        );
        if (!hasSkills) return false;
      }

      // Фильтр по уровню
      if (selectedLevel && resume.level !== selectedLevel) {
        return false;
      }

      // Фильтр по локации
      if (selectedLocation && resume.location !== selectedLocation) {
        return false;
      }

      // Фильтр по зарплате
      if (salaryRange.min && resume.desiredSalary && resume.desiredSalary < salaryRange.min) {
        return false;
      }
      if (salaryRange.max && resume.desiredSalary && resume.desiredSalary > salaryRange.max) {
        return false;
      }

      return true;
    });
  }, [resumes, searchTerm, selectedSkills, selectedLevel, selectedLocation, salaryRange]);

  const handleStartChat = async (candidateId: number) => {
    if (!user) {
      toast.error('Войдите в систему, чтобы написать сообщение');
      navigate('/login');
      return;
    }

    if (user.role !== 'employer') {
      toast.error('Только работодатели могут писать кандидатам');
      return;
    }

    setCreatingChatFor(candidateId);
    try {
      const chat = await chatAPI.createChat(candidateId);
      toast.success('Чат создан!');
      navigate(`/messenger/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    } finally {
      setCreatingChatFor(null);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedLevel('');
    setSelectedLocation('');
    setSalaryRange({ min: null, max: null });
  };

  const hasActiveFilters = searchTerm || selectedSkills.length > 0 || selectedLevel || selectedLocation || salaryRange.min || salaryRange.max;

  // Статистика
  const stats = useMemo(() => ({
    total: resumes.length,
    filtered: filteredResumes.length,
    locations: filterOptions.locations.length,
  }), [resumes, filteredResumes, filterOptions]);

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section title="" className="bg-dark-bg py-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Кандидаты</h1>
                <p className="text-gray-300 text-lg">
                  Просмотрите резюме специалистов и найдите подходящих кандидатов
                </p>
              </div>
              <button
                onClick={() => navigate('/candidates/map')}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Map className="h-5 w-5" />
                Карта соискателей
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center py-4">
              <Users className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Всего кандидатов</p>
            </Card>
            <Card className="text-center py-4">
              <Filter className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.filtered}</p>
              <p className="text-sm text-gray-400">По фильтрам</p>
            </Card>
            <Card className="text-center py-4">
              <MapPin className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.locations}</p>
              <p className="text-sm text-gray-400">Городов</p>
            </Card>
            <Card className="text-center py-4">
              <Code className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{filterOptions.skills.length}</p>
              <p className="text-sm text-gray-400">Навыков</p>
            </Card>
          </div>

          {/* Поиск и фильтры */}
          <Card className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск по навыкам, городам, имени..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-card rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-accent-cyan text-accent-cyan' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  Фильтры
                  {hasActiveFilters && (
                    <span className="bg-accent-cyan text-dark-bg text-xs px-2 py-0.5 rounded-full">
                      {selectedSkills.length + (selectedLevel ? 1 : 0) + (selectedLocation ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Развернутые фильтры */}
              {showFilters && (
                <div className="pt-4 border-t border-dark-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Уровень */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Уровень</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      >
                        <option value="">Все уровни</option>
                        <option value="junior">Junior</option>
                        <option value="middle">Middle</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>

                    {/* Локация */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Город</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      >
                        <option value="">Все города</option>
                        {filterOptions.locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Зарплата от */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Зарплата от</label>
                      <input
                        type="number"
                        placeholder="мин. ₽"
                        value={salaryRange.min || ''}
                        onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>

                    {/* Зарплата до */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Зарплата до</label>
                      <input
                        type="number"
                        placeholder="макс. ₽"
                        value={salaryRange.max || ''}
                        onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>

                  {/* Навыки */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Навыки</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-dark-surface rounded-lg">
                      {filterOptions.skills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            selectedSkills.includes(skill)
                              ? 'bg-accent-cyan text-dark-bg'
                              : 'bg-dark-card border border-dark-card text-gray-300 hover:border-accent-cyan'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Выбранные навыки */}
                  {selectedSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-400">Выбрано:</span>
                      {selectedSkills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-lg text-sm"
                        >
                          {skill}
                          <button onClick={() => toggleSkill(skill)} className="hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Кнопка сброса */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-accent-cyan hover:text-accent-cyan/80 text-sm"
                    >
                      Сбросить все фильтры
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Список резюме */}
          {loading ? (
            <Card>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
                <p className="text-gray-300 mt-4">Загрузка резюме...</p>
              </div>
            </Card>
          ) : filteredResumes.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">Кандидаты не найдены</p>
                <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-accent-cyan hover:text-accent-cyan/80"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredResumes.map((resume) => (
                <Card key={resume.id} className="hover:border-accent-cyan/50 transition-all">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{resume.title}</h3>
                        <p className="text-gray-400">{resume.user?.username}</p>
                      </div>
                      {resume.desiredSalary && (
                        <span className="text-accent-cyan font-semibold text-lg">
                          от {resume.desiredSalary.toLocaleString()} ₽
                        </span>
                      )}
                    </div>

                    {resume.description && (
                      <p className="text-gray-300 whitespace-pre-wrap line-clamp-3">{resume.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {resume.location && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="h-4 w-4 text-accent-cyan" />
                          <span>{resume.location}</span>
                        </div>
                      )}
                      {resume.level && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Briefcase className="h-4 w-4 text-accent-cyan" />
                          <span className="capitalize">{resume.level}</span>
                        </div>
                      )}
                    </div>

                    {resume.experience && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Award className="h-5 w-5 text-accent-cyan" />
                          Опыт работы
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap line-clamp-2">{resume.experience}</p>
                      </div>
                    )}

                    {resume.education && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-accent-cyan" />
                          Образование
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap line-clamp-2">{resume.education}</p>
                      </div>
                    )}

                    {resume.portfolio && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-accent-cyan" />
                          Портфолио
                        </h4>
                        <a
                          href={resume.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-cyan hover:text-accent-cyan/80 transition-colors break-all"
                        >
                          {resume.portfolio}
                        </a>
                      </div>
                    )}

                    {resume.skillsArray && resume.skillsArray.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Code className="h-5 w-5 text-accent-cyan" />
                          Навыки
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resume.skillsArray.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 border rounded-lg text-sm ${
                                selectedSkills.includes(skill)
                                  ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                                  : 'bg-dark-surface border-accent-cyan/30 text-gray-300'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-dark-card">
                      <button className="btn-primary text-sm">
                        Посмотреть резюме
                      </button>
                      {user && user.role === 'employer' && (
                        <button
                          onClick={() => handleStartChat(resume.user?.id || resume.userId || 0)}
                          disabled={creatingChatFor === (resume.user?.id || resume.userId)}
                          className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {creatingChatFor === (resume.user?.id || resume.userId) ? 'Создание...' : 'Написать'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default Candidates;