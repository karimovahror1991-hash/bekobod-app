import { MedListView } from './MedListView';
import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';

interface TibbiyotViewProps {
  onClose: () => void;
}

const CATEGORIES = [
  {
    id: 'dorixona',
    label: 'Dorixonalar',
    icon: '💊',
    line: 'from-emerald-400 to-green-500',
  },
  {
    id: 'kasalxona',
    label: 'Kasalxonalar',
    icon: '🏥',
    line: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'tez_yordam',
    label: 'Tez yordam',
    icon: '🚑',
    line: 'from-red-400 to-rose-500',
  },
];

export const TibbiyotView: React.FC<TibbiyotViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // === ЭКРАН «Dorixonalar» ===
  if (selectedCategory === 'dorixona') {
    return <MedListView onClose={() => setSelectedCategory(null)} type="dorixona" />;
  }

  // === ЭКРАН «Kasalxonalar» ===
  if (selectedCategory === 'kasalxona') {
    return <MedListView onClose={() => setSelectedCategory(null)} type="kasalxona" />;
  }

  // === ЭКРАН «Tez yordam» ===
  if (selectedCategory === 'tez_yordam') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-red-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/icons/tez_yordam.png" alt="" className="w-8 h-8 object-contain" />
              <h1 className="font-bold text-lg text-stone-900">Tez yordam</h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* 103 */}
          <a
            href="tel:103"
            className="w-full bg-white rounded-3xl pt-6 pb-6 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98]"
          >
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
              <Phone className="w-9 h-9" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 mb-1">103</div>
            <div className="text-sm text-stone-500">Tez tibbiy yordam</div>
            <div className="mt-4 w-20 h-1 rounded-full bg-linear-to-r from-red-400 to-rose-500" />
          </a>

          {/* 112 */}
          <a
            href="tel:112"
            className="w-full bg-white rounded-3xl pt-6 pb-6 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all active:scale-[0.98]"
          >
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
              <Phone className="w-9 h-9" />
            </div>
            <div className="text-3xl font-extrabold text-stone-900 mb-1">112</div>
            <div className="text-sm text-stone-500">Yagona favqulodda xizmat</div>
            <div className="mt-4 w-20 h-1 rounded-full bg-linear-to-r from-blue-400 to-indigo-500" />
          </a>
        </div>
      </div>
    );
  }

  // === ГЛАВНЫЙ ЭКРАН — ВЫБОР КАТЕГОРИИ ===
  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🏥 Tibbiyot</h1>
        </div>
      </div>

      {/* Список категорий — крупные карточки */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
            >
              {/* Иконка */}
              <img
                src={`/icons/${cat.id}.png`}
                alt={cat.label}
                className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
              />

              {/* Название */}
              <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                {cat.label}
              </div>

              {/* Градиентная полоска */}
              <div className={`mt-4 w-20 h-1 rounded-full bg-linear-to-r ${cat.line}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};