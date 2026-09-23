import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, UtensilsCrossed, Loader2 } from 'lucide-react';

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
  { id: 'all', label: 'Barchasi', icon: '🍽️' },
  { id: 'fastfood', label: 'Fast food', icon: '🍔' },
  { id: 'milliy', label: 'Milliy taomlar', icon: '🍚' },
  { id: 'kafe', label: 'Kafe', icon: '☕' },
  { id: 'restoran', label: 'Restoran', icon: '🍷' },
  { id: 'chayxana', label: 'Chayxana', icon: '🫖' },
  { id: 'shirinlik', label: 'Shirinliklar', icon: '🍰' },
];

export const RestaurantsView: React.FC<RestaurantsViewProps> = ({ onClose }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/restaurants/list`);
      const data = await res.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filteredRestaurants = selectedCategory === 'all'
    ? restaurants
    : restaurants.filter(r => r.category === selectedCategory);

  const getCategoryLabel = (catId: string | null) => {
    if (!catId) return '';
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? `${cat.icon} ${cat.label}` : catId;
  };

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
        {/* Категории */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-md scale-105'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              <div className="text-xl mb-0.5">{cat.icon}</div>
              <div className="text-[10px]">{cat.label}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-sm">Hozircha restoranlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-stone-900 leading-tight flex-1">
                    {restaurant.name}
                  </h3>
                </div>

                {restaurant.category && (
                  <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg inline-block">
                    {getCategoryLabel(restaurant.category)}
                  </div>
                )}

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

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Qo'ng'iroq qilish</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};