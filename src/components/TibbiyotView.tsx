import { ShifokorlarView } from './ShifokorlarView';
import React, { useState } from 'react';
import { ArrowLeft, Loader2, ChevronRight, Phone, MapPin, User, Clock } from 'lucide-react';

interface TibbiyotViewProps {
  onClose: () => void;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  address: string;
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  isRoundTheClock: boolean;
}

const CATEGORIES = [
  { id: 'shifokorlar', label: 'Shifokorlar', icon: '🏥', gradient: 'from-rose-500 to-red-600' },
  { id: 'dorixonalar', label: 'Dorixonalar', icon: '💊', gradient: 'from-emerald-500 to-green-600' },
  { id: 'kasalxonalar', label: 'Kasalxonalar', icon: '🏨', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'tez-yordam', label: 'Tez yordam', icon: '🚑', gradient: 'from-red-500 to-rose-600' },
];

export const TibbiyotView: React.FC<TibbiyotViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Экран «Shifokorlar»
  if (selectedCategory === 'shifokorlar') {
    return <ShifokorlarView onClose={() => setSelectedCategory(null)} />;
  }
  // Экран «Tez yordam» (простой список номеров)
  if (selectedCategory === 'tez-yordam') {
    return (
      <div className="min-h-screen bg-linear-to-b from-rose-50 to-red-100">
        <div className="bg-linear-to-br from-red-600 to-rose-700 text-white sticky top-0 z-20 shadow-md">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-xl text-white">🚑 Tez yordam</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <a
              href="tel:103"
              className="w-full py-5 bg-linear-to-br from-red-500 to-rose-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95 text-2xl"
            >
              <Phone className="w-7 h-7" />
              <span>103</span>
            </a>
            <p className="text-center text-sm text-stone-500">
              Tez tibbiy yordam
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <a
              href="tel:112"
              className="w-full py-5 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95 text-2xl"
            >
              <Phone className="w-7 h-7" />
              <span>112</span>
            </a>
            <p className="text-center text-sm text-stone-500">
              Yagona favqulodda xizmat
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Заглушка для остальных категорий
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-linear-to-b from-rose-50 to-red-100">
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

  // Экран категорий
  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50 to-red-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🏥 Tibbiyot</h1>
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