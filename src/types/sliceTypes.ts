export type EventId = string;
export type TournamentId = string;
export type CountryId = string;
export type SportId = string;
export type MarketId = string;

/** Скоупы, встречающиеся в ключах `group_markets` (`<scope>|<number>`). */
export enum EScopeVariants {
  FullEvent = 'full_event',
  OrdinaryTime = 'ordinary_time',
  FirstHalf = 'first-half',
  SecondHalf = 'second-half',
  Set = 'set',
  GameFullEvent = 'game_full_event',
  PointsFullEvent = 'points_full_event',
  /** Скоуп, которого нет в контракте, — сохраняем сырое значение в scopeRaw. */
  Unknown = 'unknown',
}

export interface IOutcome {
  outcomeId: string;
  /** home, away, draw, over, under, odd, even, yes, no, 1x, x2, 12, score, … */
  outcomeType: string;
  /** Коэффициент с применённой маржой рынка. */
  odds: number;
  /** Коэффициент до применения маржи. */
  originalOdds: number;
  parameter1: string;
  parameter2: string;
  /** false → клиент выкидывает исход из купона. */
  isSportsbookSynchronized: boolean;
  /** Id исхода у провайдера. */
  providerId: string;
  /** 0 = без ограничения. */
  maxStake: number;
}

export interface IMarket {
  /** Нужен для removed_markets в diff. */
  marketId: MarketId;
  marketType: string;
  /** Линия/гандикап; пусто в фиде → "0". */
  parameter: string;
  isActive: boolean;
  /** Маржа в процентах. */
  margin: number;
  order: number;
  /** Задержка приёма ставки in-running, сек. */
  birDelay: number;
  providerId: string;
  outcomes: IOutcome[];
}

export interface IScope {
  scopeType: EScopeVariants;
  scopeParameter: string;
  /** Исходный ключ группы — на случай скоупа вне контракта. */
  scopeRaw: string;
  markets: IMarket[];
}

/**
 * Участник. Локализованное имя ищется по externalId — translation.participants
 * ключуется внешним id (eid / Iid), а не внутренним.
 */
export interface IParticipant {
  participantId: string;
  externalId: string;
  /** Сырое имя из фида — fallback, когда перевода нет. */
  name: string;
  /** Путь вида `media/featured_teams/…png`; пуст у большинства команд. */
  logoPath: string;
}

export interface IEvent {
  eventId: EventId;
  /** Сырое «Home - Away» из фида. Для UI собирайте имя из participants. */
  eventName: string;
  home: IParticipant | null;
  away: IParticipant | null;
  /** Id в противоположном пространстве: sid у live, eid у прематча. */
  counterpartId: string;
  startTime: string;
  status: string;
  tournamentId: TournamentId;
  scopes: IScope[];
}

export interface ICountry {
  countryId: CountryId;
  countryName: string;
  order: number;
}

export interface ISport {
  sportId: SportId;
  sportName: string;
  order: number;
}

export interface ITournament {
  tournamentId: TournamentId;
  tournamentName: string;
  country: ICountry;
  sport: ISport;
  events: Record<EventId, IEvent>;
}

export interface IGameDataSlice {
  countries: ICountry[];
  sports: ISport[];
  tournaments: ITournament[];
}
