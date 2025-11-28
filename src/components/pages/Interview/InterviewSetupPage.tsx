import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bot, Sparkles } from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import DirectionCard from '../../interview/DirectionCard';
import TechnologySelector from '../../interview/TechnologySelector';
import LevelSelector from '../../interview/LevelSelector';
import { interviewAPI } from '../../../utils/interview.api';
import { setSession } from '../../../store/slices/interviewSlice';
import type { Direction, Level } from '../../../types';

export default function InterviewSetupPage() {
  useScrollAnimation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [direction, setDirection] = useState<Direction | null>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [level, setLevel] = useState<Level>('junior');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTechnologies = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'CSS', 'HTML'
  ];

  const handleTechnologyToggle = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const handleSubmit = async () => {
    if (!direction) {
      setError('Выберите направление');
      return;
    }
    if (selectedTechnologies.length === 0) {
      setError('Выберите хотя бы одну технологию');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { session } = await interviewAPI.createSession({
        direction,
        technologies: selectedTechnologies,
        level,
        questionsCount
      });

      dispatch(setSession(session));
      navigate(`/interview/ai/${session.id}`);
    } catch (err) {
      setError('Не удалось создать сессию');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title="Настройка AI интервью"
        subtitle="Настройте параметры собеседования с искусственным интеллектом"
        className="bg-dark-bg py-0"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Direction Selection */}
          <Card className="scroll-animate-item">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              Выберите направление
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <DirectionCard
                direction="frontend"
                selected={direction === 'frontend'}
                onClick={() => setDirection('frontend')}
              />
              <DirectionCard
                direction="backend"
                selected={direction === 'backend'}
                onClick={() => setDirection('backend')}
              />
              <DirectionCard
                direction="fullstack"
                selected={direction === 'fullstack'}
                onClick={() => setDirection('fullstack')}
              />
            </div>
          </Card>

          {/* Technology Selection */}
          <Card className="scroll-animate-item" style={{ transitionDelay: '0.1s' }}>
            <TechnologySelector
              availableTechnologies={availableTechnologies}
              selectedTechnologies={selectedTechnologies}
              onToggle={handleTechnologyToggle}
            />
          </Card>

          {/* Level Selection */}
          <Card className="scroll-animate-item" style={{ transitionDelay: '0.2s' }}>
            <LevelSelector level={level} onChange={setLevel} />
          </Card>

          {/* Questions Count */}
          <Card className="scroll-animate-item" style={{ transitionDelay: '0.3s' }}>
            <h3 className="text-xl font-bold text-white mb-4">Количество вопросов</h3>
            <div className="flex items-center gap-4">
              <input
                type="range"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value))}
                min={5}
                max={20}
                className="flex-1 h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-accent-cyan"
              />
              <span className="text-2xl font-bold text-accent-cyan min-w-[3rem] text-center">
                {questionsCount}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Рекомендуется: 10-15 вопросов для полноценного интервью
            </p>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg scroll-animate-item">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center scroll-animate-item" style={{ transitionDelay: '0.4s' }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg bg-gradient-to-r from-accent-cyan to-accent-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Создание сессии...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Начать AI интервью
                </>
              )}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}