import { SuralarView } from './SuralarView';
import { DuolarView } from './DuolarView';
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface IbodatViewProps {
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'duolar', label: 'Duolar', icon: '📿', gradient: 'from-purple-500 to-violet-600' },
  { id: 'suralar', label: 'Suralar', icon: '📖', gradient: 'from-amber-500 to-orange-600' },
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

  // Экран категорий (главный)
  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
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