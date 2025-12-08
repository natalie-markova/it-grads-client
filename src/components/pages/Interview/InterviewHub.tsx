import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Bot, ArrowRight, Mic, Calendar } from 'lucide-react';
import Section from '../../ui/Section';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

// 3D Cube Card компонент
const CubeCard = ({
  children,
  gradient,
  delay = '0s',
  className = ''
}: {
  children: React.ReactNode;
  gradient: string;
  delay?: string;
  className?: string;
}) => (
  <div
    className={`scroll-animate-item group perspective-1000 h-full ${className}`}
    style={{ transitionDelay: delay }}
  >
    <div className="relative transform-style-3d transition-all duration-500 group-hover:rotate-y-3 group-hover:-rotate-x-3 h-full">
      {/* Основная грань куба */}
      <div className={`
        relative z-10 rounded-2xl p-6 h-full
        bg-gradient-to-br ${gradient}
        shadow-[0_20px_50px_rgba(0,0,0,0.4)]
        border border-white/10
        backdrop-blur-sm
        transform transition-all duration-500
        group-hover:translate-y-[-8px]
        group-hover:shadow-[0_35px_60px_rgba(0,0,0,0.5)]
      `}>
        {/* Блик сверху */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* Внутренний свет */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
        {children}
      </div>

      {/* Боковая грань (правая) */}
      <div className={`
        absolute top-2 -right-3 w-3 h-[calc(100%-16px)] rounded-r-lg
        bg-gradient-to-b ${gradient} opacity-60
        transform skew-y-[45deg] origin-left
        transition-all duration-500
        group-hover:w-4 group-hover:-right-4
      `} />

      {/* Нижняя грань */}
      <div className={`
        absolute -bottom-3 left-2 w-[calc(100%-16px)] h-3 rounded-b-lg
        bg-gradient-to-r ${gradient} opacity-40
        transform skew-x-[45deg] origin-top
        transition-all duration-500
        group-hover:h-4 group-hover:-bottom-4
      `} />
    </div>
  </div>
);

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 auto-rows-fr">
          {/* Practice Quiz */}
          <CubeCard gradient="from-slate-800 via-slate-700 to-slate-800">
            <div className="flex flex-col h-full text-center relative z-10">
              <div className="w-16 h-16 bg-accent-cyan/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-cyan/20">
                <MessageSquare className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('interview.practiceQuiz.title')}
              </h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                {t('interview.practiceQuiz.description')}
              </p>
              <ul className="text-left text-gray-300 text-sm mb-4 space-y-1.5">
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
                className="w-full py-2.5 rounded-xl bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan font-medium flex items-center justify-center gap-2 transition-all border border-accent-cyan/30"
              >
                {t('interview.practiceQuiz.button')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </CubeCard>

          {/* AI Interview */}
          <CubeCard gradient="from-cyan-900 via-purple-900 to-indigo-900" delay="0.1s">
            <div className="flex flex-col h-full text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('interview.aiInterview.title')}
              </h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                {t('interview.aiInterview.description')}
              </p>
              <ul className="text-left text-gray-300 text-sm mb-4 space-y-1.5">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">✓</span>
                  <span>{t('interview.aiInterview.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/ai/setup')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg shadow-purple-500/20"
              >
                {t('interview.aiInterview.button')}
                <Bot className="w-4 h-4" />
              </button>
            </div>
          </CubeCard>

          {/* Audio Interview */}
          <CubeCard gradient="from-orange-900 via-red-900 to-rose-900" delay="0.2s">
            <div className="flex flex-col h-full text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('interview.audioInterview.title')}
              </h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                {t('interview.audioInterview.description')}
              </p>
              <ul className="text-left text-gray-300 text-sm mb-4 space-y-1.5">
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">✓</span>
                  <span>{t('interview.audioInterview.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/audio')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg shadow-orange-500/20"
              >
                {t('interview.audioInterview.button')}
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </CubeCard>

          {/* Interview Tracker */}
          <CubeCard gradient="from-green-900 via-emerald-900 to-teal-900" delay="0.3s">
            <div className="flex flex-col h-full text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t('interview.tracker.title')}
              </h3>
              <p className="text-gray-300 text-sm mb-4 flex-grow">
                {t('interview.tracker.description')}
              </p>
              <ul className="text-left text-gray-300 text-sm mb-4 space-y-1.5">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{t('interview.tracker.feature1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{t('interview.tracker.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{t('interview.tracker.feature3')}</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/tracker')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg shadow-green-500/20"
              >
                {t('interview.tracker.button')}
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </CubeCard>
        </div>
      </Section>
    </div>
  );
};

export default InterviewHub;
