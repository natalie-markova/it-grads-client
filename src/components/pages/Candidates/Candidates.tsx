import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import Card from '../../ui/Card';
import Section from '../../ui/Section';

interface Resume {
  id: number;
  title: string;
  description: string;
  skillsArray: string[];
  location: string;
  level: string;
  desiredSalary: number;
  user?: {
    username: string;
  };
}

const Candidates = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

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
                      <p className="text-gray-300">{resume.description}</p>
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

                    {resume.skillsArray && resume.skillsArray.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resume.skillsArray.slice(0, 8).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-dark-surface border border-accent-cyan/30 rounded-lg text-sm text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-dark-card">
                      <button className="btn-primary text-sm">
                        Посмотреть резюме
                      </button>
                      <button className="btn-secondary text-sm">
                        Связаться
                      </button>
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
