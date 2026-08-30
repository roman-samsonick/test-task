import { DEFAULT_STAKE } from './reducer.ts';
import { availableSizes } from './systems.ts';
import type { BetSelection, BetSlipState } from './types.ts';

const STORAGE_KEY = 'kralbet:betslip';
/** Растёт при несовместимом изменении формата: старая запись тогда отбрасывается. */
const VERSION = 1;

/**
 * `currentOdds` и `issue` не сохраняются: коэффициент принадлежит фиду, а issue —
 * лишь вывод из его расхождения с `acceptedOdds`. При загрузке currentOdds
 * приравнивается к acceptedOdds, и первый же пакет с другим значением снова
 * поднимет `odds_changed` — пользователь подтверждает изменение, случившееся за
 * время его отсутствия, а не то, что он уже принимал раньше.
 */
type PersistedSelection = Omit<BetSelection, 'currentOdds' | 'issue'>;

/** Доступ падает при заблокированных cookie — купон тогда живёт только в памяти. */
function area(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Запись мог испортить кто угодно: без исхода и коэффициента выбор бесполезен. */
function isSelection(raw: unknown): raw is PersistedSelection {
  const value = raw as PersistedSelection | null;

  return (
    typeof value?.outcomeId === 'string' &&
    value.outcomeId !== '' &&
    typeof value.acceptedOdds === 'number' &&
    value.acceptedOdds > 0
  );
}

export function readSlip(): BetSlipState | null {
  const store = area();
  const raw = store?.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (data?.version !== VERSION || !Array.isArray(data.selections)) throw new Error('чужой формат');

    const selections: Record<string, BetSelection> = {};
    const order: string[] = [];

    // Битый выбор выкидывается поштучно: из-за одного не теряется весь купон.
    for (const item of data.selections) {
      if (!isSelection(item) || selections[item.outcomeId]) continue;
      selections[item.outcomeId] = { ...item, currentOdds: item.acceptedOdds, issue: null };
      order.push(item.outcomeId);
    }

    const maxSize = availableSizes(Object.values(selections)).length;

    return {
      selections,
      order,
      // Ноль — это состояние пустого поля ввода, испорченному значению он не замена.
      stake: typeof data.stake === 'number' && data.stake > 0 ? data.stake : DEFAULT_STAKE,
      // Предел задают события, а не выборы: исходы одного матча в комбинацию не
      // ставятся. Пустой набор — легальный выбор пользователя, не достраиваем.
      sizes: Array.isArray(data.sizes) ? data.sizes.filter((s: number) => s >= 1 && s <= maxSize) : [],
      acceptAnyOddsChange: data.acceptAnyOddsChange === true,
    };
  } catch {
    // Мусор в ключе иначе воскресал бы при каждой загрузке.
    store?.removeItem(STORAGE_KEY);
    return null;
  }
}

let lastWritten: string | null = null;

export function writeSlip(state: BetSlipState): void {
  const store = area();
  if (!store) return;

  const raw = JSON.stringify({
    version: VERSION,
    // Порядок массива — порядок добавления, отдельное поле `order` не нужно.
    selections: state.order.flatMap((id) => {
      const selection = state.selections[id];
      if (!selection) return [];
      const { currentOdds: _currentOdds, issue: _issue, ...persisted } = selection;
      return [persisted];
    }),
    stake: state.stake,
    sizes: state.sizes,
    acceptAnyOddsChange: state.acceptAnyOddsChange,
  });

  // Волатильные поля не сохраняются, поэтому обновление коэффициентов payload не
  // меняет: без отсечки каждый пакет фида дёргал бы синхронную запись.
  if (raw === lastWritten) return;

  try {
    store.setItem(STORAGE_KEY, raw);
    lastWritten = raw;
  } catch {
    // Квота кончилась — купон остаётся в памяти вкладки.
  }
}
