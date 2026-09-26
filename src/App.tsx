import { MiniOyinlarView } from './components/MiniOyinlarView';
import { OldiSotdiView } from './components/OldiSotdiView';
import { TarjimonView } from './components/TarjimonView';
import { TibbiyotView } from './components/TibbiyotView';
import { IbodatView } from './components/IbodatView';
import { EventsView } from './components/EventsView';
import { NewsView } from './components/NewsView';
import { RestaurantsView } from './components/RestaurantsView';
import { JobsView } from './components/JobsView';
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets } from 'lucide-react';
import {
  Newspaper,
  PartyPopper,
  Bus,
  Wrench,
  Briefcase,
  UtensilsCrossed,
  Phone,
  Mail,
  Moon,
  Heart,
  Languages,
  ShoppingBag,
  Gamepad2
} from 'lucide-react';
import { EmergencyView } from './components/EmergencyView';
import { TransportView } from './components/TransportView';
import { ServicesView } from './components/ServicesView';
import { AdminView } from './components/AdminView';

interface Section {
  id: string;
  titleUz: string;
  titleRu: string;
  icon: React.ElementType;
  gradient: string;
}

const sections: Section[] = [
  { id: 'news', titleUz: 'Yangiliklar', titleRu: 'Новости', icon: Newspaper, gradient: 'from-blue-500 to-blue-600' },
  { id: 'ibodat', titleUz: 'Ibodat', titleRu: 'Поклонение', icon: Moon, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'events', titleUz: 'Tadbirlar', titleRu: 'События', icon: PartyPopper, gradient: 'from-pink-500 to-rose-500' },
  { id: 'transport', titleUz: 'Transport', titleRu: 'Транспорт', icon: Bus, gradient: 'from-emerald-500 to-green-600' },
  { id: 'admin', titleUz: 'Administrator', titleRu: 'Администратор', icon: Mail, gradient: 'from-indigo-500 to-violet-600' },
  { id: 'tibbiyot', titleUz: 'Tibbiyot', titleRu: 'Медицина', icon: Heart, gradient: 'from-rose-500 to-red-600' },
  { id: 'services', titleUz: 'Xizmatlar', titleRu: 'Услуги', icon: Wrench, gradient: 'from-cyan-500 to-teal-600' },
  { id: 'jobs', titleUz: 'Vakansiya', titleRu: 'Вакансии', icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
  { id: 'emergency', titleUz: 'Shahar telefonlari', titleRu: 'Справочная служба', icon: Phone, gradient: 'from-rose-500 to-red-600' },
  { id: 'restaurants', titleUz: 'Restoran va kafelar', titleRu: 'Рестораны и кафе', icon: UtensilsCrossed, gradient: 'from-red-500 to-pink-600' },
  { id: 'tarjimon', titleUz: 'Tarjimon', titleRu: 'Переводчик', icon: Languages, gradient: 'from-cyan-500 to-blue-600' },
  { id: 'oldi_sotdi', titleUz: 'Oldi sotdi', titleRu: 'Купля-продажа', icon: ShoppingBag, gradient: 'from-amber-500 to-orange-600' },
  { id: 'mini_oyinlar', titleUz: "Mini o'yinlar", titleRu: 'Мини-игры', icon: Gamepad2, gradient: 'from-purple-500 to-indigo-600' },
  ];

const ads = [
  { id: 1, title: 'Reklama 1', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-purple-600 to-indigo-700' },
  { id: 2, title: 'Reklama 2', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-amber-600 to-orange-700' },
  { id: 3, title: 'Reklama 3', subtitle: "Bu yerda sizning reklamangiz bo'lishi mumkin", gradient: 'from-emerald-600 to-teal-700' },
];

function App() {
  const [currentAd, setCurrentAd] = useState(0);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
    const [badges, setBadges] = useState<{ news: number; events: number; oldi_sotdi: number }>({ news: 0, events: 0, oldi_sotdi: 0 });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.initDataUnsafe?.user?.id) {
      setUserId(tg.initDataUnsafe.user.id);
    }
      
    // Отключаем свайп вниз для закрытия приложения
    if (tg?.disableVerticalSwipes) {
      tg.disableVerticalSwipes();
    }

    // Расширяем на весь экран
    if (tg?.expand) {
      tg.expand();
    }
  }, []);

  useEffect(() => {
    const lat = 40.22;
    const lon = 69.22;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=2`)
      .then((res) => res.json())
      .then((data) => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка погоды:', err);
        setWeatherLoading(false);
      });
  }, []);
  // Загрузка бейджей
useEffect(() => {
  if (!userId) return;

  const loadBadges = async () => {
    try {
      const sections = ['news', 'events', 'oldi_sotdi'];
      const results: any = {};
      for (const s of sections) {
        const res = await fetch(`https://bekobod-app-1.onrender.com/api/badge/${s}?userId=${userId}`);
        const data = await res.json();
        results[s] = data.count || 0;
      }
      setBadges(results);
    } catch (err) {
      console.error(err);
    }
  };
  // Отметить раздел как просмотренный
  useEffect(() => {
    if (!userId || !activeSection) return;

    const sectionsMap: { [key: string]: string } = {
      news: 'news',
      events: 'events',
      oldi_sotdi: 'oldi_sotdi',
    };

    const section = sectionsMap[activeSection];
    if (!section) return;

    fetch(`https://bekobod-app-1.onrender.com/api/badge/${section}/seen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(() => {
        setBadges(prev => ({ ...prev, [section]: 0 }));
      })
      .catch(() => {});
  }, [activeSection, userId]);
  loadBadges();
  const interval = setInterval(loadBadges, 60000);
  return () => clearInterval(interval);
}, [userId]);
  // Авто-переключение рекламы каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
   const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-blue-300" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-600" />;
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  // Прогноз по 3 часа на сегодня
  const getThreeHourForecast = (weather: any) => {
    if (!weather?.hourly?.time || !weather?.hourly?.temperature_2m) return [];

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // "2026-09-25"
    const currentHour = now.getHours();

    const slots: { time: string; temp: number; code: number }[] = [];

    weather.hourly.time.forEach((t: string, i: number) => {
      const date = new Date(t);
      const dateStr = t.split('T')[0];
      const hour = date.getHours();

      // только сегодня, каждый 3-й час, начиная с ближайшего прошедшего/текущего
      if (dateStr === today && hour % 3 === 0 && hour >= currentHour - 1) {
        slots.push({
          time: t,
          temp: Math.round(weather.hourly.temperature_2m[i]),
          code: weather.hourly.weather_code[i],
        });
      }
    });

    return slots;
  };

  // Экран разделов
  
  if (activeSection === 'emergency') {
    return <EmergencyView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'transport') {
    return <TransportView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'admin') {
    return <AdminView onClose={() => setActiveSection(null)} userId={userId} />;
  }
  if (activeSection === 'jobs') {
    return <JobsView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'restaurants') {
    return <RestaurantsView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'news') {
    return <NewsView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'events') {
    return <EventsView onClose={() => setActiveSection(null)} userId={userId} />;
  }
  if (activeSection === 'ibodat') {
    return <IbodatView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'tibbiyot') {
    return <TibbiyotView onClose={() => setActiveSection(null)} />;
  }
    if (activeSection === 'services') {
    return <ServicesView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'tarjimon') {
    return <TarjimonView onClose={() => setActiveSection(null)} />;
  }
    if (activeSection === 'oldi_sotdi') {
    return <OldiSotdiView onClose={() => setActiveSection(null)} userId={userId} />;
  }
    if (activeSection === 'mini_oyinlar') {
    return <MiniOyinlarView onClose={() => setActiveSection(null)} />;
  }
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

            {/* Погода */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-4">
        <div className="bg-linear-to-br from-sky-400 to-blue-600 rounded-3xl p-4 shadow-xl text-white">
          {weatherLoading ? (
            <div className="text-center py-4 text-white/80 text-sm">Yuklanmoqda...</div>
          ) : weather ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="scale-90">
                    {getWeatherIcon(weather.current?.weather_code || 0)}
                  </div>
                  <div>
                    <div className="text-3xl font-bold leading-none">
                      {Math.round(weather.current?.temperature_2m || 0)}°
                    </div>
                    <div className="text-[10px] text-white/80 mt-0.5 whitespace-nowrap">
                      ↑{Math.round(weather.daily?.temperature_2m_max?.[0] || 0)}° ↓
                      {Math.round(weather.daily?.temperature_2m_min?.[0] || 0)}°
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-white/80 leading-tight px-2">
                  <div className="font-semibold">
                    {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-white/60">
                    {new Date().toLocaleDateString('uz-UZ', { weekday: 'short' })}
                  </div>
                </div>

                <div className="text-right text-[10px] text-white/90 space-y-0.5 shrink-0">
                  <div className="flex items-center justify-end space-x-1">
                    <Droplets className="w-3 h-3" />
                    <span>{weather.current?.relative_humidity_2m || 0}%</span>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <Wind className="w-3 h-3" />
                    <span>{weather.current?.wind_speed_10m || 0} km/h</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-1 pt-3 border-t border-white/20">
                {getThreeHourForecast(weather).map((slot, i) => {
                  const time = new Date(slot.time).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <span className="text-[9px] text-white/70">{time}</span>
                      <div className="scale-[0.55] my-0.5">
                        {getWeatherIcon(slot.code)}
                      </div>
                      <span className="text-[10px] font-semibold">{slot.temp}°</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-white/80 text-sm">—</div>
          )}
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
            const badgeCount = badges[section.id as keyof typeof badges] || 0;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="group relative bg-white rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 border border-stone-100"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  {badgeCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </div>
                  )}
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