import type { Dictionaries } from '../store/translationsSlice.ts';
import type { ICountry, IEvent, IParticipant, ISport, ITournament } from '../types/sliceTypes.ts';

/**
 * Локализация накладывается на чтении, а не при маппинге: словарь догоняется
 * следующими пакетами, и имя автоматически станет переведённым без пересборки дерева.
 */
const pick = (dictionary: Record<string, string>, id: string, fallback: string): string =>
  dictionary[id] ?? fallback;

export const participantLabel = (d: Dictionaries, p: IParticipant | null): string =>
  p ? pick(d.participants, p.externalId, p.name) : '';

export const tournamentLabel = (d: Dictionaries, t: ITournament): string =>
  pick(d.tournaments, t.tournamentId, t.tournamentName);

export const countryLabel = (d: Dictionaries, c: ICountry): string =>
  pick(d.countries, c.countryId, c.countryName);

export const sportLabel = (d: Dictionaries, s: ISport): string =>
  pick(d.sports, s.sportId, s.sportName);

/**
 * Имя события собирается из участников: поле `name` в фиде всегда английское
 * («Sevilla - Atletico Madrid») и переводу не подлежит.
 */
export function eventLabel(d: Dictionaries, event: IEvent, separator = ' - '): string {
  const home = participantLabel(d, event.home);
  const away = participantLabel(d, event.away);
  if (!home && !away) return event.eventName;
  return `${home}${separator}${away}`;
}
