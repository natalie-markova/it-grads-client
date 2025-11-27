interface FeedbackCardProps {
  score: number;
  feedback: string;
}

export default function FeedbackCard({ score, feedback }: FeedbackCardProps) {
  return (
    <div>
      <h3>Оценка: {score}/100</h3>
      <p>{feedback}</p>
    </div>
  );
}