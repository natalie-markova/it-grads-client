import { useState } from 'react';

interface AnswerFormProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export default function AnswerForm({ onSubmit, isLoading }: AnswerFormProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Введите ваш ответ..."
        rows={6}
      />
      <button onClick={handleSubmit} disabled={isLoading || !answer.trim()}>
        {isLoading ? 'Отправка...' : 'Отправить ответ'}
      </button>
    </div>
  );
}