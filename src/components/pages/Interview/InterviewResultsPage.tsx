import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../../utils/interview.api';
import type { InterviewFeedback } from '../../../types';

export default function InterviewResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/interview/setup');
      return;
    }

    const loadResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await interviewAPI.completeSession(Number(sessionId));
        setFeedback(results);
      } catch (err) {
        console.error('Ошибка при загрузке результатов:', err);
        setError('Не удалось загрузить результаты интервью');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [sessionId, navigate]);

  if (isLoading) {
    return <div>Загрузка результатов...</div>;
  }

  if (error) {
    return (
      <div>
        <h1>Ошибка</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/interview/setup')}>
          Вернуться к настройке
        </button>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div>
      <h1>Результаты интервью</h1>

      <section>
        <h2>Общая оценка</h2>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff' }}>
          {feedback.totalScore}/100
        </div>
      </section>

      <section>
        <h2>Детальная обратная связь</h2>
        <p>{feedback.detailedFeedback}</p>
      </section>

      <section>
        <h2>Сильные стороны</h2>
        {feedback.strengths && feedback.strengths.length > 0 ? (
          <ul>
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        ) : (
          <p>Не указано</p>
        )}
      </section>

      <section>
        <h2>Области для улучшения</h2>
        {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
          <ul>
            {feedback.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        ) : (
          <p>Не указано</p>
        )}
      </section>

      <section>
        <h2>Рекомендации</h2>
        {feedback.recommendations && feedback.recommendations.length > 0 ? (
          <ul>
            {feedback.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        ) : (
          <p>Нет рекомендаций</p>
        )}
      </section>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => navigate('/interview/setup')}>
          Пройти новое интервью
        </button>
        <button 
          onClick={() => navigate('/interview/history')}
          style={{ marginLeft: '10px' }}
        >
          История интервью
        </button>
      </div>
    </div>
  );
}