import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RawMessage } from '../types/rawTypes.ts';
import type { GameDataState } from '../types/stateTypes.ts';
import { createInitialState, applyMessage } from '../mapping/mergeGameData.ts';

/** Типы комнат, которые кладутся в этот слайс. Остальные игнорируются. */
const GAME_DATA_TYPES = new Set(['MainPage', 'PreliveEvents', 'LiveEvents', 'GetEventsOdds']);

const gameDataSlice = createSlice({
  name: 'gameData',
  initialState: createInitialState(),
  reducers: {
    messageReceived(state: GameDataState, action: PayloadAction<RawMessage>) {
      if (!GAME_DATA_TYPES.has(action.payload.type)) return;
      applyMessage(state, action.payload);
    },
    roomsReset() {
      return createInitialState();
    },
  },
  selectors: {
    selectGameData: (state) => state.data,
    selectSports: (state) => state.data.sports,
    selectCountries: (state) => state.data.countries,
    selectTournaments: (state) => state.data.tournaments,
    selectRooms: (state) => state.rooms,
  },
});

export const { messageReceived, roomsReset } = gameDataSlice.actions;
export const { selectGameData, selectSports, selectCountries, selectTournaments, selectRooms } =
  gameDataSlice.selectors;

export default gameDataSlice.reducer;
