import { SuralarView } from './SuralarView';
import { DuolarView } from './DuolarView';
import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface IbodatViewProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'duolar', label: 'Duolar', icon: '📿', line: 'from-purple-400 to-violet-500' },
  { id: 'suralar', label: 'Suralar', icon: '📖', line: 'from-amber-400 to-orange-500' },
];

export const IbodatView: React.FC<IbodatViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Экран «Duolar»
  if (selectedCategory === 'duolar') {
    return <DuolarView onClose={() => setSelectedCategory(null)} />;
  }

  // Экран «Suralar»
  if (selectedCategory === 'suralar') {
    return <SuralarView onClose={() => setSelectedCategory(null)} />;
  }

  // Главный экран — выбор категории
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
          <h1 className="font-bold text-2xl text-stone-900">🕌 Ibodat</h1>
        </div>
      </div>

      {/* Крупные карточки категорий */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
            >
              <img
                src={`/icons/${cat.id}.png`}
                alt={cat.label}
                className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
              />

              <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                {cat.label}
              </div>

              <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                <ChevronRight className="w-3.5 h-3.5" />
                <span>Ochish</span>
              </div>

              <div className={`mt-4 w-20 h-1 rounded-full bg-linear-to-r ${cat.line}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};