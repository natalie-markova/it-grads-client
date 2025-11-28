import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Download, MessageCircle } from 'lucide-react';
import { Resume } from '../../../types';
import { $api } from '../../../utils/axios.instance';
import { useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { OutletContext } from '../../../types';

const Candidates = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    minSalary: '',
    maxSalary: ''
  });
  const { user } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.location) params.append('location', filters.location);
      if (filters.minSalary) params.append('minSalary', filters.minSalary);
      if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);

      const response = await $api.get(`/resumes?${params.toString()}`);
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Ошибка при загрузке резюме');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    fetchResumes();
  };

  const handleStartChat = async (candidateId: number) => {
    if (!user) {
      toast.error('Необходимо авторизоваться');
      navigate('/login');
      return;
    }

    try {
      const response = await $api.post('/chats', { otherUserId: candidateId });
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    }
  };

  const handleDownloadResume = (resumeId: number) => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/resumes/${resumeId}/download-pdf`, '_blank');
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
        <h1 className="text-4xl font-bold text-white mb-8">Карта кандидатов</h1>

        {/* Фильтры */}
        <div className="bg-dark-surface rounded-lg p-6 mb-8 border border-dark-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Навыки (через запятую)
              </label>
              <input
                type="text"
                name="skills"
                value={filters.skills}
                onChange={handleFilterChange}
                placeholder="React, Node.js"
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
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Москва"
                className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Зарплата от
              </label>
              <input
                type="number"
                name="minSalary"
                value={filters.minSalary}
                onChange={handleFilterChange}
                placeholder="50000"
                className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Зарплата до
              </label>
              <input
                type="number"
                name="maxSalary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
                placeholder="200000"
                className="w-full px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              />
            </div>
          </div>
          <button
            onClick={handleApplyFilters}
            className="mt-4 btn-primary flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Применить фильтры
          </button>
        </div>

        {/* Список резюме */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              Резюме не найдены
            </div>
          ) : (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-dark-surface rounded-lg p-6 border border-dark-card hover:border-accent-cyan transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {resume.user?.username}
                    </h3>
                    <p className="text-accent-cyan font-medium">{resume.title}</p>
                  </div>
                  {resume.user?.avatar && (
                    <img
                      src={resume.user.avatar}
                      alt={resume.user.username}
                      className="h-12 w-12 rounded-full"
                    />
                  )}
                </div>

                {resume.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {resume.description}
                  </p>
                )}

                {resume.skills && resume.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-dark-card text-accent-cyan text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {resume.skills.length > 5 && (
                        <span className="px-2 py-1 bg-dark-card text-gray-400 text-xs rounded">
                          +{resume.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {resume.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {resume.location}
                    </div>
                  )}
                  {resume.desiredSalary && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      {resume.desiredSalary.toLocaleString()} руб.
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {resume.pdfUrl && (
                    <button
                      onClick={() => handleDownloadResume(resume.id)}
                      className="flex-1 px-4 py-2 bg-dark-card hover:bg-accent-cyan hover:text-dark-bg text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </button>
                  )}
                  <button
                    onClick={() => handleStartChat(resume.userId)}
                    className="flex-1 px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Написать
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Candidates;
