/** Обработчик входящего события: имя и аргументы пакета socket.io. */
export type EventTapHandler = (name: string, args: unknown[]) => void;
