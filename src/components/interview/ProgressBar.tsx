interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div>
      <p>Прогресс: {current} / {total}</p>
      <div style={{ width: '100%', height: '20px', background: '#eee' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: '#4CAF50' }} />
      </div>
    </div>
  );
}