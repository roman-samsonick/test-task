import type { BetSelection, BetSlipState } from './types.ts';
import * as slip from './reducer.ts';
import { readSlip, writeSlip } from './storage.ts';

/**
 * Наружу купон выглядит как внешний стор: снимок, подписка, действия.
 * Ровно та форма, которую ждёт `useSyncExternalStore`, если появится React.
 */
export interface BetSlipStore {
  getState(): BetSlipState;
  /** Выборы в порядке добавления. */
  getSelections(): BetSelection[];
  /** Возвращает функцию отписки. */
  subscribe(listener: (state: BetSlipState) => void): () => void;
  toggleSelection(selection: BetSelection): void;
  removeSelection(outcomeId: string): void;
  toggleSize(size: number): void;
  refreshOdds(odds: Record<string, number>): void;
  acceptOddsChange(): void;
  setStake(stake: number): void;
  clear(): void;
}

/**
 * Купон живёт в localStorage, а не в redux-сторе: пакеты фида пересоздают
 * состояние событий на каждом diff, а ставка пользователя обязана пережить
 * и перезагрузку вкладки, и выпадение события из комнаты.
 */
export function createBetSlipStore(): BetSlipStore {
  let state = readSlip() ?? slip.emptySlip();
  const listeners = new Set<(state: BetSlipState) => void>();

  function commit(next: BetSlipState): void {
    // Переходы возвращают ту же ссылку, когда менять нечего.
    if (next === state) return;

    state = next;
    writeSlip(state);
    for (const listener of listeners) listener(state);
  }

  return {
    getState: () => state,
    getSelections: () => slip.listSelections(state),

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    toggleSelection: (selection) => commit(slip.toggleSelection(state, selection)),
    removeSelection: (outcomeId) => commit(slip.removeSelection(state, outcomeId)),
    toggleSize: (size) => commit(slip.toggleSize(state, size)),
    refreshOdds: (odds) => commit(slip.refreshOdds(state, odds)),
    acceptOddsChange: () => commit(slip.acceptOddsChange(state)),
    setStake: (stake) => commit(slip.setStake(state, stake)),
    clear: () => commit(slip.emptySlip()),
  };
}

let store: BetSlipStore | null = null;

/**
 * Купон один на приложение — все вызовы получают тот же экземпляр.
 * Стор создаётся лениво: localStorage читается при первом обращении,
 * а не на этапе разбора модулей. Для тестов берите `createBetSlipStore()`.
 */
export function useBetSlip(): BetSlipStore {
  return (store ??= createBetSlipStore());
}
