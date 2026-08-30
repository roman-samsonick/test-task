import { useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { getFlights, landFlight, subscribeFlights } from './flights.ts';
import type { Flight } from './flights.ts';
import './fly.css';

/** Вершина дуги: середина пути, приподнятая тем сильнее, чем длиннее полёт. */
function arcPeak(flight: Flight): { x: number; y: number } {
  const lift = Math.min(120, Math.abs(flight.to.x - flight.from.x) * 0.35 + 40);
  return {
    x: (flight.from.x + flight.to.x) / 2,
    y: (flight.from.y + flight.to.y) / 2 - lift,
  };
}

function flightStyle(flight: Flight): CSSProperties {
  const peak = arcPeak(flight);

  return {
    '--fly-x0': `${flight.from.x}px`,
    '--fly-y0': `${flight.from.y}px`,
    '--fly-xm': `${peak.x}px`,
    '--fly-ym': `${peak.y}px`,
    '--fly-x1': `${flight.to.x}px`,
    '--fly-y1': `${flight.to.y}px`,
  } as CSSProperties;
}

/**
 * Общий слой поверх страницы: кружки с коэффициентами, летящие в купон.
 * Монтируется один раз в корне приложения — запускать полёты может кто угодно.
 */
export function FlyLayer() {
  const flights = useSyncExternalStore(subscribeFlights, getFlights, getFlights);

  if (!flights.length) return null;

  return createPortal(
    <div className="fly-layer" aria-hidden="true">
      {flights.map((flight) => (
        <span
          key={flight.id}
          className="fly"
          style={flightStyle(flight)}
          onAnimationEnd={() => landFlight(flight.id)}
        >
          {flight.label}
        </span>
      ))}
    </div>,
    document.body,
  );
}
