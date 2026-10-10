import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2 } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

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
  { id: 'usta', label: 'Usta xizmatlari', icon: '🔧', iconFile: 'usta', line: 'from-orange-400 to-red-500' },
  { id: 'gozallik', label: "Go'zallik", icon: '💇', iconFile: 'gozallik', line: 'from-pink-400 to-rose-500' },
  { id: 'avto', label: 'Avto xizmatlar', icon: '🚗', iconFile: 'avto_servis', line: 'from-blue-400 to-indigo-500' },
  { id: 'talim', label: "Ta'lim", icon: '📚', iconFile: 'talim', line: 'from-emerald-400 to-teal-500' },
  { id: 'uy', label: 'Uy xizmatlari', icon: '🏠', iconFile: 'uy', line: 'from-cyan-400 to-blue-500' },
  { id: 'komp', label: 'Kompyuter', icon: '💻', iconFile: 'komp', line: 'from-violet-400 to-purple-500' },
  { id: 'telefon', label: 'Telefon ustalari', icon: '📱', iconFile: 'telefon', line: 'from-teal-400 to-emerald-500' },
  { id: 'boshqalar', label: 'Boshqa xizmatlar', icon: '👨‍🔧', iconFile: 'boshqa_xizmatlar', line: 'from-stone-400 to-stone-500' },
];

export const ServicesView: React.FC<ServicesViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('usta');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useSwipeBack(() => {
  if (selectedCategory) { setSelectedCategory(null); return; }
  onClose();
});

  const API_URL = 'https://bekobod-app-1.onrender.com';
  // ✅ Получить initData из Telegram
const getInitData = (): string => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || '';
};

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

  // === ЭКРАН СПИСКА МАСТЕРОВ ===
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredProviders = providers.filter(p => p.category === selectedCategory);

    return (
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
             <img src={`/icons/${catInfo?.iconFile || catInfo?.id}.png`} alt="" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="font-bold text-lg text-stone-900">{catInfo?.label}</h1>
                <p className="text-xs text-stone-400">{filteredProviders.length} ta usta</p>
              </div>
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
              <img src={`/icons/${catInfo?.iconFile || catInfo?.id}.png`} alt="" className="w-24 h-24 object-contain mx-auto mb-4 opacity-50" />
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
                {provider.phone && (
                  <div className="flex items-center space-x-2 text-sm text-stone-700">
                    <Phone className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="font-semibold">{provider.phone}</span>
                  </div>
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

  // === ЭКРАН ФОРМЫ РЕГИСТРАЦИИ ===
  if (tab === 'create') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
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

  // === ГЛАВНЫЙ ЭКРАН ===
  return (
    <PullToRefresh onRefresh={loadProviders}>
      <div className="min-h-screen bg-white">
        {/* Заголовок + кнопка регистрации */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-2xl text-stone-900">🔧 Xizmatlar</h1>
          </div>

          <div className="max-w-2xl mx-auto px-4 pb-4">
            <button
              onClick={() => setTab('create')}
              className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Usta sifatida ro'yxatdan o'tish</span>
            </button>
          </div>
        </div>

        {/* Крупные карточки категорий */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {CATEGORIES.map((cat) => {
              const count = providers.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
                >
                  <img
  src={`/icons/${cat.iconFile || cat.id}.png`}
  alt={cat.label}
  className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
/>

                  <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                    {cat.label}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{count} ta usta</span>
                  </div>

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