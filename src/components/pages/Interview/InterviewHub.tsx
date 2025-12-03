import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bot, ArrowRight, Mic, Calendar } from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const InterviewHub = () => {
  useScrollAnimation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={t('interview.title')}
        subtitle={t('interview.chooseFormat')}
        className="bg-dark-bg py-0"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {/* Practice Quiz */}
          <Card className="scroll-animate-item hover:scale-105 transition-transform h-full">
            <div className="flex flex-col h-full text-center p-6">
              <div className="w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('interview.practiceQuiz.title')}
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                {t('interview.practiceQuiz.description')}
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.practiceQuiz.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.practiceQuiz.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.practiceQuiz.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/practice')}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-auto"
              >
                {t('interview.practiceQuiz.button')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* AI Interview */}
          <Card className="scroll-animate-item hover:scale-105 transition-transform h-full" style={{ transitionDelay: '0.1s' }}>
            <div className="flex flex-col h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('interview.aiInterview.title')}
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                {t('interview.aiInterview.description')}
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/ai/setup')}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-accent-purple mt-auto"
              >
                {t('interview.aiInterview.button')}
                <Bot className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Audio Interview */}
          <Card className="scroll-animate-item hover:scale-105 transition-transform h-full" style={{ transitionDelay: '0.2s' }}>
            <div className="flex flex-col h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('interview.audioInterview.title')}
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                {t('interview.audioInterview.description')}
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/audio')}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 mt-auto"
              >
                {t('interview.audioInterview.button')}
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </Card>

          {/* Interview Tracker */}
          <Card className="scroll-animate-item hover:scale-105 transition-transform h-full" style={{ transitionDelay: '0.3s' }}>
            <div className="flex flex-col h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('interview.tracker.title')}
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                {t('interview.tracker.description')}
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.tracker.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.tracker.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>{t('interview.tracker.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/tracker')}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 mt-auto"
              >
                {t('interview.tracker.button')}
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default InterviewHub;
