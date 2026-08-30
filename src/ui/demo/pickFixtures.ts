import { EScopeVariants } from '../../types/sliceTypes.ts';
import type { IEvent, IMarket, ITournament } from '../../types/sliceTypes.ts';

/** Событие вместе с турниром и найденным на нём рынком 1X2. */
export interface Fixture {
  event: IEvent;
  tournament: ITournament;
  market: IMarket;
}

const MARKET_TYPE = '1x2';

/** Основной исход матча лежит в скоупе `full_event|0`. */
function findMainMarket(event: IEvent): IMarket | null {
  const scope = event.scopes.find(
    (s) => s.scopeType === EScopeVariants.FullEvent && s.scopeParameter === '0',
  );
  if (!scope) return null;

  const market = scope.markets.find((m) => m.marketType === MARKET_TYPE && m.isActive);
  // 1X2 без трёх исходов рисовать нечем.
  return market && market.outcomes.length === 3 ? market : null;
}

/**
 * Берёт первые подходящие события из разных турниров —
 * так пример нагляднее, а конфликт «два исхода одного события» не возникает случайно.
 */
export function pickFixtures(tournaments: ITournament[], limit = 3): Fixture[] {
  const result: Fixture[] = [];

  for (const tournament of tournaments) {
    for (const event of Object.values(tournament.events)) {
      const market = findMainMarket(event);
      if (!market) continue;

      result.push({ event, tournament, market });
      break;
    }
    if (result.length === limit) break;
  }

  return result;
}

/** Обновляет зафиксированные фикстуры свежими данными из дерева. */
export function refreshFixtures(tournaments: ITournament[], eventIds: string[]): Fixture[] {
  const wanted = new Set(eventIds);
  const found: Fixture[] = [];

  for (const tournament of tournaments) {
    for (const event of Object.values(tournament.events)) {
      if (!wanted.has(event.eventId)) continue;

      const market = findMainMarket(event);
      if (market) found.push({ event, tournament, market });
    }
  }

  return eventIds
    .map((id) => found.find((f) => f.event.eventId === id))
    .filter((f): f is Fixture => Boolean(f));
}
