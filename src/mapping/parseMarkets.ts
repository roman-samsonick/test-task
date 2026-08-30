import { EScopeVariants } from '../types/sliceTypes.ts';
import type { IMarket, IOutcome, IScope } from '../types/sliceTypes.ts';

/** Порядок вывода по умолчанию, когда поле пустое (см. контракт, п. 3.4). */
const DEFAULT_ORDER = 10_000;

/** Точность коэффициента: odd_precision в фиде не приходит, берём обычные 2 знака. */
const ODD_PRECISION = 2;

/** Пустое поле в фиде означает "0". */
const orZero = (value: string | undefined): string => (value ? value : '0');

const toNumber = (value: string | undefined, fallback = 0): number => {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** Маржа применяется как odds × (1 − margin/100). */
export function applyOddsMargin(odds: number, margin: number): number {
  if (!margin) return odds;
  const withMargin = odds * (1 - margin / 100);
  return Number(withMargin.toFixed(ODD_PRECISION));
}

/**
 * Исход: поля через `~`.
 * `42479757362~home~2.290~~~0~1~300950298285~0`
 */
export function parseOutcome(raw: string, margin: number): IOutcome | null {
  const f = raw.split('~');
  if (f.length < 3 || !f[0]) return null;

  const originalOdds = toNumber(f[2]);

  return {
    outcomeId: f[0],
    outcomeType: f[1] ?? '',
    odds: applyOddsMargin(originalOdds, margin),
    originalOdds,
    parameter1: orZero(f[3]),
    parameter2: orZero(f[4]),
    isSportsbookSynchronized: f[6] === '1',
    providerId: f[7] ?? '',
    maxStake: toNumber(f[8]),
  };
}

/**
 * Рынок: поля через `|`, исходы внутри поля 7 разделены `!`.
 * `15809957684|ah||1||3|4|<outcomes>|0|0|104109615029`
 */
export function parseMarket(raw: string): IMarket | null {
  const f = raw.split('|');
  if (f.length < 8 || !f[0]) return null;

  const margin = toNumber(f[4]);
  const outcomes = (f[7] ?? '')
    .split('!')
    .map((chunk) => parseOutcome(chunk, margin))
    .filter((o): o is IOutcome => o !== null);

  return {
    marketId: f[0],
    marketType: f[1] ?? '',
    parameter: orZero(f[2]),
    isActive: f[3] === '1',
    margin,
    order: toNumber(f[5], DEFAULT_ORDER),
    birDelay: toNumber(f[6]),
    providerId: f[10] ?? f[0],
    outcomes,
  };
}

const SCOPE_VALUES = new Set<string>(Object.values(EScopeVariants));

/** Ключ группы — `<scope>|<number>`, например `set|2`. */
export function parseScopeKey(key: string): Pick<IScope, 'scopeType' | 'scopeParameter' | 'scopeRaw'> {
  const separator = key.lastIndexOf('|');
  const scope = separator === -1 ? key : key.slice(0, separator);
  const parameter = separator === -1 ? '0' : key.slice(separator + 1);

  return {
    scopeType: SCOPE_VALUES.has(scope) ? (scope as EScopeVariants) : EScopeVariants.Unknown,
    scopeParameter: parameter || '0',
    scopeRaw: key,
  };
}

/** `group_markets` целиком → список скоупов. */
export function parseGroupMarkets(groupMarkets: Record<string, string[]>): IScope[] {
  return Object.entries(groupMarkets).map(([key, rows]) => ({
    ...parseScopeKey(key),
    markets: rows.map(parseMarket).filter((m): m is IMarket => m !== null),
  }));
}
