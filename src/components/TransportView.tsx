import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { transport, TransportCategory } from '../data/transport';

interface TransportViewProps {
  onClose: () => void;
}

const CATEGORY_GRADIENTS: { [key: string]: string } = {
  'Avtobus': 'from-emerald-500 to-green-600',
  'Elektropoyezd': 'from-blue-500 to-indigo-600',
  'Taksi Bekobod — Toshkent': 'from-amber-500 to-orange-600',
};

export const TransportView: React.FC<TransportViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<TransportCategory | null>(null);

  if (selectedCategory) {
    const gradient = CATEGORY_GRADIENTS[selectedCategory.title] || 'from-stone-500 to-stone-700';
    
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${gradient} text-white sticky top-0 z-20 shadow-md`}>
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
                {selectedCategory.items.length} ta ma'lumot
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {selectedCategory.items.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{selectedCategory.icon}</div>
              <p className="text-sm">Ma'lumot tez orada qo'shiladi</p>
            </div>
          ) : (
            selectedCategory.items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <h2 className="font-bold text-base text-stone-900">
                  {item.name}
                </h2>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2 text-stone-700">
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{item.route}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-stone-700">
                    <Clock className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item.schedule}</span>
                  </div>
                  <div className="flex items-start space-x-2 font-semibold text-amber-700">
                    <span className="text-lg">💰</span>
                    <span>{item.price}</span>
                  </div>
                  {item.note && (
                    <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Экран категорий (большие иконки)
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🚌 Transport</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {transport.map((category, index) => {
            const gradient = CATEGORY_GRADIENTS[category.title] || 'from-stone-500 to-stone-700';
            return (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`w-full bg-linear-to-br ${gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                <div className="text-7xl mb-4">{category.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {category.title}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  {category.items.length > 0 
                    ? `${category.items.length} ta ma'lumot` 
                    : "Ma'lumot tez orada"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};