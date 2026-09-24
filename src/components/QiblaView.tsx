import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

interface QiblaViewProps {
  onClose: () => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ onClose }) => {
  // Координаты Бекабада и Мекки
  const bekabadLat = 40.22;
  const bekabadLon = 69.22;
  const mekkaLat = 21.4225;
  const mekkaLon = 39.8262;

  // Формула расчета угла на Мекку
  const calculateQibla = () => {
    const lat1 = (bekabadLat * Math.PI) / 180;
    const lat2 = (mekkaLat * Math.PI) / 180;
    const lonDiff = ((mekkaLon - bekabadLon) * Math.PI) / 180;

    const x = Math.sin(lonDiff);
    const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lonDiff);
    const qibla = (Math.atan2(x, y) * 180) / Math.PI;
    return Math.round((qibla + 360) % 360);
  };

  const qiblaAngle = calculateQibla();

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
            <h1 className="font-bold text-xl text-white">🧭 Qibla</h1>
            <p className="text-xs text-white/80">Makka yo'nalishi</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Компас с углом */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            {/* Круг компаса */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50"></div>
            
            {/* Метки сторон света */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-stone-700">N</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-stone-700">S</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-700">W</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-700">E</div>
            
            {/* Стрелка на Мекку */}
            <div
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                transform: `translate(-50%, -100%) rotate(${qiblaAngle}deg)`,
                transformOrigin: 'bottom center',
                height: '100px',
                width: '4px',
                marginTop: '-100px',
              }}
            >
              <div className="w-full h-full bg-linear-to-t from-blue-600 to-emerald-500 rounded-full relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            </div>
            
            {/* Центральная точка */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-stone-800 rounded-full border-2 border-white shadow-lg"></div>
          </div>

          {/* Угол */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-700 mb-2">
              {qiblaAngle}°
            </div>
            <div className="text-sm text-stone-600">
              Makka yo'nalishi
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-3">
          <h2 className="font-bold text-lg text-stone-900 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Qanday foydalanish kerak?</span>
          </h2>
          <ol className="space-y-2 text-sm text-stone-700 list-decimal list-inside">
            <li>Telefoningizni tekis tuting</li>
            <li>Shimol (N) tomonini aniqlang</li>
            <li>Soat mili bo'yicha <b>{qiblaAngle}°</b> ga buriling</li>
            <li>Shu yo'nalishda Makka joylashgan</li>
          </ol>
        </div>

        {/* Карта */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
          <div className="bg-blue-50 p-3 text-center text-xs font-semibold text-blue-800">
            Bekobod → Makka
          </div>
          <img
            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-blue(${bekabadLon},${bekabadLat}),pin-s-red(${mekkaLon},${mekkaLat})/auto/600x400?access_token=pk.eyJ1IjoiZGVtb2tleSIsImEiOiJja2R1bW15In0.demo`}
            alt="Bekobod - Makka"
            className="w-full"
            onError={(e) => {
              // Если карта не загрузилась — показываем заглушку
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'p-8 text-center text-stone-400 text-sm';
                fallback.innerHTML = '🗺️ Xarita yuklanmadi<br/>Bekobod → Makka';
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        {/* Примечание */}
        <div className="bg-blue-50 rounded-3xl p-4 text-xs text-blue-800 text-center">
          Hisoblash Bekobod shahri koordinatalari asosida (40.22°N, 69.22°E)
        </div>
      </div>
    </div>
  );
};