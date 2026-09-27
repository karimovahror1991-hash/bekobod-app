import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

interface QiblaViewProps {
  onClose: () => void;
}

const BEKOBOD_LAT = 40.22;
const BEKOBOD_LON = 69.22;
const MAKKA_LAT = 21.4225;
const MAKKA_LON = 39.8262;

const calculateQibla = () => {
  const lat1 = (BEKOBOD_LAT * Math.PI) / 180;
  const lat2 = (MAKKA_LAT * Math.PI) / 180;
  const lonDiff = ((MAKKA_LON - BEKOBOD_LON) * Math.PI) / 180;

  const x = Math.sin(lonDiff);
  const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lonDiff);
  const qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return Math.round((qibla + 360) % 360);
};

export const QiblaView: React.FC<QiblaViewProps> = ({ onClose }) => {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [compassActive, setCompassActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasSensor, setHasSensor] = useState(true);
  const listenerRef = useRef<((e: any) => void) | null>(null);

  const qiblaAngle = calculateQibla();
  // Угол поворота стрелки: направление на Мекку минус текущий курс устройства
  const arrowRotation = qiblaAngle - deviceHeading;

  useEffect(() => {
    return () => {
      // Чистим listener при закрытии
      if (listenerRef.current) {
        window.removeEventListener('deviceorientation', listenerRef.current);
        window.removeEventListener('deviceorientationabsolute', listenerRef.current);
      }
    };
  }, []);

  const handleOrientation = (event: any) => {
    let heading = 0;

    // iOS — встроенный компас
    if (typeof event.webkitCompassHeading === 'number' && !isNaN(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    }
    // Android — alpha (0..360)
    else if (typeof event.alpha === 'number' && event.alpha !== null) {
      heading = 360 - event.alpha;
    }

    if (heading !== null && !isNaN(heading)) {
      setDeviceHeading(heading);
      setHasSensor(true);
    }
  };

  const requestCompass = async () => {
    try {
      const anyWindow = window as any;
      const DeviceOrientationEventAny = anyWindow.DeviceOrientationEvent;

      if (!DeviceOrientationEventAny) {
        setHasSensor(false);
        return;
      }

      // iOS 13+ требует разрешение
      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        const permission = await DeviceOrientationEventAny.requestPermission();
        if (permission === 'granted') {
          if (!listenerRef.current) {
            listenerRef.current = handleOrientation;
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
          setCompassActive(true);
        } else {
          setPermissionDenied(true);
        }
      } else {
        // Android и другие платформы
        if (!listenerRef.current) {
          listenerRef.current = handleOrientation;
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
        setCompassActive(true);
      }
    } catch (err) {
      console.error('Compass error:', err);
      setPermissionDenied(true);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-indigo-100">
      {/* Заголовок */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🕌 Qibla</h1>
            <p className="text-xs text-white/80">Makka yo'nalishi</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Если компас ещё не включён */}
        {!compassActive && (
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 text-center space-y-5">
            <div className="text-7xl">🧭</div>
            <div className="text-base text-stone-700 font-semibold">
              Kompasni yoqish uchun tugmani bosing
            </div>
            <div className="text-xs text-stone-500">
              Telefoningiz tekis va gorizontal holatda bo'lishi kerak
            </div>

            {permissionDenied ? (
              <div className="bg-rose-50 rounded-2xl p-4 text-sm text-rose-700 space-y-2">
                <div className="font-bold">❌ Kompasga ruxsat berilmadi</div>
                <div className="text-xs">
                  Brauzer sozlamalaridan ruxsat bering yoki pastdagi yo'riqnomadan foydalaning
                </div>
              </div>
            ) : !hasSensor ? (
              <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-700">
                ⚠️ Qurilmangizda kompas mavjud emas
              </div>
            ) : (
              <button
                onClick={requestCompass}
                className="w-full py-5 bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition"
              >
                🧭 Kompasni yoqish
              </button>
            )}
          </div>
        )}

        {/* Компас активен */}
        {compassActive && (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 flex flex-col items-center">
              {/* Круг компаса */}
              <div className="relative w-72 h-72 mb-6">
                {/* Фон */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50 shadow-inner"></div>

                {/* Метки сторон света */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-lg font-bold text-rose-600">N</div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-lg font-bold text-stone-700">S</div>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-stone-700">W</div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-bold text-stone-700">E</div>

                {/* Деления */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = i * 15;
                  const isMajor = i % 6 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 origin-bottom"
                      style={{
                        transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                        transformOrigin: 'bottom center',
                        height: isMajor ? '18px' : '10px',
                        width: '2px',
                        marginTop: isMajor ? '-18px' : '-10px',
                      }}
                    >
                      <div className={`w-full h-full ${isMajor ? 'bg-stone-600' : 'bg-stone-300'} rounded-full`} />
                    </div>
                  );
                })}

                {/* Стрелка на Мекку */}
                <div
                  className="absolute top-1/2 left-1/2 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${arrowRotation}deg)`,
                    transformOrigin: 'bottom center',
                    height: '110px',
                    width: '6px',
                    marginTop: '-110px',
                  }}
                >
                  <div className="w-full h-full bg-linear-to-t from-blue-600 to-emerald-500 rounded-full relative shadow-lg">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
                      🕋
                    </div>
                  </div>
                </div>

                {/* Центральная точка */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-stone-800 rounded-full border-2 border-white shadow-lg"></div>
              </div>

              {/* Угол */}
              <div className="text-center space-y-1">
                <div className="text-5xl font-bold text-blue-700">{qiblaAngle}°</div>
                <div className="text-sm font-semibold text-stone-700">Makka yo'nalishi</div>
                <div className="text-xs text-stone-400">
                  Qurilma kursi: {Math.round(deviceHeading)}°
                </div>
              </div>
            </div>

            {/* Инструкция */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-3">
              <h2 className="font-bold text-lg text-stone-900 flex items-center space-x-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Qanday foydalanish kerak?</span>
              </h2>
              <ol className="space-y-2 text-sm text-stone-700 list-decimal list-inside">
                <li>Telefonni tekis tuting</li>
                <li>Yashil strelka 🕋 ni toping</li>
                <li>Telefonni aylantirib, strelkani <b>yuqoriga</b> yo'naltiring</li>
                <li>Shu holatda siz Makkaga qarab turgansiz</li>
              </ol>
            </div>
          </>
        )}

        {/* Текстовая инструкция (всегда) */}
        <div className="bg-blue-50 rounded-3xl p-5 text-sm text-blue-900 space-y-2">
          <div className="font-bold">📌 Ma'lumot</div>
          <div className="text-xs leading-relaxed">
            Bekoboddan Makkaga yo'nalish: <b>{qiblaAngle}°</b> (janubi-g'arbiy).
            Kompas mavjud bo'lmasa, shimolga qarab {qiblaAngle}° o'ng tomonga buring.
          </div>
        </div>
      </div>
    </div>
  );
};