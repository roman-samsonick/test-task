import type { BetSelection } from '../../betslip/types.ts';
import type { Dictionaries } from '../../store/translationsSlice.ts';
import type { IMarket, IOutcome } from '../../types/sliceTypes.ts';
import { eventLabel, participantLabel } from '../labels.ts';
import type { Fixture } from './pickFixtures.ts';

/** Подпись исхода 1X2: имена команд информативнее, чем home/away. */
export function outcomeLabel(dictionaries: Dictionaries, fixture: Fixture, outcome: IOutcome): string {
  switch (outcome.outcomeType) {
    case 'home':
      return participantLabel(dictionaries, fixture.event.home) || 'П1';
    case 'away':
      return participantLabel(dictionaries, fixture.event.away) || 'П2';
    case 'draw':
      return 'Ничья';
    default:
      return outcome.outcomeType;
  }
}

/** Короткая подпись для кнопки. */
export const outcomeShortLabel = (outcome: IOutcome): string =>
  ({ home: '1', draw: 'X', away: '2' })[outcome.outcomeType] ?? outcome.outcomeType;

/**
 * Собирает самодостаточный выбор: подписи копируются в купон,
 * потому что событие может выбыть из комнаты очередным diff.
 */
export function toSelection(
  dictionaries: Dictionaries,
  fixture: Fixture,
  market: IMarket,
  outcome: IOutcome,
): BetSelection {
  return {
    eventId: fixture.event.eventId,
    marketId: market.marketId,
    outcomeId: outcome.outcomeId,

    outcomeProviderId: outcome.providerId,
    eventCounterpartId: fixture.event.counterpartId,

    acceptedOdds: outcome.odds,
    currentOdds: outcome.odds,

    eventLabel: eventLabel(dictionaries, fixture.event),
    marketLabel: '1X2',
    outcomeLabel: outcomeLabel(dictionaries, fixture, outcome),
    startTime: fixture.event.startTime,

    maxStake: outcome.maxStake,
    isSynchronized: outcome.isSportsbookSynchronized,
    isActive: market.isActive,

    issue: null,
  };
}
