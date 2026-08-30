import { createSocket, tapEvents, sendSubscriptions } from './client.ts';
import { SUBSCRIPTIONS } from './subscriptions.ts';
import type { EventTapHandler } from './types.ts';

export interface SessionHandlers {
  onEvent?: EventTapHandler;
  onConnect?: (sid: string) => void;
  onDisconnect?: (reason: string) => void;
  onError?: (message: string) => void;
}

const toMessage = (err: unknown): string => {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return String(err);
};

/**
 * Поднимает соединение, отправляет подписки (в том числе после каждого реконнекта)
 * и раздаёт входящие события. Возвращает функцию остановки.
 */
export function startSession(handlers: SessionHandlers = {}): () => void {
  const socket = createSocket();

  const onConnect = (): void => {
    handlers.onConnect?.(socket.id);
    sendSubscriptions(socket, SUBSCRIPTIONS);
  };
  const onDisconnect = (reason: string): void => handlers.onDisconnect?.(reason);
  const onError = (err: unknown): void => handlers.onError?.(toMessage(err));

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('connect_error', onError);
  socket.on('connect_timeout', onError);

  const untap = handlers.onEvent ? tapEvents(socket, handlers.onEvent) : () => {};

  socket.connect();

  return () => {
    untap();
    socket.off('connect', onConnect);
    socket.off('disconnect', onDisconnect);
    socket.off('connect_error', onError);
    socket.off('connect_timeout', onError);
    socket.close();
  };
}
