import { TaxiView } from './TaxiView';
import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { transport, TransportCategory } from '../data/transport';

interface TransportViewProps {
  onClose: () => void;
}

export const TransportView: React.FC<TransportViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<TransportCategory | null>(null);
  const [showTaxi, setShowTaxi] = useState(false);
    if (showTaxi) {
    return <TaxiView onClose={() => setShowTaxi(false)} />;
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </button>
            <h1 className="font-bold text-lg text-stone-900">
              {selectedCategory.icon} {selectedCategory.title}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                   {selectedCategory.title.includes('Taksi') ? (
            <button
              onClick={() => setShowTaxi(true)}
              className="w-full bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-6 shadow-lg active:scale-95 transition-transform"
            >
              <div className="text-4xl mb-2">🚕</div>
              <div className="font-bold text-lg">Taksi reyslarini ko'rish</div>
              <div className="text-xs text-white/80 mt-1">
                Haydovchilar va yo'lovchilar uchun
              </div>
            </button>
          ) : selectedCategory.items.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              Ma'lumot tez orada qo'shiladi
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

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <h1 className="font-bold text-lg text-stone-900">Transport</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {transport.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category)}
            className="w-full bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 border border-stone-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{category.icon}</div>
              <div className="text-left">
                <div className="font-bold text-base text-stone-900">
                  {category.title}
                </div>
                <div className="text-xs text-stone-400">
                  {category.items.length > 0 
                    ? `${category.items.length} ta ma'lumot` 
                    : 'Ma\'lumot tez orada'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
        ))}
      </div>
    </div>
  );
};