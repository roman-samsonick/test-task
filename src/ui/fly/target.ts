import { useCallback } from 'react';
import type { Point } from './flights.ts';

/** Элемент-приёмник (купон): куда летят кружки. */
let target: HTMLElement | null = null;

/**
 * Ref-колбэк для приёмника. Купон монтируется один раз и один на приложение,
 * поэтому регистрации элемента достаточно — искать его селектором не нужно.
 */
export function useFlyTarget(): (element: HTMLElement | null) => void {
  return useCallback((element: HTMLElement | null) => {
    target = element;
  }, []);
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Точка финиша — шапка купона. Возвращает `null`, если купон не смонтирован:
 * лететь некуда, значит и анимации быть не должно.
 */
export function flyTargetPoint(): Point | null {
  if (!target) return null;

  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    // Купон может быть прокручен за пределы экрана — держим финиш в видимой зоне.
    y: clamp(rect.top + 28, 24, window.innerHeight - 24),
  };
}
