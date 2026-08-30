/**
 * Формы сообщений так, как их отдаёт сервер (см. docs/kralbetwscontract.md).
 * Всё приходит одним событием `message`; прикладной тип — в поле `type`.
 */

export type DigestType = 'init' | 'diff';

/** Плоские мапы id → локализованное имя. Покрывают только id текущего пакета. */
export interface RawTranslation {
  participants?: Record<string, string>;
  tournaments?: Record<string, string>;
  sports?: Record<string, string>;
  countries?: Record<string, string>;
}

export interface RawReference {
  id: string;
  name: string;
  o?: string;
}

export interface RawTournamentRef extends RawReference {
  is_featured?: boolean;
  is_top?: boolean;
  is_special_odds_league?: boolean;
  banner_image?: string;
  gender?: string;
}

export interface RawParticipant {
  Id: string;
  Name: string;
  Number: number;
  /** Внешний id участника — именно по нему ключуются translation.participants. */
  Iid: string;
  CountryId?: string;
  /** Путь к загруженному логотипу; чаще всего пустой. */
  LogoPath?: string;
  Gender?: string;
}

export interface RawParticipants {
  home?: string;
  home_id?: string;
  home_eid?: string;
  away?: string;
  away_id?: string;
  away_eid?: string;
  ByNumber?: Record<string, RawParticipant>;
}

export interface RawEventData {
  id: string;
  participants?: RawParticipants;
  /** У live здесь внутренний id, а `id` — внешний. */
  sid?: string;
  name?: string;
  time?: string;
  time_ts?: string;
  status?: string;
  ut?: string;
  /** Всего рынков у события (events markets count). */
  emc?: number;
  wid?: string;
  eid?: string;
  tournament?: RawTournamentRef;
  sport?: RawReference;
  country?: RawReference;

  // live-поля
  minute?: number;
  et?: number;
  extended_status?: string;
  current_score?: string;
  /** "<scope>|<number>|<home>|<away>" */
  scores?: string[];
  is_active?: boolean;
  is_live_betting?: boolean;
  bfl?: string;

  [field: string]: unknown;
}

/**
 * Элемент массива `events`. В diff приходят все id комнаты: без `data`/`group_markets`
 * элемент лишь подтверждает присутствие события в комнате.
 */
export interface RawEventEntry {
  id: string;
  digest_type?: DigestType;
  data?: RawEventData;
  /** Ключ — скоуп `<scope>|<number>`, значение — рынки строками. */
  group_markets?: Record<string, string[]>;
  /** Id рынков, которые нужно удалить. */
  removed_markets?: string[];
}

export interface RawMessage {
  room: string;
  type: string;
  digest_type: DigestType;
  locale?: string;
  current_time?: string;
  sending_date?: string;
  translation?: RawTranslation;
  /** MainPage / PreliveEvents / LiveEvents */
  events?: RawEventEntry[];
  /** GetEventsOdds отдаёт мапу вместо массива. */
  events_by_id?: Record<string, RawEventEntry>;
}

/** Ответ на subscribe-Translations: полный словарь, разбитый по фазам. */
export interface RawTranslationsMessage extends RawMessage {
  live?: RawTranslation;
  prelive?: RawTranslation;
  finished?: RawTranslation;
}

/** Сообщение — это message-пакет с ожидаемой обвязкой, а не что-то постороннее. */
export function isRawMessage(value: unknown): value is RawMessage {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return typeof m.room === 'string' && typeof m.type === 'string';
}

/** Приводит обе формы (`events` и `events_by_id`) к одному массиву. */
export function readEventEntries(message: RawMessage): RawEventEntry[] {
  if (message.events) return message.events;
  if (message.events_by_id) return Object.values(message.events_by_id);
  return [];
}
