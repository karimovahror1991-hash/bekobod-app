import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Phone, MapPin, Clock } from 'lucide-react';
import { useNestedSwipeBack } from '../hooks/useSwipeBack';

interface ShopsViewProps {
  onClose: () => void;
}

interface Shop {
  id: number;
  category: string;
  name: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  description: string | null;
  image_url?: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'oziq_ovqat', label: "Oziq-ovqat do'konlari", icon: '🛒', line: 'from-emerald-400 to-green-500' },
  { id: 'kiyim', label: 'Kiyim-kechak', icon: '👕', line: 'from-violet-400 to-purple-500' },
  { id: 'maishiy_texnika', label: 'Maishiy texnika', icon: '🔌', line: 'from-blue-400 to-indigo-500' },
  { id: 'gozallik', label: "Go'zallik va sartaroshxona", icon: '💇', line: 'from-pink-400 to-rose-500' },
  { id: 'qurilish', label: 'Qurilish mollari', icon: '🏗️', line: 'from-amber-400 to-orange-500' },
  { id: 'sugurta', label: "Sug'urta", icon: '🛡️', line: 'from-cyan-400 to-blue-500' },
  { id: 'avto', label: 'Avto xizmatlar', icon: '🔧', line: 'from-stone-400 to-stone-600' },
  { id: 'oquv_markazi', label: "O'quv markazi", icon: '🎓', line: 'from-teal-400 to-emerald-500' },
  { id: 'bolalar_oyingohi', label: "Bolalar o'yingohi", icon: '🎪', line: 'from-yellow-400 to-orange-500' },
  { id: 'toyxonalar', label: "To'yxonalar va tantanalar", icon: '🏛️', line: 'from-rose-400 to-pink-500' },
  { id: 'tur_aviakassa', label: 'Tur agentliklari', icon: '✈️', line: 'from-sky-400 to-blue-500' },
];

export const ShopsView: React.FC<ShopsViewProps> = ({ onClose }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ⚡ Фото грузим ТОЛЬКО при клике
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

    useNestedSwipeBack([
    () => { if (selectedPhoto) { setSelectedPhoto(null); return true; } return false; },
    () => { if (selectedShop) { setSelectedShop(null); return true; } return false; },
    () => { if (selectedCategory) { setSelectedCategory(null); return true; } return false; },
    () => { onClose(); return true; },
  ]);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadShops = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/shops/list`);
      const data = await res.json();
      setShops(data.shops || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  // ⚡ Открыть магазин + загрузить фото
  const openShop = async (shop: Shop) => {
    setSelectedShop(shop);
    setPhotoLoading(true);
    setSelectedPhoto(null);

    try {
      const res = await fetch(`${API_URL}/api/shops/${shop.id}/photos`);
      const data = await res.json();
      setSelectedPhoto(data.image_url || null);
    } catch (err) {
      console.error('Photo load error:', err);
    } finally {
      setPhotoLoading(false);
    }
  };

  const filteredShops = selectedCategory
  ? shops.filter(s => {
      if (s.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    })
  : [];

  // === ЭКРАН МАГАЗИНА ===
  if (selectedShop) {
    const shop = selectedShop;

    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedShop(null);
                setSelectedPhoto(null);
              }}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-lg text-stone-900 flex-1 truncate">
              {shop.name}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Фото */}
          {photoLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : selectedPhoto ? (
            <img
              src={selectedPhoto}
              alt={shop.name}
              className="w-full rounded-3xl shadow-lg object-contain max-h-96 bg-stone-100"
            />
          ) : null}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            {shop.description && (
              <p className="text-sm text-stone-600">{shop.description}</p>
            )}

            {shop.address && (
              <div className="flex items-start space-x-2 text-sm text-stone-600">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                <span>{shop.address}</span>
              </div>
            )}

            {shop.phone && (
              <div className="flex items-center space-x-2 text-sm text-stone-700">
                <Phone className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="font-semibold">{shop.phone}</span>
              </div>
            )}

            {shop.hours && (
              <div className="flex items-center space-x-2 text-sm text-stone-700">
                <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="font-semibold">{shop.hours}</span>
              </div>
            )}

            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="w-full py-4 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95 text-lg"
              >
                <Phone className="w-6 h-6" />
                <span>Qo'ng'iroq qilish</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === ЭКРАН СПИСКА МАГАЗИНОВ КАТЕГОРИИ ===
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <PullToRefresh onRefresh={loadShops}>
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
                <img src={`/icons/${catInfo?.id}.png`} alt="" className="w-8 h-8 object-contain" />
                <div>
                  <h1 className="font-bold text-lg text-stone-900">{catInfo?.label}</h1>
                  <p className="text-xs text-stone-400">{filteredShops.length} ta</p>
                </div>
              </div>
            </div>
          </div>
{/* ✅ Поиск */}
<div className="max-w-2xl mx-auto px-4 pt-4">
  <div className="relative">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder=" "
      style={{ paddingLeft: '40px', paddingRight: '40px' }}
      className="w-full py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition"
    />
    {!searchQuery && (
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )}
    {searchQuery && (
      <button
        onClick={() => setSearchQuery('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-300 hover:bg-stone-400 text-white flex items-center justify-center text-xs transition"
      >
        ✕
      </button>
    )}
  </div>
</div>
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
          ) : filteredShops.length === 0 ? (
  <div className="text-center py-16 text-stone-400">
    <img src={`/icons/${catInfo?.id}.png`} alt="" className="w-24 h-24 object-contain mx-auto mb-4 opacity-50" />
    <p className="text-sm">
      {searchQuery.trim() ? 'Hech narsa topilmadi' : "Hozircha ma'lumot yo'q"}
    </p>
    {searchQuery.trim() && (
      <button
        onClick={() => setSearchQuery('')}
        className="mt-3 text-xs text-amber-600 font-semibold"
      >
        Qidiruvni tozalash
      </button>
    )}
  </div>
) : (
              filteredShops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => openShop(shop)}
                  className="w-full bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-lg transition-all text-left active:scale-[0.98] flex flex-col"
                  style={{ padding: '12px 16px', gap: '4px' }}
                >
                  <h3 className="font-bold text-base text-stone-900 leading-tight">
                    {shop.name}
                  </h3>

                  {shop.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-tight">
                      {shop.description}
                    </p>
                  )}

                  {shop.address && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 leading-tight">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span className="break-words">{shop.address}</span>
                    </div>
                  )}

                  {shop.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-700 leading-tight">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span className="font-semibold break-all">{shop.phone}</span>
                    </div>
                  )}

                  {shop.hours && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-700 leading-tight">
                      <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span className="font-semibold">{shop.hours}</span>
                    </div>
                  )}

                  <div className="text-right text-[10px] font-semibold text-amber-600 pt-0.5">
                    Batafsil →
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </PullToRefresh>
    );
  }

  // === ГЛАВНЫЙ ЭКРАН — ВЫБОР КАТЕГОРИИ ===
  return (
    <PullToRefresh onRefresh={loadShops}>
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
            <h1 className="font-bold text-2xl text-stone-900">🏪 Do'konlar va xizmatlar</h1>
          </div>
        </div>

        {/* Список категорий — крупные карточки */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {CATEGORIES.map((cat) => {
              const count = shops.filter(s => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
  setSelectedCategory(cat.id);
  setSearchQuery('');
}}
                  className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
                >
                  {/* Иконка */}
                  <img
                    src={`/icons/${cat.id}.png`}
                    alt={cat.label}
                    className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Название */}
                  <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                    {cat.label}
                  </div>

                  {/* Подпись с количеством */}
                  <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{count} ta</span>
                  </div>

                  {/* Градиентная полоска */}
                  <div className={`mt-4 w-20 h-1 rounded-full bg-linear-to-r ${cat.line}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};