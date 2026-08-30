import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  sid: string | null;
  error: string | null;
  /** Счётчик принятых message-пакетов — удобная точка контроля потока. */
  messageCount: number;
}

const initialState: ConnectionState = { status: 'idle', sid: null, error: null, messageCount: 0 };

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    connectionRequested(state) {
      state.status = 'connecting';
      state.error = null;
    },
    connectionEstablished(state, action: PayloadAction<string>) {
      state.status = 'connected';
      state.sid = action.payload;
      state.error = null;
    },
    connectionLost(state, action: PayloadAction<string>) {
      state.status = 'disconnected';
      state.sid = null;
      state.error = action.payload;
    },
    connectionFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    connectionStopped() {
      return initialState;
    },
    messageCounted(state) {
      state.messageCount += 1;
    },
  },
  selectors: {
    selectStatus: (state) => state.status,
    selectSid: (state) => state.sid,
    selectMessageCount: (state) => state.messageCount,
  },
});

export const {
  connectionRequested,
  connectionEstablished,
  connectionLost,
  connectionFailed,
  connectionStopped,
  messageCounted,
} = connectionSlice.actions;

export const { selectStatus, selectSid, selectMessageCount } = connectionSlice.selectors;

export default connectionSlice.reducer;
