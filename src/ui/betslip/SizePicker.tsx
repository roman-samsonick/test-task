import { useMemo } from 'react';
import type { BetSelection } from '../../betslip/types.ts';
import { availableSizes, combinationCounts } from '../../betslip/systems.ts';

interface Props {
  selections: BetSelection[];
  /** Отмеченные размерности: ставки по ним суммируются. */
  sizes: number[];
  onToggle: (size: number) => void;
}

/**
 * Чекбокс на каждую проходимую размерность: от «1 из N» (ординары) до экспресса.
 * Размерности, все комбинации которых конфликтны, в списке не появляются —
 * рядом с каждой стоит число комбинаций уже за вычетом отброшенных.
 */
export function SizePicker({ selections, sizes, onToggle }: Props) {
  const counts = useMemo(() => combinationCounts(selections), [selections]);
  const options = useMemo(() => availableSizes(selections), [selections]);

  return (
    <div className="sizes">
      <span className="sizes__label">Системы</span>

      {options.map((size) => (
        <label className="size" key={size}>
          <input
            type="checkbox"
            checked={sizes.includes(size)}
            onChange={() => onToggle(size)}
          />
          <span className="size__name">
            {size} из {selections.length}
          </span>
          <span className="size__count">{counts[size] ?? 0}</span>
        </label>
      ))}
    </div>
  );
}
