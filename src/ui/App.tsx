import { BetSlip } from './betslip/BetSlip.tsx';
import { useOddsSync } from './betslip/useOddsSync.ts';
import { EventsColumn } from './events/EventsColumn.tsx';
import { useFeed } from './events/useFeed.ts';
import { FlyLayer } from './fly/FlyLayer.tsx';

/** Две колонки: события из фида слева, купон из localStorage справа. */
export function App() {
  const { fixtures, dictionaries } = useFeed();
  useOddsSync(fixtures);

  return (
    <div className="layout">
      <EventsColumn fixtures={fixtures} dictionaries={dictionaries} />
      <BetSlip />
      <FlyLayer />
    </div>
  );
}
