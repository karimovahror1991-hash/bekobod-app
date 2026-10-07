import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  startIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const initialDistance = useRef(0);
  const initialScale = useRef(1);
  const lastTap = useRef(0);
  const panStart = useRef({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  // Сброс зума при смене картинки
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [currentIndex]);

  // Pinch to zoom + pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance.current = getDistance(e.touches);
        initialScale.current = scale;
      } else if (e.touches.length === 1) {
        // Двойной тап = сброс / зум
        const now = Date.now();
        if (now - lastTap.current < 300) {
          if (scale > 1) {
            setScale(1);
            setTranslate({ x: 0, y: 0 });
          } else {
            setScale(2);
          }
          e.preventDefault();
        }
        lastTap.current = now;

        // Начало панорамирования
        panStart.current = {
          x: e.touches[0].clientX - translate.x,
          y: e.touches[0].clientY - translate.y,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance.current > 0) {
        // Pinch
        const newDistance = getDistance(e.touches);
        const ratio = newDistance / initialDistance.current;
        const newScale = Math.min(Math.max(initialScale.current * ratio, 1), 4);
        setScale(newScale);
        e.preventDefault();
      } else if (e.touches.length === 1 && scale > 1) {
        // Pan (только если увеличено)
        const newX = e.touches[0].clientX - panStart.current.x;
        const newY = e.touches[0].clientY - panStart.current.y;
        // Ограничиваем сдвиг
        const maxX = (scale - 1) * el.clientWidth / 2;
        const maxY = (scale - 1) * el.clientHeight / 2;
        setTranslate({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      initialDistance.current = 0;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, translate]);

  // Листание между фото
  const goNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Счётчик */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 text-white text-2xl flex items-center justify-center z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Стрелки (если >1 фото и зум = 1) */}
      {images.length > 1 && currentIndex > 0 && scale === 1 && (
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white text-2xl flex items-center justify-center z-10"
        >
          ‹
        </button>
      )}
      {images.length > 1 && currentIndex < images.length - 1 && scale === 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 text-white text-2xl flex items-center justify-center z-10"
        >
          ›
        </button>
      )}

      {/* Изображение с зумом */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <img
          src={currentImage}
          alt="Fullscreen"
          draggable={false}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          }}
        />
      </div>

      {/* Подсказка */}
      {scale === 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-medium">
          👆👆 Щипок = зум · 2 тапа = быстро
        </div>
      )}
    </div>
  );
};