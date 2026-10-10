import { useEffect, useRef } from 'react';

/**
 * Свайп слева-направо = «назад».
 * Срабатывает, если палец начал движение у левого края (x < EDGE)
 * и прошёл вправо больше чем THRESHOLD.
 */
export function useSwipeBack(onBack: () => void, enabled: boolean = true) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const EDGE = 50;       // зона у левого края, где начинаем слушать
    const THRESHOLD = 80;  // минимальное расстояние по X, чтобы сработал back
    const MAX_DY = 60;     // максимальное смещение по Y (чтобы не мешать скроллу)

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX > EDGE) return;
      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);

      if (dy > MAX_DY) {
        tracking.current = false;
        return;
      }
      if (dx < 0) {
        tracking.current = false;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);

      if (dx > THRESHOLD && dy < MAX_DY) {
        onBack();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onBack, enabled]);
}

/**
 * Свайп назад с поддержкой вложенных уровней.
 * Принимает массив функций-шагов. Идёт от последнего к первому,
 * вызывает первую, которая вернула true (значит «закрыла уровень»).
 * Если ни одна не вернула true — ничего не делает.
 */
export function useNestedSwipeBack(steps: Array<() => boolean>, enabled: boolean = true) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    if (!enabled) return;

    const EDGE = 50;
    const THRESHOLD = 80;
    const MAX_DY = 60;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX > EDGE) return;
      startX.current = t.clientX;
      startY.current = t.clientY;
      tracking.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);
      if (dy > MAX_DY) { tracking.current = false; return; }
      if (dx < 0) { tracking.current = false; }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - startY.current);
      if (dx > THRESHOLD && dy < MAX_DY) {
        // идём от последнего шага к первому
        const list = stepsRef.current;
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i]()) return;
        }
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled]);
}