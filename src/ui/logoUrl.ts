import type { IParticipant } from '../types/sliceTypes.ts';

/**
 * Правила взяты из клиентского бандла сайта и проверены запросами.
 *
 * 1) Загруженный логотип: `vendors.sportsbook.url` + '/' + LogoPath
 *    https://<домен>/bet/media/featured_teams/<Id>_<md5>.png  → 200, PNG 250×250
 *    Имя файла содержит md5, вычислить его по id нельзя — путь берётся только из фида.
 *    Заполнен редко: 541 событие из 2418 в замере.
 *
 * 2) Fallback по внешнему id (основной путь):
 *    logo_api_urls = ["https://de-west3-1.stkcdn.com/tr/%type%/%size%/%s.png?"]
 *    %type%: logo | tournament | jersey, %size%: big (jersey — medium), %s: id
 *    Шаблон выбирается как id % templates.length.
 */
export interface LogoConfig {
  /** `https://<домен>/bet` — без завершающего слэша. */
  sportsbookUrl: string;
  /** Из public.main.sources.logo_api_urls. */
  templates: string[];
}

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  // В проде это `https://<домен>/bet`; в dev — префикс прокси, потому что
  // напрямую картинки режет Cross-Origin-Resource-Policy.
  sportsbookUrl: __SPORTSBOOK_URL__,
  templates: ['https://de-west3-1.stkcdn.com/tr/%type%/%size%/%s.png'],
};

function fromTemplate(config: LogoConfig, type: string, size: string, id: string): string {
  const templates = config.templates.length ? config.templates : DEFAULT_LOGO_CONFIG.templates;
  const index = Number(id) % templates.length;
  const template = templates[Number.isFinite(index) ? index : 0] ?? templates[0]!;

  return template.replace('%type%', type).replace('%size%', size).replace('%s', id);
}

/** Логотип команды: сначала загруженный, иначе — по внешнему id. */
export function participantLogoUrl(participant: IParticipant | null, config = DEFAULT_LOGO_CONFIG): string | null {
  if (!participant) return null;
  if (participant.logoPath) return `${config.sportsbookUrl}/${participant.logoPath}`;
  if (!participant.externalId) return null;

  return fromTemplate(config, 'logo', 'big', participant.externalId);
}

export const tournamentLogoUrl = (tournamentId: string, config = DEFAULT_LOGO_CONFIG): string =>
  fromTemplate(config, 'tournament', 'big', tournamentId);

export const jerseyLogoUrl = (externalId: string, isAway: boolean, config = DEFAULT_LOGO_CONFIG): string =>
  fromTemplate(config, 'jersey', 'medium', `${isAway ? 'away' : 'home'}_${externalId}`);
