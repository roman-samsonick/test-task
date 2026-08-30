import { useMemo } from 'react';
import type { BetSelection } from '../../betslip/types.ts';
import { calculateBet } from '../../betslip/systems.ts';
import { money } from '../format.ts';

interface Props {
  selections: BetSelection[];
  sizes: number[];
  stake: number;
}

/** Итог по всем отмеченным системам: одна ставка на каждую комбинацию. */
export function Summary({ selections, sizes, stake }: Props) {
  const result = useMemo(
    () => calculateBet(selections, sizes, stake),
    [selections, sizes, stake],
  );

  const rows: Array<[string, string]> = [
    ['Итоговый коэффициент', money(result.totalOdds)],
    ['Количество ставок', String(result.betCount)],
    ['Сумма ставок', money(result.totalStake)],
  ];

  return (
    <div className="summary">
      {rows.map(([label, value]) => (
        <div className="summary__row" key={label}>
          <span className="summary__label">{label}</span>
          <span className="summary__value">{value}</span>
        </div>
      ))}

      {result.conflicts > 0 && (
        <p className="summary__warning">
          Отброшено комбинаций из-за исходов одного события: {result.conflicts}.
        </p>
      )}
    </div>
  );
}
