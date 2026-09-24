import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2, Star } from 'lucide-react';

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
  { id: 'usta', label: 'Usta xizmatlari', icon: '🔧', gradient: 'from-orange-500 to-red-600' },
  { id: 'gozallik', label: "Go'zallik", icon: '💇', gradient: 'from-pink-500 to-rose-600' },
  { id: 'avto', label: 'Avto xizmatlar', icon: '🚗', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'talim', label: "Ta'lim", icon: '📚', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'uy', label: 'Uy xizmatlari', icon: '🏠', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'komp', label: 'Kompyuter', icon: '💻', gradient: 'from-violet-500 to-purple-600' },
];

export const ServicesView: React.FC<ServicesViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Форма
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('usta');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/services/list`);
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

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
        alert("Siz allaqachon ro'yxatdan o'tgansiz");
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

  // Экран списка мастеров
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredProviders = providers.filter(p => p.category === selectedCategory);

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
                {filteredProviders.length} ta usta
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha ustalar yo'q</p>
            </div>
          ) : (
            filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <div className="flex items-center space-x-2 text-sm text-stone-600">
                  <User className="w-4 h-4" />
                  <span className="font-bold text-stone-900">{provider.name}</span>
                </div>
                {provider.description && (
                  <p className="text-sm text-stone-600">{provider.description}</p>
                )}
                <a
                  href={`tel:${provider.phone}`}
                  className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>Qo'ng'iroq qilish</span>
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Экран формы регистрации
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
            <h1 className="font-bold text-2xl text-stone-900">👷 Usta ro'yxatdan o'tish</h1>
          </div>
        </div>

        <form onSubmit={handleCreate} className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
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
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !name.trim() || !phone.trim()}
            className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Yaratilmoqda...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Ro'yxatdan o'tish</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Экран категорий (две колонки)
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
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Кнопка регистрации */}
        <button
          onClick={() => setTab('create')}
          className="w-full mb-6 py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-3xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Usta sifatida ro'yxatdan o'tish</span>
        </button>

        {/* Категории в две колонки */}
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const count = providers.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                <div className="text-6xl mb-3">{cat.icon}</div>
                <div className="font-bold text-base text-white text-center leading-tight">
                  {cat.label}
                </div>
                <div className="text-xs text-white/80 mt-2">
                  {count} ta usta
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};