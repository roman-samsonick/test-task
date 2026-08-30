import ioClient from 'socket.io-client';
import type { ConnectOpts, Packet, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS } from './config.ts';
import type { EventTapHandler } from './types.ts';
import type { Subscription } from './subscriptions.ts';

/** Создаёт socket.io-клиент (Engine.IO v3) без автоподключения. */
export function createSocket(overrides: ConnectOpts = {}): Socket {
  return ioClient(SOCKET_URL, { ...SOCKET_OPTIONS, ...overrides });
}

/**
 * Перехватывает все входящие события, включая те, чьи имена заранее неизвестны.
 * Возвращает функцию отписки, восстанавливающую исходный обработчик.
 */
export function tapEvents(socket: Socket, handler: EventTapHandler): () => void {
  const original = socket.onevent;

  socket.onevent = function patched(this: Socket, packet: Packet): void {
    const [name, ...args] = packet.data ?? [];
    if (typeof name === 'string') handler(name, args);
    original.call(this, packet);
  };

  return () => {
    socket.onevent = original;
  };
}

/** Отправляет подписки и сообщает о каждой отправке. */
export function sendSubscriptions(
  socket: Socket,
  subscriptions: readonly Subscription[],
  onSent?: EventTapHandler,
): void {
  for (const { event, payload } of subscriptions) {
    socket.emit(event, payload);
    onSent?.(event, [payload]);
  }
}
