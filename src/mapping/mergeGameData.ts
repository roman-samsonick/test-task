import type { RawMessage } from '../types/rawTypes.ts';
import { readEventEntries } from '../types/rawTypes.ts';
import type { GameDataState } from '../types/stateTypes.ts';
import type { IEvent, IScope, ITournament } from '../types/sliceTypes.ts';
import { mapEvent } from './mapEvent.ts';
import type { MappedEvent } from './mapEvent.ts';
import { parseGroupMarkets } from './parseMarkets.ts';

export function createInitialState(): GameDataState {
  return { data: { countries: [], sports: [], tournaments: [] }, eventIndex: {}, rooms: {} };
}

const findTournament = (state: GameDataState, id: string): ITournament | undefined =>
  state.data.tournaments.find((t) => t.tournamentId === id);

function findEvent(state: GameDataState, eventId: string): IEvent | undefined {
  const tournamentId = state.eventIndex[eventId];
  if (!tournamentId) return undefined;
  return findTournament(state, tournamentId)?.events[eventId];
}

function removeEvent(state: GameDataState, eventId: string): void {
  const tournamentId = state.eventIndex[eventId];
  if (!tournamentId) return;

  const tournament = findTournament(state, tournamentId);
  if (tournament) {
    delete tournament.events[eventId];
    if (Object.keys(tournament.events).length === 0) {
      state.data.tournaments = state.data.tournaments.filter((t) => t.tournamentId !== tournamentId);
    }
  }
  delete state.eventIndex[eventId];
}

/** Справочники накапливаются: их переиспользуют события из соседних комнат. */
function upsertReferences(state: GameDataState, mapped: MappedEvent): void {
  if (!state.data.countries.some((c) => c.countryId === mapped.country.countryId)) {
    state.data.countries.push(mapped.country);
  }
  if (!state.data.sports.some((s) => s.sportId === mapped.sport.sportId)) {
    state.data.sports.push(mapped.sport);
  }
}

function upsertEvent(state: GameDataState, mapped: MappedEvent, event: IEvent): void {
  upsertReferences(state, mapped);

  const previousTournamentId = state.eventIndex[event.eventId];
  if (previousTournamentId && previousTournamentId !== mapped.tournament.tournamentId) {
    removeEvent(state, event.eventId);
  }

  let tournament = findTournament(state, mapped.tournament.tournamentId);
  if (!tournament) {
    tournament = { ...mapped.tournament, events: {} };
    state.data.tournaments.push(tournament);
  }

  tournament.events[event.eventId] = event;
  state.eventIndex[event.eventId] = tournament.tournamentId;
}

/**
 * diff несёт только затронутые скоупы и только изменившиеся рынки внутри них,
 * поэтому скоупы и рынки сливаются, а не заменяются.
 */
function mergeScopes(previous: IScope[], incoming: IScope[]): IScope[] {
  if (!incoming.length) return previous;

  const result = previous.map((scope) => ({ ...scope, markets: [...scope.markets] }));

  for (const scope of incoming) {
    const target = result.find((s) => s.scopeRaw === scope.scopeRaw);
    if (!target) {
      result.push(scope);
      continue;
    }

    for (const market of scope.markets) {
      const index = target.markets.findIndex((m) => m.marketId === market.marketId);
      if (index === -1) target.markets.push(market);
      else target.markets[index] = market;
    }
  }

  return result;
}

function removeMarkets(event: IEvent, marketIds: string[]): void {
  if (!marketIds.length) return;
  const removed = new Set(marketIds);

  for (const scope of event.scopes) {
    scope.markets = scope.markets.filter((m) => !removed.has(m.marketId));
  }
  event.scopes = event.scopes.filter((scope) => scope.markets.length > 0);
}

function rememberRoom(state: GameDataState, message: RawMessage, eventIds: string[]): void {
  state.rooms[message.room] = {
    type: message.type,
    eventIds,
    sendingDate: message.sending_date ?? '',
  };
}

/** init: комната пересобирается целиком — прежний её состав выбрасывается. */
export function applyInit(state: GameDataState, message: RawMessage): void {
  for (const eventId of state.rooms[message.room]?.eventIds ?? []) {
    removeEvent(state, eventId);
  }

  const eventIds: string[] = [];

  for (const entry of readEventEntries(message)) {
    const mapped = mapEvent(entry);
    if (!mapped) continue;

    upsertEvent(state, mapped, mapped.event);
    eventIds.push(mapped.event.eventId);
  }

  rememberRoom(state, message, eventIds);
}

/**
 * diff: массив events задаёт актуальный состав комнаты целиком,
 * поэтому пропавшие из него события считаются выбывшими.
 */
export function applyDiff(state: GameDataState, message: RawMessage): void {
  const entries = readEventEntries(message);
  const present = new Set(entries.map((entry) => entry.id));

  for (const eventId of state.rooms[message.room]?.eventIds ?? []) {
    if (!present.has(eventId)) removeEvent(state, eventId);
  }

  for (const entry of entries) {
    const previous = findEvent(state, entry.id);

    if (entry.data) {
      const mapped = mapEvent(entry);
      if (!mapped) continue;

      // data приходит целиком, а вот рынки — только изменившиеся.
      const event: IEvent = {
        ...mapped.event,
        scopes: mergeScopes(previous?.scopes ?? [], mapped.event.scopes),
      };
      removeMarkets(event, entry.removed_markets ?? []);
      upsertEvent(state, mapped, event);
      continue;
    }

    if (!previous) continue;

    if (entry.group_markets) {
      previous.scopes = mergeScopes(previous.scopes, parseGroupMarkets(entry.group_markets));
    }
    removeMarkets(previous, entry.removed_markets ?? []);
  }

  rememberRoom(state, message, [...present]);
}

/** Роутинг по digest_type — единственная точка входа для входящего сообщения. */
export function applyMessage(state: GameDataState, message: RawMessage): void {
  if (message.digest_type === 'diff') applyDiff(state, message);
  else applyInit(state, message);
}
