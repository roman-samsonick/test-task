import { useEffect } from 'react';
import { useBetSlip } from '../../betslip/useBetSlip.ts';
import type { Fixture } from '../demo/pickFixtures.ts';

/**
 * Купон хранит выборы самодостаточно, поэтому коэффициенты в нём подтягиваются
 * из фида отдельно — расхождение с acceptedOdds подсветит issue.
 * Отдаём только реальные изменения: иначе каждое обновление будило бы подписчика
 * купона, тот — новый рендер, и эффект уходил бы в бесконечный цикл.
 */
export function useOddsSync(fixtures: Fixture[]): void {
  const betSlip = useBetSlip();

  useEffect(() => {
    const { selections } = betSlip.getState();
    const changed: Record<string, number> = {};

    for (const fixture of fixtures) {
      for (const outcome of fixture.market.outcomes) {
        const selection = selections[outcome.outcomeId];
        if (selection && selection.currentOdds !== outcome.odds) {
          changed[outcome.outcomeId] = outcome.odds;
        }
      }
    }

    if (Object.keys(changed).length) betSlip.refreshOdds(changed);
  }, [betSlip, fixtures]);
}
