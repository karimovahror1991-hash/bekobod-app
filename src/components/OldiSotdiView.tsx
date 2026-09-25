import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Plus, Phone, Trash2, User } from 'lucide-react';

interface OldiSotdiViewProps {
  onClose: () => void;
  userId: number | null;
}

interface Listing {
  id: number;
  category: string;
  title: string;
  description: string | null;
  price: string | null;
  phone: string;
  image_url: string | null;
  user_id: number | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'transport', label: 'Avtomobillar', icon: '🚗', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'phones', label: 'Telefonlar', icon: '📱', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'electronics', label: 'Elektronika', icon: '💻', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'realestate', label: "Ko'chmas mulk", icon: '🏠', gradient: 'from-amber-500 to-orange-600' },
  { id: 'furniture', label: 'Mebel', icon: '🛋️', gradient: 'from-rose-500 to-pink-600' },
  { id: 'clothes', label: 'Kiyim-kechak', icon: '👕', gradient: 'from-violet-500 to-purple-600' },
  { id: 'kids', label: 'Bolalar uchun', icon: '🧸', gradient: 'from-pink-500 to-rose-600' },
  { id: 'animals', label: 'Hayvonlar', icon: '🐕', gradient: 'from-lime-500 to-green-600' },
];

export const OldiSotdiView: React.FC<OldiSotdiViewProps> = ({ onClose, userId }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Форма
  const [category, setCategory] = useState('transport');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/listings/list`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !phone.trim()) return;

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

      const res = await fetch(`${API_URL}/api/listings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim() || null,
          price: price.trim() || null,
          phone: normalizedPhone,
          userId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setTitle('');
      setDescription('');
      setPrice('');
      setPhone('');
      setTab('list');
      loadListings();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (listingId: number) => {
    if (!userId) return;
    if (!confirm("E'lonni o'chirishni tasdiqlaysizmi?")) return;

    try {
      const res = await fetch(`${API_URL}/api/listings/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, userId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      loadListings();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hozir';
    if (diffHours < 24) return `${diffHours} soat oldin`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  // Экран создания
  if (tab === 'create') {
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setTab('list')}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-2xl text-stone-900">➕ E'lon berish</h1>
          </div>
        </div>

        <form onSubmit={handleCreate} className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kategoriya
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
                Sarlavha
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: iPhone 13 Pro Max"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Narxi (ixtiyoriy)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Masalan: 8 000 000 so'm"
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
                Tavsif (ixtiyoriy)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Holati, qo'shimcha ma'lumot..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !title.trim() || !phone.trim()}
            className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Joylashtirilmoqda...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>E'lonni joylashtirish</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Экран списка объявлений категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredListings = listings.filter(l => l.category === selectedCategory);

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
                {catInfo?.icon} {catInfo?.label}
              </h1>
              <p className="text-xs text-white/80">
                {filteredListings.length} ta e'lon
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha e'lonlar yo'q</p>
            </div>
          ) : (
            filteredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-stone-900 leading-tight flex-1">
                    {item.title}
                  </h3>
                  <div className="text-xs text-stone-400 shrink-0 ml-2">
                    {formatDate(item.created_at)}
                  </div>
                </div>

                {item.price && (
                  <div className="text-lg font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl inline-block">
                    💰 {item.price}
                  </div>
                )}

                {item.description && (
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="flex space-x-2 pt-2">
                  <a
                    href={`tel:${item.phone}`}
                    className="flex-1 py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Qo'ng'iroq</span>
                  </a>
                  {userId && item.user_id === userId && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-2xl font-bold transition active:scale-95"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Главный экран Oldi sotdi
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
          <h1 className="font-bold text-2xl text-stone-900">🛒 Oldi sotdi</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-4">
          <button
            onClick={() => setTab('create')}
            className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
          >
            <Plus className="w-5 h-5" />
            <span>E'lon berish</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const count = listings.filter(l => l.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-40`}
              >
                <div className="text-6xl mb-3">{cat.icon}</div>
                <div className="font-bold text-base text-white text-center leading-tight">
                  {cat.label}
                </div>
                <div className="text-xs text-white/80 mt-2">
                  {count} ta e'lon
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};