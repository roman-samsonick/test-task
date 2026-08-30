/**
 * socket.io-client@2 не поставляет собственных типов, а @types/socket.io-client
 * описывает ещё API версии 1. Здесь объявлено ровно то, что использует проект.
 */
declare module 'socket.io-client' {
  /** Пакет протокола socket.io: type 2 — event, data = [name, ...args]. */
  export interface Packet {
    type: number;
    nsp: string;
    id?: number;
    data?: unknown[];
  }

  export interface ConnectOpts {
    path?: string;
    transports?: string[];
    upgrade?: boolean;
    autoConnect?: boolean;
    forceNew?: boolean;
    /** Только Node: заставляет использовать ws вместо глобального WebSocket. */
    forceNode?: boolean;
    /** Только Node: проверка TLS-сертификата. */
    rejectUnauthorized?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    timeout?: number;
    query?: Record<string, string>;
    transportOptions?: Record<string, unknown>;
    [option: string]: unknown;
  }

  export type Listener = (...args: never[]) => void;

  export interface Manager {
    on(event: string, fn: Listener): Manager;
    off(event: string, fn?: Listener): Manager;
  }

  export interface Socket {
    readonly id: string;
    readonly connected: boolean;
    readonly disconnected: boolean;
    readonly io: Manager;
    /** Точка входа входящих событий; проект её оборачивает, см. tapEvents. */
    onevent(packet: Packet): void;
    on(event: string, fn: Listener): Socket;
    once(event: string, fn: Listener): Socket;
    off(event: string, fn?: Listener): Socket;
    emit(event: string, ...args: unknown[]): Socket;
    connect(): Socket;
    disconnect(): Socket;
    close(): Socket;
  }

  const io: (uri: string, opts?: ConnectOpts) => Socket;
  export default io;
}
