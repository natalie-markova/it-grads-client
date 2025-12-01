import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Mail, Phone, Loader2, XCircle, Globe, Users, Factory, MessageSquare } from 'lucide-react';
import { employerAPI } from '../../../utils/employer.api';
import { chatAPI } from '../../../utils/chat.api';
import type { Employer, Vacancy, OutletContext } from '../../../types';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import toast from 'react-hot-toast';

export default function EmployerPublicProfile() {
  const { employerId } = useParams<{ employerId: string }>();
  const navigate = useNavigate();
  const { user } = useOutletContext<OutletContext>();

  const [employer, setEmployer] = useState<Employer | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    if (!employerId) {
      navigate('/');
      return;
    }
    loadEmployerData();
  }, [employerId]);

  const loadEmployerData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [employerData, vacanciesData] = await Promise.all([
        employerAPI.getProfile(Number(employerId)),
        employerAPI.getVacancies(Number(employerId))
      ]);

      setEmployer(employerData);
      setVacancies(vacanciesData.filter(v => v.isActive));
    } catch (err) {
      console.error('Error loading employer:', err);
      setError('Не удалось загрузить профиль работодателя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Войдите в систему, чтобы написать сообщение');
      navigate('/login');
      return;
    }

    if (!employer) return;

    setIsCreatingChat(true);
    try {
      const chat = await chatAPI.createChat(employer.id);
      toast.success('Чат создан!');
      navigate(`/messenger/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
          <span className="text-xl">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section className="bg-dark-bg py-0">
          <Card className="max-w-2xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Ошибка</h2>
            <p className="text-gray-300 mb-6">{error || 'Работодатель не найден'}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              На главную
            </button>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section title="Профиль работодателя" className="bg-dark-bg py-0">
        {/* Company Header */}
        <Card className="max-w-5xl mx-auto mb-8" hover={false}>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-accent-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {employer.avatar ? (
                <img
                  src={employer.avatar}
                  alt={employer.companyName || employer.username}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="h-12 w-12 text-accent-cyan" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                {employer.companyName || employer.username}
              </h1>

              {employer.industry && (
                <div className="flex items-center gap-2 text-accent-cyan mb-3">
                  <Factory className="h-4 w-4" />
                  <span className="text-sm font-medium">{employer.industry}</span>
                </div>
              )}

              {employer.companyDescription && (
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {employer.companyDescription}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-400 text-sm">
                {employer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${employer.email}`} className="text-accent-cyan hover:text-accent-cyan/80">
                      {employer.email}
                    </a>
                  </div>
                )}
                {employer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${employer.phone}`} className="text-accent-cyan hover:text-accent-cyan/80">
                      {employer.phone}
                    </a>
                  </div>
                )}
                {employer.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={employer.companyWebsite.startsWith('http') ? employer.companyWebsite : `https://${employer.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:text-accent-cyan/80"
                    >
                      {employer.companyWebsite}
                    </a>
                  </div>
                )}
                {employer.companyAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{employer.companyAddress}</span>
                  </div>
                )}
                {employer.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{employer.companySize} сотрудников</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message Button */}
            {user && user.role === 'graduate' && user.id !== employer.id && (
              <button
                onClick={handleStartChat}
                disabled={isCreatingChat}
                className="btn-primary flex items-center gap-2 self-start disabled:opacity-50"
              >
                <MessageSquare className="h-4 w-4" />
                {isCreatingChat ? 'Создание...' : 'Написать сообщение'}
              </button>
            )}
          </div>
        </Card>

        {/* Vacancies Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-accent-cyan" />
            Открытые вакансии ({vacancies.length})
          </h2>

          {vacancies.length === 0 ? (
            <Card className="text-center py-12" hover={false}>
              <Briefcase className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Нет активных вакансий
              </h3>
              <p className="text-gray-400">
                У этого работодателя пока нет открытых вакансий
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {vacancies.map((vacancy) => (
                <Card key={vacancy.id} className="hover:border-accent-cyan/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {vacancy.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                        {vacancy.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vacancy.location}
                          </div>
                        )}
                        {vacancy.salary && (
                          <div className="font-medium text-accent-cyan">
                            {vacancy.salary.toLocaleString()} ₽
                          </div>
                        )}
                        {vacancy.level && (
                          <div className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan rounded">
                            {vacancy.level}
                          </div>
                        )}
                        <div className="px-2 py-1 bg-dark-card rounded">
                          {vacancy.employmentType}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {vacancy.description}
                      </p>

                      {vacancy.skills && vacancy.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
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
                  </div>

                  <div className="mt-4 pt-4 border-t border-dark-card flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      Опубликовано: {new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                    <Link 
                      to={`/vacancies/${vacancy.id}`}
                      className="btn-primary text-sm"
                    >
                      Подробнее
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}