import type { EventId, IGameDataSlice, TournamentId } from './sliceTypes.ts';

/** Что известно про комнату, из которой пришли события. */
export interface RoomState {
  type: string;
  /** Состав комнаты по последнему сообщению — diff задаёт его целиком. */
  eventIds: EventId[];
  sendingDate: string;
}

export interface GameDataState {
  data: IGameDataSlice;
  /** eventId → tournamentId: без него удаление события — перебор всех турниров. */
  eventIndex: Record<EventId, TournamentId>;
  rooms: Record<string, RoomState>;
}
