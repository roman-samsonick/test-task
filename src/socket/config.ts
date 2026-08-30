import type { ConnectOpts } from 'socket.io-client';

// Целевой эндпоинт: wss://srv.<host>/sport/?EIO=3&transport=websocket
// Подключаемся к своему origin — на /sport стоит прокси Vite (см. vite.config.ts),
// он снимает проблему сертификата и подменяет Origin.
export const SOCKET_URL: string = window.location.origin;

export const SOCKET_PATH = '/sport/';

/** Куда прокси проксирует — только для отображения. */
export const SOCKET_TARGET = __SOCKET_TARGET__;

// EIO=3 задаётся самим socket.io-client@2 (Engine.IO v3)
export const SOCKET_OPTIONS: ConnectOpts = {
  path: SOCKET_PATH,
  transports: ['websocket'],
  upgrade: false,
  autoConnect: false,
  forceNew: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
};
