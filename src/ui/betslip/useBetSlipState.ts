import { useMemo, useSyncExternalStore } from 'react';
import { useBetSlip } from '../../betslip/useBetSlip.ts';
import type { BetSlipStore } from '../../betslip/useBetSlip.ts';
import type { BetSelection, BetSlipState } from '../../betslip/types.ts';

export interface BetSlipView {
  state: BetSlipState;
  /** Выборы в порядке добавления. */
  selections: BetSelection[];
  /** Действия купона: те же, что у стора. */
  store: BetSlipStore;
}

/**
 * Мост между React и купоном, который живёт вне React (localStorage + подписки).
 * Переходы иммутабельны, поэтому ссылки на состояние достаточно для сравнения
 * снапшотов — `useSyncExternalStore` сам решит, нужен ли рендер.
 */
export function useBetSlipState(): BetSlipView {
  const store = useBetSlip();
  const state = useSyncExternalStore(store.subscribe, store.getState);

  // getSelections собирает новый массив на каждый вызов — снапшотом он быть не
  // может, иначе useSyncExternalStore зациклится на несовпадении ссылок.
  const selections = useMemo(() => store.getSelections(), [store, state]);

  return { state, selections, store };
}
