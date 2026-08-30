import type { BetSelection } from '../../betslip/types.ts';
import { money } from '../format.ts';

interface Props {
  selection: BetSelection;
  onRemove: (outcomeId: string) => void;
}

/** Строка купона: подписи денормализованы, поэтому событие может уже выбыть из фида. */
export function SelectionRow({ selection, onRemove }: Props) {
  const { issue, isSynchronized, acceptedOdds, currentOdds } = selection;

  return (
    <li className={issue ? `pick pick--${issue}` : 'pick'}>
      <div className="pick__main">
        <span className="pick__outcome">
          {selection.marketLabel} · {selection.outcomeLabel}
        </span>
        <span className="pick__event">{selection.eventLabel}</span>
      </div>

      <div className="pick__right">
        <span className="pick__odds">{money(currentOdds)}</span>
        <button
          type="button"
          className="pick__remove"
          title="Убрать"
          onClick={() => onRemove(selection.outcomeId)}
        >
          ×
        </button>
      </div>

      {issue === 'odds_changed' && (
        <span className="pick__note">коэффициент изменился с {money(acceptedOdds)}</span>
      )}
      {!isSynchronized && (
        <span className="pick__note">исход не синхронизирован — не принимается</span>
      )}
    </li>
  );
}
