import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, Award, GraduationCap, Globe, Code, MessageSquare } from 'lucide-react';
import Card from '../../ui/Card';
import Section from '../../ui/Section';
import { chatAPI } from '../../../utils/chat.api';
import { OutletContext } from '../../../types';
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

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section title="" className="bg-dark-bg py-0">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Кандидаты</h1>
            <p className="text-gray-300 text-lg">
              Просмотрите резюме специалистов и найдите подходящих кандидатов
            </p>
          </div>

          {loading ? (
            <Card>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
                <p className="text-gray-300 mt-4">Загрузка резюме...</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {resumes.map((resume) => (
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
                      <p className="text-gray-300 whitespace-pre-wrap">{resume.description}</p>
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
                          <span>{resume.level}</span>
                        </div>
                      )}
                    </div>

                    {resume.experience && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Award className="h-5 w-5 text-accent-cyan" />
                          Опыт работы
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{resume.experience}</p>
                      </div>
                    )}

                    {resume.education && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-accent-cyan" />
                          Образование
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{resume.education}</p>
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
                              className="px-3 py-1 bg-dark-surface border border-accent-cyan/30 rounded-lg text-sm text-gray-300"
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
