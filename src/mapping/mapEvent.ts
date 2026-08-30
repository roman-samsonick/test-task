import type { RawEventEntry, RawParticipants } from '../types/rawTypes.ts';
import type { ICountry, IEvent, IParticipant, ISport, ITournament } from '../types/sliceTypes.ts';
import { parseGroupMarkets } from './parseMarkets.ts';
import { mapCountry, mapSport, mapTournament } from './mapReferences.ts';

/** Событие вместе со справочниками, к которым его надо подшить. */
export interface MappedEvent {
  event: IEvent;
  country: ICountry;
  sport: ISport;
  tournament: Omit<ITournament, 'events'>;
}

function mapParticipant(participants: RawParticipants | undefined, side: 'home' | 'away'): IParticipant | null {
  if (!participants) return null;

  const number = side === 'home' ? '1' : '2';
  const byNumber = participants.ByNumber?.[number];

  const externalId = byNumber?.Iid ?? participants[`${side}_eid`] ?? '';
  const participantId = byNumber?.Id ?? participants[`${side}_id`] ?? '';
  const name = byNumber?.Name ?? participants[side] ?? '';

  if (!externalId && !participantId) return null;

  return { participantId, externalId, name, logoPath: byNumber?.LogoPath ?? '' };
}

/**
 * Отображает элемент `events[]` в модель слайса.
 * Возвращает null для diff-подтверждений без `data` — у них нет ни имён, ни справочников.
 */
export function mapEvent(entry: RawEventEntry): MappedEvent | null {
  const data = entry.data;
  if (!data) return null;

  const country = mapCountry(data);
  const sport = mapSport(data);
  if (!country || !sport) return null;

  const tournament = mapTournament(data, country, sport);
  if (!tournament) return null;

  // В live `id` — внешний, а внутренний лежит в `sid`; в прематче наоборот.
  const counterpartId = data.sid || data.eid || '';

  return {
    country,
    sport,
    tournament,
    event: {
      eventId: entry.id,
      eventName: data.name ?? '',
      home: mapParticipant(data.participants, 'home'),
      away: mapParticipant(data.participants, 'away'),
      counterpartId,
      startTime: data.time ?? '',
      status: data.status ?? '',
      tournamentId: tournament.tournamentId,
      scopes: parseGroupMarkets(entry.group_markets ?? {}),
    },
  };
}
