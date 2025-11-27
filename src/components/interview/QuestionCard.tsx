interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionCardProps) {
  return (
    <div>
      <p>Вопрос {questionNumber} из {totalQuestions}</p>
      <h2>{question}</h2>
    </div>
  );
}