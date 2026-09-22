import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2, Star, Wrench } from 'lucide-react';

interface ServicesViewProps {
  onClose: () => void;
}

interface Provider {
  id: number;
  name: string;
  phone: string;
  category: string;
  description: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'usta', label: 'Usta xizmatlari', icon: '🔧' },
  { id: 'gozallik', label: "Go'zallik", icon: '💇' },
  { id: 'avto', label: 'Avto xizmatlar', icon: '🚗' },
  { id: 'talim', label: "Ta'lim", icon: '📚' },
  { id: 'uy', label: 'Uy xizmatlari', icon: '🏠' },
  { id: 'komp', label: 'Kompyuter', icon: '💻' },
];

export const ServicesView: React.FC<ServicesViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Форма
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('usta');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Рейтинги
  const [ratings, setRatings] = useState<{[key: number]: {avg: number, count: number}}>({});
  const [showRatingModal, setShowRatingModal] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadProviders = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all'
        ? `${API_URL}/api/services/list`
        : `${API_URL}/api/services/list?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      const list = data.providers || [];
      setProviders(list);

      // Загружаем рейтинги
      const ratingsData: {[key: number]: {avg: number, count: number}} = {};
      for (const p of list) {
        try {
          const r = await fetch(`${API_URL}/api/services/rating/${p.id}`);
          const d = await r.json();
          ratingsData[p.id] = { avg: d.avgRating || 0, count: d.count || 0 };
        } catch (e) {
          ratingsData[p.id] = { avg: 0, count: 0 };
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
    loadProviders();
  }, [selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setCreating(true);
    try {
      let normalizedPhone = phone.trim().replace(/\s/g, '');
      if (!normalizedPhone.startsWith('+')) {
        if (normalizedPhone.startsWith('998')) {
          normalizedPhone = '+' + normalizedPhone;
        } else {
          normalizedPhone = '+998' + normalizedPhone;
        }
      }

      const res = await fetch(`${API_URL}/api/services/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          category,
          description: description.trim() || null,
        }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.alreadyExists) {
        alert('Siz allaqachon ro\'yxatdan o\'tgansiz');
      }

      setName('');
      setPhone('');
      setDescription('');
      setTab('list');
      loadProviders();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!showRatingModal) return;

    try {
      await fetch(`${API_URL}/api/services/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: showRatingModal, rating }),
      });

      setShowRatingModal(null);
      setSelectedRating(0);
      loadProviders();
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryLabel = (catId: string) => {
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
          <h1 className="font-bold text-2xl text-stone-900">🔧 Xizmatlar</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-4 flex space-x-3">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'list'
                ? 'bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span className="text-xl">🔍</span>
            <span>Qidirish</span>
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'create'
                ? 'bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg scale-105'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span className="text-xl">👷</span>
            <span>Usta</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'list' && (
          <>
                 {/* Категории */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`py-5 rounded-3xl text-base font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-lg scale-105'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Barchasi
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`py-5 rounded-3xl text-sm font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-stone-900 text-white shadow-lg scale-105'
                      : 'bg-white text-stone-600 border border-stone-200'
                  }`}
                >
                  <div className="text-3xl mb-1">{cat.icon}</div>
                  <div className="text-xs">{cat.label}</div>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                Hozircha ustalar yo'q
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((provider) => {
                  const rating = ratings[provider.id];
                  return (
                    <div
                      key={provider.id}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-stone-600">
                          <User className="w-4 h-4" />
                          <span className="font-bold text-stone-900">{provider.name}</span>
                        </div>
                        <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                          {getCategoryLabel(provider.category)}
                        </div>
                      </div>

                      {provider.description && (
                        <div className="text-xs text-stone-500">
                          {provider.description}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {rating && rating.count > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span className="font-bold text-stone-700">{rating.avg}</span>
                              <span className="text-stone-400">({rating.count})</span>
                            </div>
                          )}
                          <button
                            onClick={() => setShowRatingModal(provider.id)}
                            className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold transition"
                          >
                            ⭐ Baholash
                          </button>
                        </div>
                        <a
                          href={`tel:${provider.phone}`}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Qo'ng'iroq</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <h2 className="font-bold text-lg text-stone-900 mb-2">
              Usta sifatida ro'yxatdan o'tish
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ismingiz
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Akmal"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telefon raqamingiz
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Xizmat turi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Qisqa tavsif (ixtiyoriy)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masalan: Elektr montaji, 10 yillik tajriba"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !name.trim() || !phone.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yaratilmoqda...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Ro'yxatdan o'tish</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Модальное окно оценки */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-stone-900 text-center mb-2">
              Ustani baholang
            </h3>
            <p className="text-xs text-stone-500 text-center mb-4">
              Sizning bahoyingiz anonim saqlanadi
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
};