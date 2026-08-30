import type { RootState } from '../../store/index.ts';
import { pickFixtures, refreshFixtures } from './pickFixtures.ts';
import type { Fixture } from './pickFixtures.ts';

/** Состав примера фиксируется один раз, иначе события прыгали бы на каждом diff. */
let pinnedEventIds: string[] = [];

/** Те же события из свежего снапшота: меняются только коэффициенты и флаги. */
export function currentFixtures(state: RootState): Fixture[] {
  const { tournaments } = state.gameData.data;

  if (!pinnedEventIds.length) {
    const picked = pickFixtures(tournaments);
    pinnedEventIds = picked.map((f) => f.event.eventId);
    return picked;
  }

  return refreshFixtures(tournaments, pinnedEventIds);
}
