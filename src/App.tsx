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
  color: string;
}

const sections: Section[] = [
  { id: 'news', titleUz: 'Yangiliklar', titleRu: 'Новости', icon: Newspaper, color: 'bg-blue-500' },
  { id: 'ads', titleUz: "E'lonlar", titleRu: 'Объявления', icon: Megaphone, color: 'bg-amber-500' },
  { id: 'events', titleUz: 'Tadbirlar', titleRu: 'События', icon: PartyPopper, color: 'bg-pink-500' },
  { id: 'transport', titleUz: 'Transport', titleRu: 'Транспорт', icon: Bus, color: 'bg-emerald-500' },
  { id: 'districts', titleUz: 'Mahallalar', titleRu: 'Районы', icon: Home, color: 'bg-indigo-500' },
  { id: 'market', titleUz: 'Oldi-sotdi', titleRu: 'Купля-продажа', icon: ShoppingCart, color: 'bg-orange-500' },
  { id: 'services', titleUz: 'Xizmatlar', titleRu: 'Услуги', icon: Wrench, color: 'bg-cyan-500' },
  { id: 'jobs', titleUz: 'Vakansiya', titleRu: 'Вакансии', icon: Briefcase, color: 'bg-violet-500' },
  { id: 'emergency', titleUz: 'Favqulodda', titleRu: 'Экстренные', icon: AlertTriangle, color: 'bg-rose-500' },
    { id: 'restaurants', titleUz: 'Restoranlar', titleRu: 'Рестораны и кафе', icon: UtensilsCrossed, color: 'bg-red-500' },
];

function App() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col">
      {/* Билборд (реклама) */}
      <div className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 sm:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            Bekobod Shahar Portali
          </h1>
          <p className="text-sm text-amber-100">
            Shaharimiz haqida barcha ma'lumotlar bir joyda
          </p>
        </div>
      </div>

      {/* Рекламный баннер */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 text-center">
          <div className="bg-stone-100 rounded-xl p-8 border-2 border-dashed border-stone-300">
            <p className="text-stone-400 text-sm font-medium">
              📢 Reklama uchun joy
            </p>
            <p className="text-stone-300 text-xs mt-1">
              Bu yerda sizning reklamangiz bo'lishi mumkin
            </p>
          </div>
        </div>
      </div>

      {/* Разделы */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">
          Bo'limlar
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-md hover:border-amber-300 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-stone-900 leading-tight">
                    {section.titleUz}
                  </div>
                  <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                    {section.titleRu}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;