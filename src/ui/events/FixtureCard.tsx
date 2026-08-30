import type { Dictionaries } from '../../store/translationsSlice.ts';
import { useBetSlip } from '../../betslip/useBetSlip.ts';
import { countryLabel, eventLabel, tournamentLabel } from '../labels.ts';
import { participantLogoUrl } from '../logoUrl.ts';
import { money } from '../format.ts';
import type { Fixture } from '../demo/pickFixtures.ts';
import { outcomeLabel, outcomeShortLabel, toSelection } from '../demo/toSelection.ts';
import { Logo } from './Logo.tsx';

interface Props {
  fixture: Fixture;
  dictionaries: Dictionaries;
  /** Исходы, уже лежащие в купоне: повторный клик по такому снимает выбор. */
  selectedIds: Set<string>;
}

/** Карточка события с рынком 1X2. */
export function FixtureCard({ fixture, dictionaries, selectedIds }: Props) {
  const betSlip = useBetSlip();
  const { event, tournament, market } = fixture;

  return (
    <article className="fixture">
      <div className="fixture__head">
        <span className="fixture__tournament">
          {countryLabel(dictionaries, tournament.country)} · {tournamentLabel(dictionaries, tournament)}
        </span>
        <span className="fixture__time">{event.startTime}</span>
      </div>

      <div className="fixture__teams">
        <Logo url={participantLogoUrl(event.home)} alt="home" />
        <span className="fixture__name">{eventLabel(dictionaries, event)}</span>
        <Logo url={participantLogoUrl(event.away)} alt="away" />
      </div>

      <div className="fixture__odds">
        {market.outcomes.map((outcome) => (
          <button
            key={outcome.outcomeId}
            type="button"
            className={selectedIds.has(outcome.outcomeId) ? 'odd odd--on' : 'odd'}
            // is_sportsbook_synchronized = 0 → исход нельзя принимать.
            disabled={!outcome.isSportsbookSynchronized}
            title={outcomeLabel(dictionaries, fixture, outcome)}
            onClick={() => betSlip.toggleSelection(toSelection(dictionaries, fixture, market, outcome))}
          >
            <span className="odd__key">{outcomeShortLabel(outcome)}</span>
            <span className="odd__value">{money(outcome.odds)}</span>
          </button>
        ))}
      </div>
    </article>
  );
}
