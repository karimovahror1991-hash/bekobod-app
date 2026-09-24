import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { duolar, DuaCategory } from '../data/duolar';

interface DuolarViewProps {
  onClose: () => void;
}

export const DuolarView: React.FC<DuolarViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | null>(null);

  // Экран списка дуа в категории
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-linear-to-b from-purple-50 to-violet-100">
        <div className={`bg-linear-to-br ${selectedCategory.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-white">
                {selectedCategory.icon} {selectedCategory.title}
              </h1>
              <p className="text-xs text-white/80">
                {selectedCategory.duas.length} ta dua
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {selectedCategory.duas.map((dua) => (
            <div
              key={dua.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4"
            >
              <h3 className="font-bold text-lg text-stone-900">
                {dua.title}
              </h3>

              <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-stone-500 mb-1">
                    O'qilishi:
                  </div>
                  <div className="text-sm text-stone-800 italic leading-relaxed">
                    «{dua.transcription}»
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-3">
                  <div className="text-xs font-semibold text-stone-500 mb-1">
                    Tarjimasi:
                  </div>
                  <div className="text-sm text-stone-700 leading-relaxed">
                    {dua.translation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Экран категорий
  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-violet-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">📿 Duolar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {duolar.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-6 flex items-center justify-between shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-5xl">{cat.icon}</div>
                <div className="text-left">
                  <div className="font-bold text-lg text-white">
                    {cat.title}
                  </div>
                  <div className="text-xs text-white/80">
                    {cat.duas.length} ta dua
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};