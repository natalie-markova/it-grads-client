import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import DirectionCard from '../../interview/DirectionCard';
import TechnologySelector from '../../interview/TechnologySelector';
import LevelSelector from '../../interview/LevelSelector';
import { interviewAPI } from '../../../utils/interview.api';
import { setSession } from '../../../store/slices/interviewSlice';
import type { Direction, Level } from '../../../types';

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [direction, setDirection] = useState<Direction | null>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [level, setLevel] = useState<Level>('junior');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Список доступных технологий
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
    <div>
      <h1>Настройка интервью</h1>

      <section>
        <h2>Выберите направление</h2>
        <div>
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
      </section>

      <section>
        <TechnologySelector
          availableTechnologies={availableTechnologies}
          selectedTechnologies={selectedTechnologies}
          onToggle={handleTechnologyToggle}
        />
      </section>

      <section>
        <LevelSelector level={level} onChange={setLevel} />
      </section>

      <section>
        <label>
          Количество вопросов:
          <input
            style={{color: 'black'}}
            type="number"
            value={questionsCount}
            onChange={(e) => setQuestionsCount(Number(e.target.value))}
            min={5}
            max={20}
          />
        </label>
      </section>

      {error && <p>{error}</p>}

      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Создание...' : 'Начать интервью'}
      </button>
    </div>
  );
}