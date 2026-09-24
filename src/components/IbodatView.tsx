import { QiblaView } from './QiblaView';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronRight, Clock } from 'lucide-react';

interface IbodatViewProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'namoz', label: 'Namoz vaqtlari', icon: '🕌', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'qibla', label: 'Qibla', icon: '🧭', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'duolar', label: 'Duolar', icon: '📿', gradient: 'from-purple-500 to-violet-600' },
  { id: 'suralar', label: 'Suralar', icon: '📖', gradient: 'from-amber-500 to-orange-600' },
  { id: 'hayitlar', label: 'Hayitlar', icon: '🎉', gradient: 'from-rose-500 to-pink-600' },
  { id: 'ramazon', label: 'Ramazon', icon: '📅', gradient: 'from-cyan-500 to-blue-600' },
];

export const IbodatView: React.FC<IbodatViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prayer, setPrayer] = useState<any>(null);
  const [prayerLoading, setPrayerLoading] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  useEffect(() => {
    if (selectedCategory === 'namoz') {
      setPrayerLoading(true);
      fetch(`${API_URL}/api/prayer-times`)
        .then(res => res.json())
        .then(data => setPrayer(data))
        .catch(err => console.error(err))
        .finally(() => setPrayerLoading(false));
    }
  }, [selectedCategory]);

    // Экран «Qibla»
  if (selectedCategory === 'qibla') {
    return <QiblaView onClose={() => setSelectedCategory(null)} />;
  }

    // Экран «Namoz vaqtlari»
  if (selectedCategory === 'namoz') {
    const catInfo = CATEGORIES.find(c => c.id === 'namoz');
    const prayerNames = [
      { key: 'Fajr', label: 'Bomdod', icon: '🌅' },
      { key: 'Sunrise', label: 'Quyosh chiqishi', icon: '☀️' },
      { key: 'Dhuhr', label: 'Peshin', icon: '🌞' },
      { key: 'Asr', label: 'Asr', icon: '🌤' },
      { key: 'Maghrib', label: 'Shom', icon: '🌆' },
      { key: 'Isha', label: 'Xufton', icon: '🌙' },
    ];

    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-white">🕌 Namoz vaqtlari</h1>
              <p className="text-xs text-white/80">Bekobod shahri</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {prayerLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : prayer ? (
            <>
              {/* Дата */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-2">
                <div className="text-center text-stone-700 font-bold">
                  {prayer.gregorian?.date}
                </div>
                <div className="text-center text-sm text-emerald-700 font-semibold">
                  {prayer.hijri?.day} {prayer.hijri?.month} {prayer.hijri?.year} Ҳ
                </div>
              </div>

              {/* Времена намаза */}
              <div className="space-y-3">
                {prayerNames.map((p) => (
                  <div
                    key={p.key}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{p.icon}</div>
                      <div>
                        <div className="font-bold text-base text-stone-900">
                          {p.label}
                        </div>
                        <div className="text-xs text-stone-400">
                          {p.key}
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700">
                      {prayer.timings?.[p.key]}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">Ma'lumot yuklanmadi</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Заглушка для остальных категорий
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-xl text-white">
              {catInfo?.icon} {catInfo?.label}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-stone-400">
          <div className="text-6xl mb-4">{catInfo?.icon}</div>
          <p className="text-sm">Ma'lumot tez orada qo'shiladi</p>
        </div>
      </div>
    );
  }

  // Экран категорий (большие иконки)
  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🕌 Ibodat</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
            >
              <div className="text-7xl mb-4">{cat.icon}</div>
              <div className="font-bold text-xl text-white text-center leading-tight">
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};