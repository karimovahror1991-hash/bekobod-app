import { ImageViewer } from './ImageViewer';
import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Loader2, Star, Clock } from 'lucide-react';
import { useNestedSwipeBack } from '../hooks/useSwipeBack';

interface RestaurantsViewProps {
  onClose: () => void;
}

interface Restaurant {
  id: number;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  image_url?: string | null;
  hours: string | null;
  menu_images?: string[] | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'fastfood', label: 'Fast food', icon: '🍔', gradient: 'from-orange-500 to-red-600', line: 'from-orange-400 to-red-500' },
  { id: 'milliy', label: 'Milliy taomlar', icon: '🍲', gradient: 'from-emerald-500 to-teal-600', line: 'from-emerald-400 to-teal-500' },
  { id: 'kafe', label: 'Kafe', icon: '☕', gradient: 'from-amber-600 to-orange-700', line: 'from-amber-500 to-orange-600' },
  { id: 'restoran', label: 'Restoran', icon: '🍷', gradient: 'from-rose-600 to-red-700', line: 'from-rose-500 to-red-600' },
  { id: 'choyxona', label: 'Choyxona', icon: '🫖', gradient: 'from-cyan-600 to-blue-700', line: 'from-cyan-500 to-blue-600' },
  { id: 'shirinlik', label: 'Shirinliklar', icon: '🍰', gradient: 'from-pink-500 to-rose-600', line: 'from-pink-400 to-rose-500' },
  { id: 'yarim_tayyor', label: 'Yarim tayyor mahsulotlar', icon: '🥟', gradient: 'from-violet-600 to-purple-700', line: 'from-violet-500 to-purple-600' },
];

export const RestaurantsView: React.FC<RestaurantsViewProps> = ({ onClose }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState<{[key: number]: {avg: number, count: number}}>({});
  const [myRatings, setMyRatings] = useState<{[key: number]: number}>({});
  const [showRatingModal, setShowRatingModal] = useState<Restaurant | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // ⚡ Фото грузим ТОЛЬКО при открытии ресторана
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [selectedPhotos, setSelectedPhotos] = useState<{image_url: string | null, menu_images: string[]} | null>(null);
  const [photosLoading, setPhotosLoading] = useState(false);

  // Fullscreen
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [fullscreenPhotos, setFullscreenPhotos] = useState<string[]>([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

    useNestedSwipeBack([
    () => { if (fullscreenImage) { setFullscreenImage(null); return true; } return false; },
    () => { if (showRatingModal) { setShowRatingModal(null); return true; } return false; },
    () => { if (selectedRestaurant) { setSelectedRestaurant(null); setSelectedPhotos(null); return true; } return false; },
    () => { if (selectedCategory) { setSelectedCategory(null); return true; } return false; },
    () => { onClose(); return true; },
  ]);

  const API_URL = 'https://bekobod-app-1.onrender.com';
  // ✅ Получить initData из Telegram
const getInitData = (): string => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || '';
};

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/restaurants/list-full?userId=${userId || ''}`);
      const data = await res.json();
      const list = data.restaurants || [];

      const ratingsData: {[key: number]: {avg: number, count: number}} = {};
      const myRatingsData: {[key: number]: number} = {};

      list.forEach((r: any) => {
        ratingsData[r.id] = { avg: r.avgRating || 0, count: r.ratingCount || 0 };
        if (r.myRating) myRatingsData[r.id] = r.myRating;
      });

      setRestaurants(list);
      setRatings(ratingsData);
      setMyRatings(myRatingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      setUserId(tg.initDataUnsafe.user.id);
    }
  }, []);

  // ⚡ Загрузка фото при открытии ресторана
  const openRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setPhotosLoading(true);
    setSelectedPhotos(null);

    try {
      const res = await fetch(`${API_URL}/api/restaurants/${restaurant.id}/photos`);
      const data = await res.json();
      setSelectedPhotos({
        image_url: data.image_url || null,
        menu_images: data.menu_images || [],
      });
    } catch (err) {
      console.error('Photos load error:', err);
      setSelectedPhotos({ image_url: null, menu_images: [] });
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
  if (!showRatingModal) return;
  try {
    const res = await fetch(`${API_URL}/api/restaurants/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: showRatingModal.id, rating, initData: getInitData() }),
    });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setShowRatingModal(null);
      setSelectedRating(0);
      loadRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRestaurants = selectedCategory
  ? restaurants.filter(r => {
      if (r.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    })
  : [];

  // === ЭКРАН РЕСТОРАНА ===
  if (selectedRestaurant) {
    const restaurant = selectedRestaurant;
    const rating = ratings[restaurant.id];
    const allPhotos: string[] = [];
    if (selectedPhotos) {
      if (selectedPhotos.image_url) allPhotos.push(selectedPhotos.image_url);
      selectedPhotos.menu_images.forEach((m) => {
        if (m && m.startsWith('data:image/')) allPhotos.push(m);
      });
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                setSelectedPhotos(null);
              }}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-lg text-stone-900 flex-1 truncate">
              {restaurant.name}
            </h1>
            {rating && rating.count > 0 && (
              <div className="flex items-center space-x-1 text-xs bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-stone-700">{rating.avg}</span>
                <span className="text-stone-400">({rating.count})</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {photosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : allPhotos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {allPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFullscreenImage(url);
                    setFullscreenPhotos(allPhotos);
                    setFullscreenIndex(idx);
                  }}
                  className="shrink-0"
                >
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-40 h-40 object-cover rounded-2xl shadow-sm hover:shadow-lg transition"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3">
            {restaurant.address && (
              <div className="flex items-start space-x-2 text-sm text-stone-600">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="flex items-center space-x-2 text-sm text-stone-700">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-semibold">{restaurant.phone}</span>
              </div>
            )}
            {restaurant.hours && (
              <div className="flex items-center space-x-2 text-sm text-stone-700">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">{restaurant.hours}</span>
              </div>
            )}
            {restaurant.description && (
              <p className="text-sm text-stone-600 leading-relaxed">{restaurant.description}</p>
            )}

            <div className="flex space-x-2 pt-2">
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  className="flex-1 py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>Qo'ng'iroq</span>
                </a>
              )}
              <button
                onClick={() => {
                  if (myRatings[restaurant.id]) return;
                  setShowRatingModal(restaurant);
                }}
                disabled={!!myRatings[restaurant.id]}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 ${
                  myRatings[restaurant.id]
                    ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 active:scale-95'
                }`}
              >
                {myRatings[restaurant.id] ? '✅ Baholangan' : '⭐ Baholash'}
              </button>
            </div>
          </div>
        </div>

        {/* Модалка оценки */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="font-bold text-lg text-stone-900 text-center mb-2">
                {showRatingModal.name}
              </h3>
              <p className="text-xs text-stone-500 text-center mb-4">
                Bahoyingizni tanlang
              </p>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setSelectedRating(star);
                      setTimeout(() => handleRate(star), 300);
                    }}
                    className="text-4xl transition-transform active:scale-110"
                  >
                    <span className={star <= selectedRating ? 'text-amber-500' : 'text-stone-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-center text-xs text-stone-400">
                Yulduzni bosing va baho yuboriladi
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen */}
        {fullscreenImage && (
          <ImageViewer
            images={fullscreenPhotos}
            startIndex={fullscreenIndex}
            onClose={() => {
              setFullscreenImage(null);
              setFullscreenPhotos([]);
              setFullscreenIndex(0);
            }}
          />
        )}
      </div>
    );
  }

  // === ЭКРАН СПИСКА РЕСТОРАНОВ КАТЕГОРИИ ===
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={`/icons/${catInfo?.id}.png`}
                alt=""
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg text-stone-900">{catInfo?.label}</h1>
                <p className="text-xs text-stone-400">{filteredRestaurants.length} ta joy</p>
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
        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
         ) : filteredRestaurants.length === 0 ? (
  <div className="text-center py-16 text-stone-400">
    <img src={`/icons/${catInfo?.id}.png`} alt="" className="w-24 h-24 object-contain mx-auto mb-4 opacity-50" />
    <p className="text-sm">
      {searchQuery.trim() ? 'Hech narsa topilmadi' : "Bu bo'limda hozircha ma'lumot yo'q"}
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
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => {
                const rating = ratings[restaurant.id];
                return (
                  <button
                    key={restaurant.id}
                    onClick={() => openRestaurant(restaurant)}
                    className="w-full text-left bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-lg transition-all active:scale-[0.98] flex flex-col"
                    style={{ padding: '12px 16px', gap: '4px' }}
                  >
                    <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                      <h3 className="font-bold text-base text-stone-900 leading-tight flex-1 break-words min-w-0">
                        {restaurant.name}
                      </h3>
                      {rating && rating.count > 0 && (
                        <div className="flex items-center space-x-1 text-xs bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-stone-700">{rating.avg}</span>
                          <span className="text-stone-400">({rating.count})</span>
                        </div>
                      )}
                    </div>

                    {restaurant.address && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 leading-tight">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="break-words">{restaurant.address}</span>
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 leading-tight">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-semibold break-all">{restaurant.phone}</span>
                      </div>
                    )}
                    {restaurant.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-700 leading-tight">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold">{restaurant.hours}</span>
                      </div>
                    )}

                    <div className="text-right text-[10px] font-semibold text-amber-600 pt-0.5">
                      Batafsil →
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // === ГЛАВНЫЙ ЭКРАН — ВЫБОР КАТЕГОРИИ (как на референсе) ===
  return (
    <PullToRefresh onRefresh={loadRestaurants}>
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
            <h1 className="font-bold text-2xl text-stone-900">🍽️ Restoran va kafelar</h1>
          </div>
        </div>

        {/* Список категорий — крупные карточки как на референсе */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {CATEGORIES.map((cat) => {
              const count = restaurants.filter(r => r.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
  setSelectedCategory(cat.id);
  setSearchQuery('');
}}
                  className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
                >
                  {/* Иконка — Apple-эмодзи из public/icons */}
                  <img
                    src={`/icons/${cat.id}.png`}
                    alt={cat.label}
                    className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Название */}
                  <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                    {cat.label}
                  </div>

                  {/* Подпись с иконкой места */}
                  <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{count} ta joy</span>
                  </div>

                  {/* Градиентная полоска снизу */}
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