/**
 * Причина, по которой выбор нельзя принять прямо сейчас.
 * `odds_changed` снимается подтверждением пользователя, остальные — нет.
 */
export type SelectionIssue = 'odds_changed' | 'suspended' | 'desynchronized' | 'removed';

/**
 * Выбор в купоне ХРАНИТСЯ САМОДОСТАТОЧНО, а не ссылкой в дерево событий.
 * Причина в контракте: событие, не попавшее в очередной diff, выбывает из комнаты,
 * и ссылка на него оборвётся — купон при этом терять ставку не должен.
 */
export interface BetSelection {
  /** Тройка (event, market, outcome) — идентификатор выбора. */
  eventId: string;
  marketId: string;
  outcomeId: string;

  /** Id той же сущности у провайдера: live и прематч живут в разных пространствах. */
  outcomeProviderId: string;
  /** sid для прематча / eid для live — вторая половина пары для сопоставления. */
  eventCounterpartId: string;

  /** Снимок на момент добавления — по нему детектируется изменение коэффициента. */
  acceptedOdds: number;
  /** Текущий коэффициент из фида; расходится с acceptedOdds → issue `odds_changed`. */
  currentOdds: number;

  /** Денормализованные подписи: событие может выбыть, а купон обязан отрисоваться. */
  eventLabel: string;
  marketLabel: string;
  outcomeLabel: string;
  startTime: string;

  /** 0 = без ограничения; приходит в поле max_stake исхода. */
  maxStake: number;
  /** is_sportsbook_synchronized = 0 → исход нельзя принимать. */
  isSynchronized: boolean;
  isActive: boolean;

  issue: SelectionIssue | null;
}

export interface BetSlipState {
  /** Ключ — outcomeId: один исход добавляется только один раз. */
  selections: Record<string, BetSelection>;
  /** Порядок добавления — Record его не хранит. */
  order: string[];
  /** Ставка на одну комбинацию. */
  stake: number;
  /**
   * Отмеченные размерности систем, каждая — от 1 до числа выборов.
   * 1 из N — ординары, N из N — экспресс, всё между — системы.
   * Можно отметить несколько: ставки суммируются.
   */
  sizes: number[];
  acceptAnyOddsChange: boolean;
}
