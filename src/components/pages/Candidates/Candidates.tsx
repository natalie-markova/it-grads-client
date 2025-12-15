import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, Filter, Award, GraduationCap, Globe, Code, MessageSquare, Map, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../ui/Card';
import Section from '../../ui/Section';
import { chatAPI } from '../../../utils/chat.api';
import { $api } from '../../../utils/axios.instance';
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
  const { t } = useTranslation();
  const { user } = useOutletContext<OutletContext>();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChatFor, setCreatingChatFor] = useState<number | null>(null);
  const [viewingResumes, setViewingResumes] = useState<Resume[]>([]);
  const [currentResumeIndex, setCurrentResumeIndex] = useState<number>(0);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

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

  const filteredResumes = useMemo(() => {
    return resumes.filter(resume => {
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

      if (selectedSkills.length > 0) {
        const hasSkills = selectedSkills.some(skill =>
          resume.skillsArray?.includes(skill)
        );
        if (!hasSkills) return false;
      }

      if (selectedLevel && resume.level !== selectedLevel) {
        return false;
      }

      if (selectedLocation && resume.location !== selectedLocation) {
        return false;
      }

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
      toast.error(t('candidates.errors.loginRequired'));
      navigate('/login');
      return;
    }

    if (user.role !== 'employer') {
      toast.error(t('candidates.errors.employerOnly'));
      return;
    }

    setCreatingChatFor(candidateId);
    try {
      const chat = await chatAPI.createChat(candidateId);
      toast.success(t('candidates.success.chatCreated'));
      navigate(`/messenger/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error(t('candidates.errors.chatError'));
    } finally {
      setCreatingChatFor(null);
    }
  };

  const handleViewResumes = async (userId: number) => {
    if (!user || user.role !== 'employer') {
      return;
    }

    try {
      const response = await $api.get(`/resumes/user/${userId}`);
      const userResumes = response.data;

      if (userResumes.length === 0) {
        toast.error(t('candidates.errors.noResumes'));
        return;
      }

      setViewingResumes(userResumes);
      setCurrentResumeIndex(0);
      setShowResumeModal(true);
    } catch (error: any) {
      console.error('Error loading user resumes:', error);
      toast.error(t('candidates.errors.loadError'));
    }
  };

  const handleNextResume = () => {
    if (currentResumeIndex < viewingResumes.length - 1) {
      setCurrentResumeIndex(currentResumeIndex + 1);
    }
  };

  const handlePrevResume = () => {
    if (currentResumeIndex > 0) {
      setCurrentResumeIndex(currentResumeIndex - 1);
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

  const stats = useMemo(() => ({
    total: resumes.length,
    filtered: filteredResumes.length,
    locations: filterOptions.locations.length,
  }), [resumes, filteredResumes, filterOptions]);

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section title="" className="bg-dark-bg py-0">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{t('candidates.title')}</h1>
                <p className="text-gray-300 text-lg">
                  {t('candidates.subtitle')}
                </p>
              </div>
              <button
                onClick={() => navigate('/candidates/map')}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <Map className="h-5 w-5" />
                {t('candidates.mapView')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center py-4">
              <Users className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">{t('candidates.stats.total')}</p>
            </Card>
            <Card className="text-center py-4">
              <Filter className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.filtered}</p>
              <p className="text-sm text-gray-400">{t('candidates.stats.filtered')}</p>
            </Card>
            <Card className="text-center py-4">
              <MapPin className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.locations}</p>
              <p className="text-sm text-gray-400">{t('candidates.stats.cities')}</p>
            </Card>
            <Card className="text-center py-4">
              <Code className="h-8 w-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{filterOptions.skills.length}</p>
              <p className="text-sm text-gray-400">{t('candidates.stats.skills')}</p>
            </Card>
          </div>

          <Card className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('candidates.search.placeholder')}
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
                  {t('candidates.search.filters')}
                  {hasActiveFilters && (
                    <span className="bg-accent-cyan text-dark-bg text-xs px-2 py-0.5 rounded-full">
                      {selectedSkills.length + (selectedLevel ? 1 : 0) + (selectedLocation ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="pt-4 border-t border-dark-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('candidates.filters.level')}</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      >
                        <option value="">{t('candidates.filters.allLevels')}</option>
                        <option value="junior">Junior</option>
                        <option value="middle">Middle</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('candidates.filters.city')}</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      >
                        <option value="">{t('candidates.filters.allCities')}</option>
                        {filterOptions.locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('candidates.filters.salaryFrom')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={t('candidates.filters.minPlaceholder')}
                        value={salaryRange.min || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setSalaryRange(prev => ({ ...prev, min: value ? parseInt(value, 10) : null }));
                        }}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('candidates.filters.salaryTo')}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={t('candidates.filters.maxPlaceholder')}
                        value={salaryRange.max || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setSalaryRange(prev => ({ ...prev, max: value ? parseInt(value, 10) : null }));
                        }}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-card rounded-lg text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('candidates.filters.skills')}</label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-dark-surface rounded-lg custom-scrollbar">
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

                  {selectedSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-400">{t('candidates.filters.selected')}</span>
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

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-accent-cyan hover:text-accent-cyan/80 text-sm"
                    >
                      {t('candidates.filters.clearAll')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {loading ? (
            <Card>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
                <p className="text-gray-300 mt-4">{t('candidates.loading')}</p>
              </div>
            </Card>
          ) : filteredResumes.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">{t('candidates.noResults')}</p>
                <p className="text-gray-500 mt-2">{t('candidates.noResultsHint')}</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-accent-cyan hover:text-accent-cyan/80"
                  >
                    {t('candidates.filters.reset')}
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
                          {t('candidates.experience')}
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap line-clamp-2">{resume.experience}</p>
                      </div>
                    )}

                    {resume.education && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-accent-cyan" />
                          {t('candidates.education')}
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap line-clamp-2">{resume.education}</p>
                      </div>
                    )}

                    {resume.portfolio && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Globe className="h-5 w-5 text-accent-cyan" />
                          {t('candidates.portfolio')}
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
                          {t('candidates.skillsTitle')}
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
                      <button
                        onClick={() => handleViewResumes(resume.user?.id || resume.userId || 0)}
                        className="btn-primary text-sm"
                      >
                        {t('candidates.viewResume')}
                      </button>
                      {user && user.role === 'employer' && (
                        <button
                          onClick={() => handleStartChat(resume.user?.id || resume.userId || 0)}
                          disabled={creatingChatFor === (resume.user?.id || resume.userId)}
                          className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {creatingChatFor === (resume.user?.id || resume.userId) ? t('candidates.creatingChat') : t('candidates.writeMessage')}
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

      {showResumeModal && viewingResumes.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowResumeModal(false)}
        >
          <div 
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {viewingResumes[currentResumeIndex].title}
                  </h2>
                  <p className="text-gray-400">
                    {viewingResumes[currentResumeIndex].user?.username || t('candidates.modal.candidate')}
                  </p>
                </div>
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {viewingResumes.length > 1 && (
                <div className="mb-6 pb-4 border-b border-dark-card">
                  <div className="text-sm text-gray-400">
                    {t('candidates.modal.resumeCount', { current: currentResumeIndex + 1, total: viewingResumes.length })}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {viewingResumes[currentResumeIndex].description && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{t('candidates.modal.description')}</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingResumes[currentResumeIndex].location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-5 w-5 text-accent-cyan" />
                      <span>{viewingResumes[currentResumeIndex].location}</span>
                    </div>
                  )}
                  {viewingResumes[currentResumeIndex].level && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Briefcase className="h-5 w-5 text-accent-cyan" />
                      <span className="capitalize">{viewingResumes[currentResumeIndex].level}</span>
                    </div>
                  )}
                  {viewingResumes[currentResumeIndex].desiredSalary && (
                    <div className="flex items-center gap-2 text-accent-cyan font-semibold">
                      <span>от {viewingResumes[currentResumeIndex].desiredSalary.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>

                {viewingResumes[currentResumeIndex].skillsArray && viewingResumes[currentResumeIndex].skillsArray.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{t('candidates.skillsTitle')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingResumes[currentResumeIndex].skillsArray.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].experience && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent-cyan" />
                      {t('candidates.experience')}
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].experience}
                    </p>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].education && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-accent-cyan" />
                      {t('candidates.education')}
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {viewingResumes[currentResumeIndex].education}
                    </p>
                  </div>
                )}

                {viewingResumes[currentResumeIndex].portfolio && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-accent-cyan" />
                      {t('candidates.portfolio')}
                    </h3>
                    <a
                      href={viewingResumes[currentResumeIndex].portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:text-accent-cyan/80 transition-colors break-all"
                    >
                      {viewingResumes[currentResumeIndex].portfolio}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-dark-card">
                  <div className="flex gap-3 flex-wrap">
                    {viewingResumes.length > 1 && currentResumeIndex > 0 && (
                      <button
                        onClick={handlePrevResume}
                        className="btn-primary flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('candidates.navigation.prevResume')}
                      </button>
                    )}
                    {viewingResumes.length > 1 && currentResumeIndex < viewingResumes.length - 1 && (
                      <button
                        onClick={handleNextResume}
                        className="btn-primary flex items-center gap-2"
                      >
                        {t('candidates.navigation.nextResume')}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    {user?.role === 'employer' && (
                      <button
                        onClick={() => {
                          const userId = viewingResumes[currentResumeIndex].user?.id || viewingResumes[currentResumeIndex].userId;
                          if (userId) {
                            setShowResumeModal(false);
                            handleStartChat(userId);
                          }
                        }}
                        className="btn-primary flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {t('candidates.navigation.sendMessage')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;