import { CityTaxiView } from './CityTaxiView';
import { TaxiView } from './TaxiView';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { transport, TransportCategory } from '../data/transport';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface TransportViewProps {
  onClose: () => void;
}

// Маппинг: название категории → имя файла иконки
const CATEGORY_ICONS: { [key: string]: string } = {
  'Avtobus': '/icons/avtobus.png',
  'Elektropoyezd': '/icons/elektropoyezd.png',
  'Taksi Bekobod — Toshkent': '/icons/taksi.png',
  'Shaharlararo taksi': '/icons/taksi.png',
  'Shahar taksi': '/icons/taksi.png',
};

// Маппинг: название → цвет градиентной полоски
const CATEGORY_LINES: { [key: string]: string } = {
  'Avtobus': 'from-emerald-400 to-green-500',
  'Elektropoyezd': 'from-blue-400 to-indigo-500',
  'Taksi Bekobod — Toshkent': 'from-amber-400 to-orange-500',
  'Shaharlararo taksi': 'from-amber-400 to-orange-500',
  'Shahar taksi': 'from-amber-400 to-orange-500',
};

export const TransportView: React.FC<TransportViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<TransportCategory | null>(null);
  const [showTaxi, setShowTaxi] = useState(false);
  const [cityTaxiCount, setCityTaxiCount] = useState(0);
  const [taxiRidesCount, setTaxiRidesCount] = useState(0);
useSwipeBack(() => {
  if (selectedCategory) { setSelectedCategory(null); return; }
  onClose();
});
  // Загрузка счётчиков из БД
  useEffect(() => {
    fetch('https://bekobod-app-1.onrender.com/api/city-taxi/list')
      .then(r => r.json())
      .then(d => setCityTaxiCount((d.taxis || []).length))
      .catch(() => {});

    fetch('https://bekobod-app-1.onrender.com/api/taxi/list')
      .then(r => r.json())
      .then(d => setTaxiRidesCount((d.rides || []).length))
      .catch(() => {});
  }, []);

  const handleCategoryClick = (category: TransportCategory) => {
    if (category.title === 'Shahar taksi') {
      setSelectedCategory(category);
      return;
    }
    if (category.title.toLowerCase().includes('taksi')) {
      setShowTaxi(true);
      return;
    }
    setSelectedCategory(category);
  };

  // === ЭКРАН: Shahar taksi ===
  if (selectedCategory?.title === 'Shahar taksi') {
    return <CityTaxiView onClose={() => setSelectedCategory(null)} />;
  }

  // === ЭКРАН: Междугороднее такси ===
  if (showTaxi) {
    return (
      <TaxiView
        onClose={() => {
          setShowTaxi(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

  // === ЭКРАН: Список items категории ===
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={CATEGORY_ICONS[selectedCategory.title] || '/icons/avtobus.png'}
                alt=""
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg text-stone-900">{selectedCategory.title}</h1>
                <p className="text-xs text-stone-400">{selectedCategory.items.length} ta ma'lumot</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {selectedCategory.items.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <img
                src={CATEGORY_ICONS[selectedCategory.title] || '/icons/avtobus.png'}
                alt=""
                className="w-24 h-24 object-contain mx-auto mb-4 opacity-50"
              />
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

  // === ГЛАВНЫЙ ЭКРАН ===
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
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
        <div className="space-y-6">
          {transport.map((category, index) => {
            const iconSrc = CATEGORY_ICONS[category.title] || '/icons/avtobus.png';
            const line = CATEGORY_LINES[category.title] || 'from-stone-400 to-stone-600';

            // Счётчик для подписи
            let countText = '';
            if (category.title === 'Shahar taksi') {
              countText = `${cityTaxiCount} ta xizmat`;
            } else if (category.title === 'Shaharlararo taksi') {
              countText = `${taxiRidesCount} ta reys`;
            } else if (category.items.length > 0) {
              countText = `${category.items.length} ta ma'lumot`;
            } else {
              countText = "Ma'lumot tez orada";
            }

            return (
              <button
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
              >
                <img
                  src={iconSrc}
                  alt={category.title}
                  className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                />

                <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                  {category.title}
                </div>

                <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{countText}</span>
                </div>

                <div className={`mt-4 w-20 h-1 rounded-full bg-linear-to-r ${line}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};