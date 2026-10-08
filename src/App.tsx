import { CommentsView } from './components/CommentsView';
import { ShopsView } from './components/ShopsView';
import { DonateView } from './components/DonateView';
import { MiniOyinlarView } from './components/MiniOyinlarView';
import { OldiSotdiView } from './components/OldiSotdiView';
import { TibbiyotView } from './components/TibbiyotView';
import { IbodatView } from './components/IbodatView';
import { EventsView } from './components/EventsView';
import { NewsView } from './components/NewsView';
import { RestaurantsView } from './components/RestaurantsView';
import { JobsView } from './components/JobsView';
import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Droplets, Moon } from 'lucide-react';
import {
  Newspaper,
  PartyPopper,
  Bus,
  Wrench,
  Briefcase,
  UtensilsCrossed,
  Phone,
  Heart,
  ShoppingBag,
  Gamepad2,
  Handshake,
  Store
} from 'lucide-react';
import { EmergencyView } from './components/EmergencyView';
import { TransportView } from './components/TransportView';
import { ServicesView } from './components/ServicesView';


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
  { id: 'restaurants', titleUz: 'Restoran va kafelar', titleRu: 'Рестораны и кафе', icon: UtensilsCrossed, gradient: 'from-red-500 to-pink-600' },
  { id: 'transport', titleUz: 'Transport', titleRu: 'Транспорт', icon: Bus, gradient: 'from-emerald-500 to-green-600' },
  { id: 'tibbiyot', titleUz: 'Tibbiyot', titleRu: 'Медицина', icon: Heart, gradient: 'from-rose-500 to-red-600' },
  { id: 'shops', titleUz: "Do'konlar va xizmatlar", titleRu: 'Магазины и услуги', icon: Store, gradient: 'from-teal-500 to-emerald-600' },
  { id: 'oldi_sotdi', titleUz: 'Oldi sotdi', titleRu: 'Купля-продажа', icon: ShoppingBag, gradient: 'from-amber-500 to-orange-600' },
  { id: 'services', titleUz: "Xizmat ko'rsatish", titleRu: 'Услуги', icon: Wrench, gradient: 'from-cyan-500 to-teal-600' },
  { id: 'jobs', titleUz: 'Vakansiya', titleRu: 'Вакансии', icon: Briefcase, gradient: 'from-violet-500 to-purple-600' },
  { id: 'emergency', titleUz: 'Shahar telefonlari', titleRu: 'Справочная служба', icon: Phone, gradient: 'from-rose-500 to-red-600' },
  { id: 'events', titleUz: 'Tadbirlar', titleRu: 'События', icon: PartyPopper, gradient: 'from-pink-500 to-rose-500' },
  { id: 'mini_oyinlar', titleUz: "Mini o'yinlar", titleRu: 'Мини-игры', icon: Gamepad2, gradient: 'from-purple-500 to-indigo-600' },
  { id: 'donate', titleUz: "Loyihani qo'llab-quvvatlash", titleRu: 'Поддержать проект', icon: Handshake, gradient: 'from-emerald-500 to-teal-600' },
];

// ⚙️ ФЛАГ: показывать ли блок рекламы на главном экране
const SHOW_ADS = false;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const screen = urlParams.get('screen');
  const announcementId = urlParams.get('announcement_id');

  if (screen === 'comments' && announcementId) {
    return <CommentsView announcementId={Number(announcementId)} />;
  }
  const [currentAd, setCurrentAd] = useState(0);
  const [ads, setAds] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [badges, setBadges] = useState<{ news: number; events: number; oldi_sotdi: number }>({ news: 0, events: 0, oldi_sotdi: 0 });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (user?.id) {
      setUserId(user.id);

      fetch('https://bekobod-app-1.onrender.com/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData: tg?.initData || '',
        }),
      }).catch(() => {});
    }

    if (tg?.disableVerticalSwipes) tg.disableVerticalSwipes();
    if (tg?.expand) tg.expand();
    if (tg?.enableClosingConfirmation) tg.enableClosingConfirmation();
  }, []);

  useEffect(() => {
    const lat = 40.22;
    const lon = 69.22;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`)
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

  useEffect(() => {
    if (!userId) return;

    const loadBadges = async () => {
      try {
        const sectionsToLoad = ['news', 'events', 'oldi_sotdi'];
        const results: any = {};
        for (const s of sectionsToLoad) {
          const res = await fetch(`https://bekobod-app-1.onrender.com/api/badge/${s}?userId=${userId}`);
          const data = await res.json();
          results[s] = data.count || 0;
        }
        setBadges(results);
      } catch (err) {
        console.error(err);
      }
    };

    loadBadges();
    const interval = setInterval(loadBadges, 60000);
    return () => clearInterval(interval);
  }, [userId]);

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

  useEffect(() => {
    if (!SHOW_ADS) return;
    fetch('https://bekobod-app-1.onrender.com/api/ads/list')
      .then((res) => res.json())
      .then((data) => setAds(data.ads || []))
      .catch((err) => console.error('Ads error:', err));
  }, []);

  useEffect(() => {
    if (!SHOW_ADS || ads.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const getWeatherIcon = (code: number, hour?: number) => {
    const isNight = hour !== undefined && (hour >= 21 || hour < 6);

    if (code === 0 || code === 1) {
      return isNight
        ? <Moon className="w-8 h-8 text-blue-200 drop-shadow-lg" />
        : <Sun className="w-8 h-8 text-yellow-300 drop-shadow-lg" />;
    }
    if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-white drop-shadow-lg" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-8 h-8 text-stone-100 drop-shadow-lg" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-white drop-shadow-lg" />;
    if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-white drop-shadow-lg" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-white drop-shadow-lg" />;
    return isNight
      ? <Moon className="w-8 h-8 text-blue-200 drop-shadow-lg" />
      : <Sun className="w-8 h-8 text-yellow-300 drop-shadow-lg" />;
  };

  if (activeSection === 'emergency') {
    return <EmergencyView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'transport') {
    return <TransportView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'jobs') {
    return <JobsView onClose={() => setActiveSection(null)} userId={userId} />;
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
  if (activeSection === 'oldi_sotdi') {
    return <OldiSotdiView onClose={() => setActiveSection(null)} userId={userId} />;
  }
  if (activeSection === 'shops') {
    return <ShopsView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'mini_oyinlar') {
    return <MiniOyinlarView onClose={() => setActiveSection(null)} />;
  }
  if (activeSection === 'donate') {
    return <DonateView onClose={() => setActiveSection(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
     {/* ===== ШАПКА с фото города, логотипом и погодой ===== */}
<div className="relative overflow-hidden">
  {/* Фото города на фоне (общее для всей шапки) */}
  <img
    src="/bekobod-city.jpg"
    alt="Bekobod"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Тёмно-синий градиент поверх всего фото — ОДИН для шапки и погоды */}
  <div className="absolute inset-0 bg-linear-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90" />

  {/* Верхняя часть: логотип + название + ветер */}
  <div className="relative max-w-2xl mx-auto px-4 py-4 flex items-center gap-3 text-white">
    <img
      src="/logo.png"
      alt="B"
      className="w-12 h-12 rounded-2xl shadow-lg shrink-0 object-cover"
    />

    <div className="flex-1 min-w-0">
      <h1 className="font-bold text-base leading-tight">
        Bekobod Shahar Portali
      </h1>
    </div>

    <div className="text-right text-[10px] font-bold space-y-1 shrink-0">
      <div className="flex items-center justify-end gap-1">
        <Droplets className="w-3 h-3" />
        <span>{weather?.current?.relative_humidity_2m || 0}%</span>
      </div>
      <div className="flex items-center justify-end gap-1">
        <Wind className="w-3 h-3" />
        <span>{weather?.current?.wind_speed_10m || 0} km/h</span>
      </div>
    </div>
  </div>

  {/* Нижняя часть: 7 дней погоды — на ТОМ ЖЕ фоне, без синего */}
  {weather && (
    <div className="relative border-t border-white/20">
      <div className="max-w-2xl mx-auto px-2 py-3 flex justify-between gap-0.5">
        {weather.daily?.time?.slice(0, 7).map((dateStr: string, i: number) => {
          const date = new Date(dateStr);
          const UZ_DAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
          const dayName = UZ_DAYS[date.getDay()];
          const dayNum = String(date.getDate()).padStart(2, '0');
          const monthNum = String(date.getMonth() + 1).padStart(2, '0');
          const maxTemp = Math.round(weather.daily.temperature_2m_max[i]);
          const minTemp = Math.round(weather.daily.temperature_2m_min[i]);
          const code = weather.daily.weather_code[i];

          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0 text-white">
              <span className="text-[10px] font-bold uppercase tracking-tight">
                {dayName}
              </span>
              <span className="text-[9px] text-white/70">
                {dayNum}.{monthNum}
              </span>
              <div className="my-1 scale-[0.55]">
                {getWeatherIcon(code, 12)}
              </div>
              <span className="text-xs font-bold leading-none">
                {maxTemp}°
              </span>
              <span className="text-[10px] text-white/70 leading-none mt-0.5">
                {minTemp}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

     {/* ===== РАЗДЕЛЫ на фоне города ===== */}
<div className="relative flex-1">
  {/* Фото города */}
  <img
    src="/bekobod-city.jpg"
    alt="Bekobod"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Затемнение — посветлее, чтобы фото было заметно */}
  <div className="absolute inset-0 bg-linear-to-b from-slate-900/55 via-slate-900/45 to-slate-900/60" />

  {/* Контент разделов */}
  <div className="relative max-w-2xl w-full mx-auto px-4 py-6">
    <h2 className="font-bold text-lg mb-4 flex items-center space-x-2 text-white">
      <span>Bo'limlar</span>
      <span className="text-xs font-normal text-white/60">Bo'limlar / Разделы</span>
    </h2>

    <div className="grid grid-cols-2 gap-4">
      {sections.map((section) => {
        const Icon = section.icon;
        const badgeCount = badges[section.id as keyof typeof badges] || 0;
        return (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="group relative bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 border border-white/15 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95"
          >
            <div className="relative">
              {/* Иконка в круге */}
              <div className={`relative w-20 h-20 rounded-full bg-linear-to-br ${section.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-9 h-9" />
              </div>

              {badgeCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="text-base font-bold text-white leading-tight">
                {section.titleUz}
              </div>
              <div className="text-xs text-white/60 leading-tight mt-1">
                {section.titleRu}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>

     {/* Футер — внутри блока с фото */}
  <div className="relative text-center py-4 text-[10px] text-white/50">
    © 2026 Bekobod Shahar Portali
  </div>
</div>
</div>
);
}

export default App;