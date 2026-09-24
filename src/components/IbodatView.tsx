import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Clock, Calendar } from 'lucide-react';

interface IbodatViewProps {
  onClose: () => void;
}

interface PrayerTimes {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  hijri: {
    day: string;
    month: string;
    year: string;
  };
  gregorian: {
    date: string;
    weekday: string;
  };
}

export const IbodatView: React.FC<IbodatViewProps> = ({ onClose }) => {
  const [prayer, setPrayer] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  useEffect(() => {
    const loadPrayerTimes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/prayer-times`);
        const data = await res.json();
        setPrayer(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrayerTimes();
  }, []);

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
      {/* Заголовок */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🕌 Ibodat</h1>
            <p className="text-xs text-white/80">Namoz vaqtlari</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Дата */}
        {prayer && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-stone-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">{prayer.gregorian.date}</span>
              <span className="text-stone-400">•</span>
              <span className="text-sm">{prayer.gregorian.weekday}</span>
            </div>
            <div className="text-center text-sm text-emerald-700 font-semibold">
              {prayer.hijri.day} {prayer.hijri.month} {prayer.hijri.year} Ҳ
            </div>
          </div>
        )}

        {/* Времена намаза */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : prayer ? (
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
                  {prayer.timings[p.key as keyof typeof prayer.timings]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-400">
            <p className="text-sm">Ma'lumot yuklanmadi</p>
          </div>
        )}

        {/* Примечание */}
        <div className="bg-emerald-50 rounded-3xl p-4 text-xs text-emerald-800 text-center">
          Vaqtlar Bekobod shahri uchun hisoblangan
        </div>
      </div>
    </div>
  );
};