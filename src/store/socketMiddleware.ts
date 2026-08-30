import type { Middleware } from '@reduxjs/toolkit';
import { startSession } from '../socket/session.ts';
import { isRawMessage } from '../types/rawTypes.ts';
import { socketStarted, socketStopped } from './socketActions.ts';
import { messageReceived } from './gameDataSlice.ts';
import { translationsReceived } from './translationsSlice.ts';
import {
  connectionRequested,
  connectionEstablished,
  connectionLost,
  connectionFailed,
  connectionStopped,
  messageCounted,
} from './connectionSlice.ts';

/**
 * Единственное место, где живёт сокет: наружу он виден только через действия.
 * Сессия сама переотправляет подписки после реконнекта.
 */
export const socketMiddleware: Middleware = (store) => {
  let stop: (() => void) | null = null;

  return (next) => (action) => {
    if (socketStarted.match(action)) {
      if (stop) return next(action);

      store.dispatch(connectionRequested());

      stop = startSession({
        onConnect: (sid) => store.dispatch(connectionEstablished(sid)),
        onDisconnect: (reason) => store.dispatch(connectionLost(reason)),
        onError: (message) => store.dispatch(connectionFailed(message)),
        onEvent: (name, args) => {
          if (name !== 'message') return;

          const payload = args[0];
          if (!isRawMessage(payload)) return;

          store.dispatch(messageCounted());
          // Словари первыми: подписи берутся из них при чтении дерева.
          store.dispatch(translationsReceived(payload));
          store.dispatch(messageReceived(payload));
        },
      });

      return next(action);
    }

    if (socketStopped.match(action)) {
      stop?.();
      stop = null;
      store.dispatch(connectionStopped());
    }

    return next(action);
  };
};
