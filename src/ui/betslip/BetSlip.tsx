import { useBetSlipState } from './useBetSlipState.ts';
import { SelectionRow } from './SelectionRow.tsx';
import { SizePicker } from './SizePicker.tsx';
import { Summary } from './Summary.tsx';

/**
 * Купон целиком: состав, системы, ставка и итог.
 * Состояние берётся из стора купона (localStorage), пропсов у компонента нет —
 * тот же купон видят все места, где он смонтирован.
 */
export function BetSlip() {
  const { state, selections, store } = useBetSlipState();
  const hasOddsChange = selections.some((s) => s.issue === 'odds_changed');

  return (
    <section className="slip">
      <div className="slip__head">
        <h2>Купон · {selections.length}</h2>
        <button
          type="button"
          className="slip__clear"
          disabled={!selections.length}
          onClick={store.clear}
        >
          Очистить
        </button>
      </div>

      {!selections.length ? (
        <p className="slip__empty">Выберите исход в любом из событий.</p>
      ) : (
        <>
          <ul className="slip__list">
            {selections.map((selection) => (
              <SelectionRow
                key={selection.outcomeId}
                selection={selection}
                onRemove={store.removeSelection}
              />
            ))}
          </ul>

          <SizePicker selections={selections} sizes={state.sizes} onToggle={store.toggleSize} />

          <label className="stake">
            <span>Ставка</span>
            <input
              type="number"
              min="1"
              step="1"
              // Ноль — это стёртое поле: показываем его пустым, иначе ноль
              // приходится стирать перед каждым вводом.
              value={state.stake || ''}
              onChange={(event) => store.setStake(Number(event.target.value))}
            />
          </label>

          {hasOddsChange && (
            <button type="button" className="accept" onClick={store.acceptOddsChange}>
              Принять новые коэффициенты
            </button>
          )}

          <Summary selections={selections} sizes={state.sizes} stake={state.stake} />
        </>
      )}
    </section>
  );
}
