import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Phone, MapPin, Clock } from 'lucide-react';
import { PullToRefresh } from './PullToRefresh';

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
  image_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'oziq-ovqat', label: "Oziq-ovqat do'konlari", icon: '🛒', gradient: 'from-emerald-500 to-green-600' },
  { id: 'kiyim', label: 'Kiyim-kechak', icon: '👕', gradient: 'from-violet-500 to-purple-600' },
  { id: 'maishiy_texnika', label: 'Maishiy texnika', icon: '🔌', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'gozallik', label: "Go'zallik va sartaroshxona", icon: '💇', gradient: 'from-pink-500 to-rose-600' },
  { id: 'qurilish', label: 'Qurilish mollari', icon: '🏗️', gradient: 'from-amber-500 to-orange-600' },
  { id: 'sugurta', label: "Sug'urta", icon: '🛡️', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'avto', label: 'Avto xizmatlar', icon: '🔧', gradient: 'from-stone-500 to-stone-700' },
  { id: 'oquv_markazi', label: "O'quv markazi", icon: '🎓', gradient: 'from-teal-500 to-emerald-600' },
  { id: 'bolalar_oyingohi', label: "Bolalar o'yingohi", icon: '🎪', gradient: 'from-yellow-500 to-orange-600' },
];

export const ShopsView: React.FC<ShopsViewProps> = ({ onClose }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const filteredShops = selectedCategory
    ? shops.filter(s => s.category === selectedCategory)
    : [];

  // Экран списка магазинов категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <PullToRefresh onRefresh={loadShops}>
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-white">
                {catInfo?.icon} {catInfo?.label}
              </h1>
              <p className="text-xs text-white/80">{filteredShops.length} ta</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha ma'lumot yo'q</p>
            </div>
          ) : (
            filteredShops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
                {shop.image_url && (
                  <img
                    src={shop.image_url}
                    alt={shop.name}
                    className="w-full max-h-64 object-contain bg-stone-100"
                  />
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-stone-900">{shop.name}</h3>

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
                      className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Qo'ng'iroq qilish</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </PullToRefresh>
    );
  }

  // Экран категорий
  return (
    <PullToRefresh onRefresh={loadShops}>
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
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

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const count = shops.filter(s => s.category === cat.id).length;
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
                <div className="text-sm text-white/80 mt-2">{count} ta</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
};