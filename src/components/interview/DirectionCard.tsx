import type { Direction } from '../../types';

interface DirectionCardProps {
  direction: Direction;
  selected: boolean;
  onClick: () => void;
}

export default function DirectionCard({ direction, selected, onClick }: DirectionCardProps) {
  return (
    <button onClick={onClick}>
      <h3>{direction}</h3>
      {selected && <span>Выбрано</span>}
    </button>
  );
}