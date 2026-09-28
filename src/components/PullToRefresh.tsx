import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80; // Сколько пикселей тянуть для срабатывания

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Срабатывает только если страница на самом верху
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0 || refreshing) return;
      if (container.scrollTop > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        // Делим на 2 — эффект «сопротивления»
        setPullDistance(Math.min(distance / 2, THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        try {
          await onRefresh();
        } catch (err) {
          console.error(err);
        } finally {
          setRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      startY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div ref={containerRef} className="relative overflow-y-auto" style={{ maxHeight: '100vh' }}>
      {/* Индикатор */}
      <div
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: pullDistance }}
      >
        {refreshing ? (
          <div className="flex items-center space-x-2 text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Yangilanmoqda...</span>
          </div>
        ) : pullDistance >= THRESHOLD ? (
          <div className="text-xs font-semibold text-stone-500">
            ⬇️ Qo'yib yuboring
          </div>
        ) : (
          <div className="text-xs font-semibold text-stone-400">
            ⬇️ Pastga torting
          </div>
        )}
      </div>

      {children}
    </div>
  );
};