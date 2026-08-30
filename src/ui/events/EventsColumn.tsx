import { useMemo } from 'react';
import type { Dictionaries } from '../../store/translationsSlice.ts';
import { useBetSlipState } from '../betslip/useBetSlipState.ts';
import type { Fixture } from '../demo/pickFixtures.ts';
import { FixtureCard } from './FixtureCard.tsx';

interface Props {
  fixtures: Fixture[];
  dictionaries: Dictionaries;
}

/** Колонка событий: состав примера закреплён, обновляются только коэффициенты. */
export function EventsColumn({ fixtures, dictionaries }: Props) {
  const { state } = useBetSlipState();
  const selectedIds = useMemo(() => new Set(state.order), [state.order]);

  return (
    <div className="events">
      <h2>События · full_event → 1X2</h2>

      {!fixtures.length && <p className="slip__empty">Ждём снапшот PreliveEvents…</p>}

      {fixtures.map((fixture) => (
        <FixtureCard
          key={fixture.event.eventId}
          fixture={fixture}
          dictionaries={dictionaries}
          selectedIds={selectedIds}
        />
      ))}
    </div>
  );
}
