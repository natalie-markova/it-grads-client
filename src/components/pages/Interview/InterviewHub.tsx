import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, ArrowRight, Mic } from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const InterviewHub = () => {
  useScrollAnimation();
  const navigate = useNavigate();

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title="Подготовка к собеседованию"
        subtitle="Выберите формат подготовки"
        className="bg-dark-bg py-0"
      >
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {/* Practice Quiz */}
          <Card className="scroll-animate-item hover:scale-105 transition-transform h-full">
            <div className="flex flex-col h-full text-center p-6">
              <div className="w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-accent-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Практика с вопросами
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                Отвечайте на готовые вопросы по различным технологиям.
                Моментальная обратная связь и объяснения.
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Быстрая практика</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Готовые вопросы по категориям</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Мгновенные объяснения</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/practice')}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-auto"
              >
                Начать практику
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
                AI интервью
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                Реалистичное собеседование с AI-интервьюером от YandexGPT.
                Адаптивные вопросы и детальная оценка.
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Реалистичное интервью</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Адаптивные вопросы AI</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Детальная оценка и рекомендации</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/ai/setup')}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-cyan to-accent-purple mt-auto"
              >
                Начать AI интервью
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
                Аудио-интервью
              </h3>
              <p className="text-gray-300 mb-6 flex-grow">
                Практикуйтесь с голосовым вводом. Разные типы интервьюеров:
                HR, тимлид, CEO.
              </p>
              <ul className="text-left text-gray-300 mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Голосовой ввод</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Выбор типа интервьюера</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent-cyan mr-2">✓</span>
                  <span>Оценка soft skills</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/interview/audio')}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 mt-auto"
              >
                Начать аудио-интервью
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default InterviewHub;
