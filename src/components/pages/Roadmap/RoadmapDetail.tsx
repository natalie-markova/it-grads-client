import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  BookOpen,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Save,
  RotateCcw,
  Calendar,
  Trophy
} from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';
import type { OutletContext } from '../../../types';
import { useTranslation } from 'react-i18next';

interface LearningStep {
  title: string;
  description: string;
  topics: string[];
  resources?: string[];
}

interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'book' | 'documentation';
}

interface Roadmap {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  icon?: string;
  color?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMonths?: number;
  prerequisites?: string[];
  learningPath: LearningStep[];
  resources?: Resource[];
  relatedRoadmaps?: string[];
  popularityScore?: number;
}

interface ProgressData {
  completedSteps: number[];
  progress: number;
  startedAt: string | null;
  lastActivityAt: string | null;
  completedAt: string | null;
}

const RoadmapDetail = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [savedProgress, setSavedProgress] = useState<ProgressData | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { user } = useOutletContext<OutletContext>();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (slug) {
      fetchRoadmap(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (slug && isAuthenticated) {
      fetchProgress(slug);
    }
  }, [slug, isAuthenticated]);

  const fetchRoadmap = async (slug: string) => {
    try {
      setLoading(true);
      const response = await $api.get(`/roadmaps/${slug}`);
      setRoadmap(response.data);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error(t('roadmap.errorLoading'));
      navigate('/roadmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (slug: string) => {
    try {
      const response = await $api.get(`/roadmaps/${slug}/progress`);
      const data = response.data;
      setSavedProgress(data);
      if (data.completedSteps && data.completedSteps.length > 0) {
        setCompletedSteps(new Set(data.completedSteps));
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const toggleStepCompletion = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
    setHasUnsavedChanges(true);
  };

  const saveProgress = async () => {
    if (!slug || !isAuthenticated) {
      toast.error(t('roadmap.loginToSave'));
      return;
    }

    setSaving(true);
    try {
      const response = await $api.post(`/roadmaps/${slug}/progress`, {
        completedSteps: Array.from(completedSteps)
      });
      setSavedProgress(response.data.progress);
      setHasUnsavedChanges(false);
      toast.success(t('roadmap.progressSaved'));
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error(t('roadmap.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const resetProgress = async () => {
    if (!slug || !isAuthenticated) return;

    if (!confirm(t('roadmap.resetConfirm'))) return;

    try {
      await $api.delete(`/roadmaps/${slug}/progress`);
      setCompletedSteps(new Set());
      setSavedProgress(null);
      setHasUnsavedChanges(false);
      toast.success(t('roadmap.progressReset'));
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error(t('roadmap.errorResetting'));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const difficultyLabels = {
    beginner: t('roadmap.beginner'),
    intermediate: t('roadmap.intermediate'),
    advanced: t('roadmap.advanced')
  };

  const resourceTypeLabels = {
    article: t('roadmap.article'),
    video: t('roadmap.video'),
    course: t('roadmap.course'),
    book: t('roadmap.book'),
    documentation: t('roadmap.documentation')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
          <p className="text-gray-400 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return null;
  }

  const progress = (completedSteps.size / roadmap.learningPath.length) * 100;
  const isCompleted = progress === 100;

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div
        className="py-16 text-white"
        style={{
          background: `linear-gradient(135deg, ${roadmap.color || '#3B82F6'} 0%, ${roadmap.color || '#3B82F6'}dd 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/roadmap')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('roadmap.backToList')}
          </button>

          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl bg-white/10 backdrop-blur-sm"
            >
              {roadmap.icon || '📚'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{roadmap.title}</h1>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border bg-white/10 backdrop-blur-sm border-white/20 text-white`}
                >
                  {difficultyLabels[roadmap.difficulty]}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {t('roadmap.completed')}
                  </span>
                )}
              </div>

              <p className="text-lg opacity-90 mb-4 max-w-3xl">{roadmap.description}</p>

              <div className="flex items-center gap-6 text-sm">
                {roadmap.estimatedMonths && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{t('roadmap.approximately')} {roadmap.estimatedMonths} {t('roadmap.months')}</span>
                  </div>
                )}
                {roadmap.popularityScore !== undefined && roadmap.popularityScore > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>{t('roadmap.popularity')}: {roadmap.popularityScore}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prerequisites */}
            {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-surface">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">{t('roadmap.prerequisites')}</h2>
                </div>
                <ul className="space-y-2">
                  {roadmap.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Path */}
            <div className="bg-dark-card rounded-xl p-6 border border-dark-surface">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-accent-cyan" />
                  <h2 className="text-2xl font-bold text-white">{t('roadmap.learningPath')}</h2>
                </div>
                <div className="text-sm text-gray-400">
                  {completedSteps.size} / {roadmap.learningPath.length} {t('roadmap.completedSteps')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-dark-surface rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-accent-cyan'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-400">{Math.round(progress)}% {t('roadmap.completedSteps')}</p>
                  {hasUnsavedChanges && (
                    <p className="text-sm text-yellow-400">{t('roadmap.unsavedChanges')}</p>
                  )}
                </div>
              </div>

              {/* Save/Reset Buttons */}
              {isAuthenticated && (
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={saveProgress}
                    disabled={saving || !hasUnsavedChanges}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      hasUnsavedChanges
                        ? 'bg-accent-cyan text-dark-bg hover:bg-accent-cyan/90'
                        : 'bg-dark-surface text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('roadmap.saving') : t('roadmap.saveProgress')}
                  </button>
                  {completedSteps.size > 0 && (
                    <button
                      onClick={resetProgress}
                      className="flex items-center gap-2 px-4 py-2 bg-dark-surface text-gray-400 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t('roadmap.reset')}
                    </button>
                  )}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    {t('roadmap.loginToSave')}
                  </p>
                </div>
              )}

              {/* Steps */}
              <div className="space-y-4">
                {roadmap.learningPath.map((step, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${
                      completedSteps.has(index)
                        ? 'border-accent-cyan bg-accent-cyan/5'
                        : 'border-dark-surface bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStepCompletion(index)}
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          completedSteps.has(index)
                            ? 'border-accent-cyan bg-accent-cyan'
                            : 'border-gray-600 hover:border-accent-cyan'
                        }`}
                      >
                        {completedSteps.has(index) && (
                          <CheckCircle className="w-4 h-4 text-dark-bg" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {index + 1}. {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">{step.description}</p>

                        {step.topics && step.topics.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-300 mb-2">{t('roadmap.topics')}:</p>
                            <div className="flex flex-wrap gap-2">
                              {step.topics.map((topic, topicIndex) => (
                                <span
                                  key={topicIndex}
                                  className="px-3 py-1 bg-dark-bg rounded-full text-xs text-gray-300 border border-dark-card"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Stats */}
            {isAuthenticated && savedProgress && (savedProgress.startedAt || savedProgress.completedAt) && (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-surface">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent-cyan" />
                  {t('roadmap.yourProgress')}
                </h3>
                <div className="space-y-4">
                  {savedProgress.startedAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">{t('roadmap.started')}</p>
                        <p className="text-white">{formatDate(savedProgress.startedAt)}</p>
                      </div>
                    </div>
                  )}
                  {savedProgress.lastActivityAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">{t('roadmap.lastActivity')}</p>
                        <p className="text-white">{formatDate(savedProgress.lastActivityAt)}</p>
                      </div>
                    </div>
                  )}
                  {savedProgress.completedAt && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm text-green-400">{t('roadmap.completed')}</p>
                        <p className="text-white">{formatDate(savedProgress.completedAt)}</p>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-dark-surface">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{t('roadmap.progress')}</span>
                      <span className="text-white font-bold">{savedProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-surface rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          savedProgress.progress === 100 ? 'bg-green-500' : 'bg-accent-cyan'
                        }`}
                        style={{ width: `${savedProgress.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            {roadmap.resources && roadmap.resources.length > 0 && (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-surface">
                <h3 className="text-xl font-bold text-white mb-4">{t('roadmap.usefulResources')}</h3>
                <div className="space-y-3">
                  {roadmap.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-dark-surface rounded-lg hover:bg-dark-bg transition-colors border border-dark-card hover:border-accent-cyan"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm mb-1">{resource.title}</p>
                          <p className="text-xs text-gray-400">
                            {resourceTypeLabels[resource.type]}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-accent-cyan flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Roadmaps */}
            {roadmap.relatedRoadmaps && roadmap.relatedRoadmaps.length > 0 && (
              <div className="bg-dark-card rounded-xl p-6 border border-dark-surface">
                <h3 className="text-xl font-bold text-white mb-4">{t('roadmap.relatedRoadmaps')}</h3>
                <div className="space-y-2">
                  {roadmap.relatedRoadmaps.map((related, index) => (
                    <Link
                      key={index}
                      to={`/roadmap/${related}`}
                      className="block p-3 bg-dark-surface rounded-lg hover:bg-dark-bg transition-colors text-accent-cyan hover:text-accent-green text-sm border border-dark-card hover:border-accent-cyan"
                    >
                      {related}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;