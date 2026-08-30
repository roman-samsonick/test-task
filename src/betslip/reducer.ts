import type { BetSelection, BetSlipState } from './types.ts';
import { availableSizes } from './systems.ts';

/**
 * Чистые переходы состояния купона: ни хранилища, ни подписок, ни Immer.
 * Каждая функция возвращает ту же ссылку, если ничего не изменилось, —
 * на этом стоит отсечка лишних рендеров и записей в localStorage.
 */

export const DEFAULT_STAKE = 10;

export const emptySlip = (): BetSlipState => ({
  selections: {},
  order: [],
  stake: DEFAULT_STAKE,
  sizes: [],
  acceptAnyOddsChange: false,
});

/**
 * Состав купона изменился — непроходимые размерности снимаются: исходы одного
 * события в одну комбинацию не ставятся, поэтому предел задают события, а не
 * число выборов. Если не осталось ни одной, берём максимальную доступную.
 */
function withNormalizedSizes(state: BetSlipState): BetSlipState {
  const limit = availableSizes(listSelections(state)).length;
  const sizes = state.sizes.filter((size) => size >= 1 && size <= limit).sort((a, b) => a - b);

  return { ...state, sizes: sizes.length || !limit ? sizes : [limit] };
}

export function removeSelection(state: BetSlipState, outcomeId: string): BetSlipState {
  if (!state.selections[outcomeId]) return state;

  const selections = { ...state.selections };
  delete selections[outcomeId];

  return withNormalizedSizes({
    ...state,
    selections,
    order: state.order.filter((id) => id !== outcomeId),
  });
}

/** Повторный клик по тому же исходу снимает выбор. */
export function toggleSelection(state: BetSlipState, selection: BetSelection): BetSlipState {
  const { outcomeId } = selection;
  if (state.selections[outcomeId]) return removeSelection(state, outcomeId);

  return withNormalizedSizes({
    ...state,
    selections: { ...state.selections, [outcomeId]: selection },
    order: [...state.order, outcomeId],
  });
}

/** Чекбокс размерности: включает или выключает систему `size из N`. */
export function toggleSize(state: BetSlipState, size: number): BetSlipState {
  const sizes = state.sizes.includes(size)
    ? state.sizes.filter((s) => s !== size)
    : [...state.sizes, size].sort((a, b) => a - b);

  return { ...state, sizes };
}

/** Коэффициенты приезжают из фида; расхождение с acceptedOdds помечается issue. */
export function refreshOdds(state: BetSlipState, odds: Record<string, number>): BetSlipState {
  let selections: Record<string, BetSelection> | null = null;

  for (const [outcomeId, value] of Object.entries(odds)) {
    const selection = state.selections[outcomeId];
    if (!selection || selection.currentOdds === value) continue;

    selections ??= { ...state.selections };
    selections[outcomeId] = {
      ...selection,
      currentOdds: value,
      issue:
        !state.acceptAnyOddsChange && value !== selection.acceptedOdds ? 'odds_changed' : selection.issue,
    };
  }

  return selections ? { ...state, selections } : state;
}

export function acceptOddsChange(state: BetSlipState): BetSlipState {
  let selections: Record<string, BetSelection> | null = null;

  for (const [outcomeId, selection] of Object.entries(state.selections)) {
    if (selection.issue !== 'odds_changed') continue;

    selections ??= { ...state.selections };
    selections[outcomeId] = { ...selection, acceptedOdds: selection.currentOdds, issue: null };
  }

  return selections ? { ...state, selections } : state;
}

export function setStake(state: BetSlipState, stake: number): BetSlipState {
  const next = Number.isFinite(stake) && stake > 0 ? stake : 0;
  return next === state.stake ? state : { ...state, stake: next };
}

/** Выборы в порядке добавления — Record его не хранит. */
export function listSelections(state: BetSlipState): BetSelection[] {
  return state.order.map((id) => state.selections[id]!).filter(Boolean);
}
