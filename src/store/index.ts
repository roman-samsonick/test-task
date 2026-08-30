import { configureStore } from '@reduxjs/toolkit';
import gameDataReducer from './gameDataSlice.ts';
import connectionReducer from './connectionSlice.ts';
import translationsReducer from './translationsSlice.ts';
import { socketMiddleware } from './socketMiddleware.ts';

// Купона здесь нет: он живёт в localStorage — см. betslip/useBetSlip.ts.
export const store = configureStore({
  reducer: {
    gameData: gameDataReducer,
    connection: connectionReducer,
    translations: translationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Пакеты доходят до ~6.8 МБ (PreliveEvents/init): обе проверки обходят
      // состояние вглубь на каждый dispatch и подвешивают вкладку.
      serializableCheck: false,
      immutableCheck: false,
    }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { socketStarted, socketStopped } from './socketActions.ts';
