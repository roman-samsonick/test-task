import type { BetSelection } from './types.ts';

export interface Combination {
  outcomeIds: string[];
  /** Произведение коэффициентов комбинации. */
  odds: number;
}

export interface BetCalculation {
  /** Необходимое количество ставок — по одной на комбинацию. */
  betCount: number;
  /** Итоговый коэффициент: сумма коэффициентов всех комбинаций выбранных систем. */
  totalOdds: number;
  /** Сумма всех ставок. */
  totalStake: number;
  /** Комбинации, отброшенные из-за исходов одного события. */
  conflicts: number;
}

const round = (value: number, digits = 2): number => Number(value.toFixed(digits));

/**
 * Два исхода одного события несовместимы в одной комбинации: они не могут
 * сыграть одновременно, и такую ставку букмекер не принимает.
 */
const hasConflict = (selections: BetSelection[]): boolean => {
  const events = new Set<string>();
  for (const s of selections) {
    if (events.has(s.eventId)) return true;
    events.add(s.eventId);
  }
  return false;
};

/**
 * Размерности, которые реально проходят: комбинация берёт не больше одного
 * исхода события, поэтому собрать больше, чем событий в купоне, нельзя.
 * Два исхода одного матча оставляют доступными только ординары.
 */
export function availableSizes(selections: BetSelection[]): number[] {
  const events = new Set(selections.map((s) => s.eventId)).size;
  return Array.from({ length: events }, (_, i) => i + 1);
}

/**
 * Сколько неконфликтных комбинаций даёт каждая размерность: индекс — размер.
 * Считается как коэффициенты произведения ∏(1 + gᵢ·x) по группам исходов
 * одного события — из группы берётся не более одного исхода, поэтому свёртка
 * заменяет перебор сочетаний.
 */
export function combinationCounts(selections: BetSelection[]): number[] {
  const groups = new Map<string, number>();
  for (const selection of selections) {
    groups.set(selection.eventId, (groups.get(selection.eventId) ?? 0) + 1);
  }

  let counts = [1];
  for (const group of groups.values()) {
    const next = new Array<number>(counts.length + 1).fill(0);
    for (let k = 0; k < counts.length; k++) {
      next[k]! += counts[k]!;
      next[k + 1]! += counts[k]! * group;
    }
    counts = next;
  }

  return counts;
}

/** Сочетания по k без повторений, порядок не важен. */
export function combinationsOf<T>(items: T[], k: number): T[][] {
  if (k <= 0 || k > items.length) return [];
  if (k === items.length) return [items.slice()];

  const result: T[][] = [];
  const current: T[] = [];

  const walk = (start: number): void => {
    if (current.length === k) {
      result.push(current.slice());
      return;
    }
    // Обрезаем ветку, когда оставшихся элементов уже не хватит.
    for (let i = start; i <= items.length - (k - current.length); i++) {
      current.push(items[i]!);
      walk(i + 1);
      current.pop();
    }
  };

  walk(0);
  return result;
}

const productOdds = (selections: BetSelection[]): number =>
  round(selections.reduce((acc, s) => acc * s.currentOdds, 1));

/** Раскладывает купон на комбинации по всем отмеченным размерностям. */
export function buildCombinations(
  selections: BetSelection[],
  sizes: number[],
): { combinations: Combination[]; conflicts: number } {
  const combinations: Combination[] = [];
  let conflicts = 0;

  for (const size of sizes) {
    if (size < 1 || size > selections.length) continue;

    for (const members of combinationsOf(selections, size)) {
      if (hasConflict(members)) {
        conflicts++;
        continue;
      }
      combinations.push({ outcomeIds: members.map((s) => s.outcomeId), odds: productOdds(members) });
    }
  }

  return { combinations, conflicts };
}

export function calculateBet(
  selections: BetSelection[],
  sizes: number[],
  stake: number,
): BetCalculation {
  const { combinations, conflicts } = buildCombinations(selections, sizes);

  return {
    betCount: combinations.length,
    totalOdds: round(combinations.reduce((sum, c) => sum + c.odds, 0)),
    totalStake: round(stake * combinations.length),
    conflicts,
  };
}
