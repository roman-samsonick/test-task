import type { RawEventData } from '../types/rawTypes.ts';
import type { ICountry, ISport, ITournament } from '../types/sliceTypes.ts';

const toOrder = (value: string | undefined): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Имена кладутся СЫРЫМИ (как в фиде, обычно английские).
 * Перевод не запекается в модель: блок translation покрывает не все id пакета,
 * поэтому подмена на этом шаге навсегда зафиксировала бы английский fallback
 * у части сущностей. Локализация накладывается в UI — см. src/ui/labels.ts.
 */
export function mapCountry(data: RawEventData): ICountry | null {
  const raw = data.country;
  if (!raw?.id) return null;

  return { countryId: raw.id, countryName: raw.name ?? raw.id, order: toOrder(raw.o) };
}

export function mapSport(data: RawEventData): ISport | null {
  const raw = data.sport;
  if (!raw?.id) return null;

  return { sportId: raw.id, sportName: raw.name ?? raw.id, order: toOrder(raw.o) };
}

export function mapTournament(
  data: RawEventData,
  country: ICountry,
  sport: ISport,
): Omit<ITournament, 'events'> | null {
  const raw = data.tournament;
  if (!raw?.id) return null;

  return {
    tournamentId: raw.id,
    tournamentName: raw.name ?? raw.id,
    country,
    sport,
  };
}
