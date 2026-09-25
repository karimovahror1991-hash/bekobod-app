import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Loader2, Star } from 'lucide-react';

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
  created_at: string;
}

const CATEGORIES = [
  { id: 'fastfood', label: 'Fast food', icon: '🍔', gradient: 'from-orange-500 to-red-600' },
  { id: 'milliy', label: 'Milliy taomlar', icon: '🍚', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'kafe', label: 'Kafe', icon: '☕', gradient: 'from-amber-500 to-orange-600' },
  { id: 'restoran', label: 'Restoran', icon: '🍷', gradient: 'from-rose-500 to-pink-600' },
  { id: 'choyxona', label: 'Choyxona', icon: '🫖', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'shirinlik', label: 'Shirinliklar', icon: '🍰', gradient: 'from-violet-500 to-purple-600' },
  { id: 'yarim_tayyor', label: 'Yarim tayyor mahsulotlar', icon: '🥟', gradient: 'from-indigo-500 to-blue-700' },
];

export const RestaurantsView: React.FC<RestaurantsViewProps> = ({ onClose }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{[key: number]: {avg: number, count: number}}>({});
  const [showRatingModal, setShowRatingModal] = useState<Restaurant | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/restaurants/list`);
      const data = await res.json();
      const list = data.restaurants || [];
      setRestaurants(list);

      // Загружаем рейтинги
      const ratingsData: {[key: number]: {avg: number, count: number}} = {};
      for (const r of list) {
        try {
          const rr = await fetch(`${API_URL}/api/restaurants/rating/${r.id}`);
          const rd = await rr.json();
          ratingsData[r.id] = { avg: rd.avgRating || 0, count: rd.count || 0 };
        } catch (e) {
          ratingsData[r.id] = { avg: 0, count: 0 };
        }
      }
      setRatings(ratingsData);
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

  const handleRate = async (rating: number) => {
    if (!showRatingModal) return;
    try {
      await fetch(`${API_URL}/api/restaurants/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: showRatingModal.id, rating, userId }),
      });
      setShowRatingModal(null);
      setSelectedRating(0);
      loadRestaurants();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRestaurants = selectedCategory
    ? restaurants.filter(r => r.category === selectedCategory)
    : [];

  // Экран списка ресторанов категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-white">
                {catInfo?.label}
              </h1>
              <p className="text-xs text-white/80">
                {filteredRestaurants.length} ta joy
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Bu bo'limda hozircha ma'lumot yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => {
                const rating = ratings[restaurant.id];
                return (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg text-stone-900 leading-tight flex-1">
                        {restaurant.name}
                      </h3>
                      {rating && rating.count > 0 && (
                        <div className="flex items-center space-x-1 text-xs bg-amber-50 px-2 py-1 rounded-lg shrink-0 ml-2">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-stone-700">{rating.avg}</span>
                          <span className="text-stone-400">({rating.count})</span>
                        </div>
                      )}
                    </div>

                    {restaurant.address && (
                      <div className="flex items-start space-x-2 text-sm text-stone-600">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{restaurant.address}</span>
                      </div>
                    )}

                    {restaurant.description && (
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {restaurant.description}
                      </p>
                    )}

                    <div className="flex space-x-2">
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
                        onClick={() => setShowRatingModal(restaurant)}
                        className="px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-2xl font-bold text-sm transition active:scale-95 shrink-0"
                      >
                        ⭐ Baholash
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Модальное окно оценки */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="font-bold text-lg text-stone-900 text-center mb-2">
                {showRatingModal.name}
              </h3>
              <p className="text-xs text-stone-500 text-center mb-4">
                Bahoyingizni tanlang
              </p>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="text-4xl transition-transform active:scale-110"
                  >
                    <span className={star <= selectedRating ? 'text-amber-500' : 'text-stone-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleRate(selectedRating)}
                  disabled={selectedRating === 0}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold disabled:opacity-50 transition"
                >
                  Yuborish
                </button>
                <button
                  onClick={() => {
                    setShowRatingModal(null);
                    setSelectedRating(0);
                  }}
                  className="px-5 py-3 text-stone-500 hover:text-stone-700"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Экран категорий
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
          <h1 className="font-bold text-2xl text-stone-900">🍽️ Restoran va kafelar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const count = restaurants.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                <div className="text-7xl mb-4">{cat.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {cat.label}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  {count} ta joy
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};