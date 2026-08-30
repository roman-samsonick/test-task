import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { launchFlight } from './flights.ts';
import type { Point } from './flights.ts';
import { flyTargetPoint } from './target.ts';

/** Запуск полёта: точка клика + коэффициент, который окажется внутри кружка. */
export type FlyToSlip = (event: MouseEvent<HTMLElement>, label: string) => void;

const centerOf = (element: HTMLElement): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/**
 * Кружок с коэффициентом, улетающий из-под курсора в купон.
 * Хук только запускает полёт — рисует его общий `FlyLayer`.
 */
export function useFlyToSlip(): FlyToSlip {
  return useCallback((event, label) => {
    // Уважаем системную настройку: без анимаций — вообще без кружка.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const to = flyTargetPoint();
    if (!to) return;

    // Клик с клавиатуры приходит с нулевыми координатами — стартуем от кнопки.
    const from = event.clientX || event.clientY
      ? { x: event.clientX, y: event.clientY }
      : centerOf(event.currentTarget);

    launchFlight({ from, to, label });
  }, []);
}
