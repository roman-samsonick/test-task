export interface Subscription {
  event: string;
  payload: Record<string, unknown>;
}

/**
 * Отправляется сразу после connect — и повторно после каждого реконнекта,
 * иначе сервер перестаёт слать данные по восстановленному соединению.
 */
export const SUBSCRIPTIONS: Subscription[] = [
  // 42["subscribe-PreliveEvents", {"market_group":"prelive","locale":"ru_RU"}]
  {
    event: 'subscribe-PreliveEvents',
    payload: { market_group: 'prelive', locale: 'ru_RU' },
  },
];
