import { useMemo, useSyncExternalStore } from 'react';
import { store } from '../../store/index.ts';
import { selectDictionaries } from '../../store/translationsSlice.ts';
import type { Dictionaries } from '../../store/translationsSlice.ts';
import { currentFixtures } from '../demo/fixtures.ts';
import type { Fixture } from '../demo/pickFixtures.ts';

/**
 * Пакеты фида доходят до мегабайтов и идут пачками — уведомления склеиваем
 * в кадр, иначе рендер запускался бы на каждый dispatch внутри одного пакета.
 */
function subscribeToFeed(onStoreChange: () => void): () => void {
  let scheduled = false;

  return store.subscribe(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      onStoreChange();
    });
  });
}

export function useFeed(): { fixtures: Fixture[]; dictionaries: Dictionaries } {
  const state = useSyncExternalStore(subscribeToFeed, store.getState);

  return useMemo(
    () => ({ fixtures: currentFixtures(state), dictionaries: selectDictionaries(state) }),
    [state],
  );
}
