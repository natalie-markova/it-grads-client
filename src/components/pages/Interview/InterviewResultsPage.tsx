import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  RotateCcw,
  Home,
  Loader2,
  XCircle
} from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { interviewAPI } from '../../../utils/interview.api';
import type { InterviewFeedback } from '../../../types';

export default function InterviewResultsPage() {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useScrollAnimation();

  // Trigger animation visibility check after feedback is loaded
  useEffect(() => {
    if (feedback) {
      // Wait for DOM to update, then check visibility
      setTimeout(() => {
        const items = document.querySelectorAll('.scroll-animate-item');
        items.forEach((item) => {
          item.classList.add('visible');
        });
      }, 50);
    }
  }, [feedback]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/interview/ai/setup');
      return;
    }

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const session = await interviewAPI.getSession(Number(sessionId));

        if (session.status !== 'completed') {
          setError(t('aiInterviewResults.errors.notCompleted'));
          return;
        }

        if (session.totalScore === undefined || session.totalScore === null) {
          setError(t('aiInterviewResults.errors.resultsNotFound'));
          return;
        }

        const feedbackData = {
          totalScore: session.totalScore || 0,
          strengths: session.strengths || [],
          weaknesses: session.weaknesses || [],
          recommendations: session.recommendations || [],
          detailedFeedback: session.detailedFeedback || t('aiInterviewResults.feedbackUnavailable')
        };

        setFeedback(feedbackData);
      } catch (err) {
        console.error('Error loading results:', err);
        setError(t('aiInterviewResults.errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [sessionId, navigate]);

    if (isLoading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
          <span className="text-xl">{t('aiInterviewResults.analyzing')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark-bg min-h-screen py-8">
        <Section className="bg-dark-bg py-0">
          <Card className="max-w-2xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('common.error')}</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/interview/ai/setup')}
              className="btn-primary"
            >
              {t('aiInterviewResults.backToSetup')}
            </button>
          </Card>
        </Section>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
          <span className="text-xl">{t('aiInterviewResults.loadingResults')}</span>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={t('aiInterviewResults.title')}
        subtitle={t('aiInterviewResults.subtitle')}
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        <Card className="max-w-4xl mx-auto mb-8 scroll-animate-item text-center" hover={false}>
          <Award className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">{t('aiInterviewResults.overallScore')}</h3>
          <div className={`text-7xl font-bold mb-2 ${getScoreColor(feedback.totalScore)}`}>
            {feedback.totalScore}
            <span className="text-4xl text-gray-400">/100</span>
          </div>
          <p className="text-gray-300">
            {feedback.totalScore >= 80 && t('aiInterviewResults.scoreExcellent')}
            {feedback.totalScore >= 60 && feedback.totalScore < 80 && t('aiInterviewResults.scoreGood')}
            {feedback.totalScore < 60 && t('aiInterviewResults.scoreNeedsWork')}
          </p>
        </Card>

        <div className="max-w-4xl mx-auto grid gap-6">
          <Card className="scroll-animate-item" hover={false} style={{ transitionDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-accent-cyan" />
              <h3 className="text-xl font-bold text-white">{t('aiInterviewResults.detailedFeedback')}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {feedback.detailedFeedback}
            </p>
          </Card>

          <Card className="scroll-animate-item" hover={false} style={{ transitionDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">{t('aiInterviewResults.strengths')}</h3>
            </div>
            {feedback.strengths && feedback.strengths.length > 0 ? (
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-300"
                  >
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">{t('aiInterviewResults.notSpecified')}</p>
            )}
          </Card>

          <Card className="scroll-animate-item" hover={false} style={{ transitionDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">{t('aiInterviewResults.areasForImprovement')}</h3>
            </div>
            {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {feedback.weaknesses.map((weakness, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-300"
                  >
                    <span className="text-yellow-400 mt-1">!</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">{t('aiInterviewResults.notSpecified')}</p>
            )}
          </Card>

          <Card className="scroll-animate-item" hover={false} style={{ transitionDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-accent-cyan" />
              <h3 className="text-xl font-bold text-white">{t('aiInterviewResults.recommendations')}</h3>
            </div>
            {feedback.recommendations && feedback.recommendations.length > 0 ? (
              <ul className="space-y-2">
                {feedback.recommendations.map((recommendation, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-300"
                  >
                    <span className="text-accent-cyan mt-1">→</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">{t('aiInterviewResults.noRecommendations')}</p>
            )}
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-animate-item" style={{ transitionDelay: '0.5s' }}>
            <button
              onClick={() => navigate('/interview/ai/setup')}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              {t('aiInterviewResults.newInterview')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              {t('aiInterviewResults.toHome')}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}