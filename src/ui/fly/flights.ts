export interface Point {
  x: number;
  y: number;
}

export interface Flight {
  id: number;
  /** Точка старта — курсор в момент клика по исходу. */
  from: Point;
  /** Точка финиша — купон. */
  to: Point;
  /** Коэффициент внутри кружка. */
  label: string;
}

/** Длительность полёта; должна совпадать с `animation-duration` в fly.css. */
export const FLY_DURATION_MS = 620;

/**
 * Летящие кружки живут вне React по той же причине, что и купон: запускает их
 * любая кнопка исхода, а рисует один общий слой, и связывать их пропсами через
 * всё дерево не за чем.
 */
let flights: Flight[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function commit(next: Flight[]): void {
  flights = next;
  for (const listener of listeners) listener();
}

/** Снапшот для `useSyncExternalStore`: ссылка меняется только вместе с составом. */
export function getFlights(): Flight[] {
  return flights;
}

export function subscribeFlights(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function launchFlight(flight: Omit<Flight, 'id'>): void {
  const id = nextId++;
  commit([...flights, { ...flight, id }]);

  // В скрытой вкладке анимация тормозится и `animationend` может не прийти —
  // страховочный таймер не даёт кружкам копиться в слое.
  setTimeout(() => landFlight(id), FLY_DURATION_MS + 400);
}

export function landFlight(id: number): void {
  const next = flights.filter((flight) => flight.id !== id);
  if (next.length !== flights.length) commit(next);
}
