import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Megaphone, 
  PartyPopper, 
  Bus, 
  Home, 
  ShoppingCart, 
  Wrench, 
  Briefcase, 
  AlertTriangle, 
  UtensilsCrossed 
} from 'lucide-react';

interface Section {
  id: string;
  titleUz: string;
  titleRu: string;
  icon: React.ElementType;
  gradient: string;
}

const sections: Section[] = [
  { id: 'news', titleUz: 'Yangiliklar', titleRu: 'Новости', icon: Newspaper, gradient: 'from-blue-500 to-blue-600' },
  { id: 'ads', titleUz: "E'lonlar", titleRu: 'Объявления', icon: Megaphone, gradient: 'from-amber-500 to-orange-500' },
  { id: 'events', titleUz: 'Tadbirlar', titleRu: 'События', icon: PartyPopper, gradient: 'from-pink-500 to-rose-500' },
  { id: 'transport', titleUz: 'Transport', titleRu: 'Транспорт', icon: Bus, gradient: 'from-emerald-500 to-green-600' },
  { id: 'districts', titleUz: 'Mahallalar', titleRu: 'Районы', icon: Home, gradient: 'from-indigo-500 to-violet-600' },
  { id: 'market', titleUz: 'Oldi-sotdi', titleRu: 'Купля-продажа', icon: ShoppingCart, gradient: 'from-orange-500 to-red-500' },
  { id: 'services', titleUz: 'Xizmatlar', titleRu: 'Услуги', icon: Wrench, gradient: 'from-cyan-500 to-teal-600' },
  { id: 'jobs', titleUz: 'Vakansiya', titleRu: 'Вакансии', icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
  { id: 'emergency', titleUz: 'Favqulodda', titleRu: 'Экстренные', icon: AlertTriangle, gradient: 'from-rose-500 to-red-600' },
  { id: 'restaurants', titleUz: 'Restoranlar', titleRu: 'Рестораны и кафе', icon: UtensilsCrossed, gradient: 'from-red-500 to-pink-600' },
];

// Рекламные баннеры (заглушки)
const ads = [
  { id: 1, title: 'Reklama 1', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-purple-600 to-indigo-700' },
  { id: 2, title: 'Reklama 2', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-amber-600 to-orange-700' },
  { id: 3, title: 'Reklama 3', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-emerald-600 to-teal-700' },
];

function App() {
  const [currentAd, setCurrentAd] = useState(0);

  // Автопрокрутка карусели
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100 text-stone-900 flex flex-col">
      {/* Верхняя панель */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              B
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Bekobod</h1>
              <p className="text-[10px] text-stone-500 leading-tight">Shahar portali</p>
            </div>
          </div>
          <div className="text-[10px] text-stone-400 font-medium">
            🇺🇿 UZ
          </div>
        </div>
      </div>

      {/* Карусель рекламы */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl h-48">
          {ads.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 bg-linear-to-br ${ad.gradient} transition-opacity duration-700 flex flex-col items-center justify-center text-white p-6 ${
                index === currentAd ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="text-4xl mb-2">📢</div>
              <h3 className="font-bold text-lg">{ad.title}</h3>
              <p className="text-xs text-white/80 mt-1">{ad.subtitle}</p>
            </div>
          ))}
          
          {/* Индикаторы */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAd(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentAd ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Разделы */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        <h2 className="font-bold text-lg mb-4 flex items-center space-x-2">
          <span>Bo'limlar</span>
          <span className="text-xs font-normal text-stone-400">Bo'limlar / Разделы</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className="group relative bg-white rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 border border-stone-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-stone-900 leading-tight">
                    {section.titleUz}
                  </div>
                  <div className="text-[10px] text-stone-400 leading-tight mt-0.5">
                    {section.titleRu}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Футер */}
      <div className="text-center py-6 text-[10px] text-stone-400">
        © 2026 Bekobod Shahar Portali
      </div>
    </div>
  );
}

export default App;