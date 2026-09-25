import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Plus, Phone, Trash2, X, Image as ImageIcon } from 'lucide-react';

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
  image_urls: string[] | null;
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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Форма
  const [category, setCategory] = useState('transport');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 6 - images.length;
    if (remaining <= 0) {
      alert("Maksimal 6 ta rasm");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const newUrls: string[] = [];
      for (const file of toUpload) {
        const reader = new FileReader();
        const base64: string = await new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // убираем "data:image/...;base64,"
          };
          reader.readAsDataURL(file);
        });

        const res = await fetch(`${API_URL}/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      }
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error(err);
      alert('Rasm yuklashda xatolik');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

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
          imageUrls: images,
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
      setImages([]);
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
      setSelectedListing(null);
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

  // Экран детального просмотра объявления
  if (selectedListing) {
    const catInfo = CATEGORIES.find(c => c.id === selectedListing.category);
    const photos = selectedListing.image_urls || [];

    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedListing(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-xl text-white">{catInfo?.icon} {catInfo?.label}</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {photos.length > 0 && (
            <div className="space-y-3">
              <img
                src={photos[0]}
                alt={selectedListing.title}
                className="w-full rounded-3xl shadow-lg object-cover max-h-96"
              />
              {photos.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(1).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-full h-24 object-cover rounded-2xl shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <h1 className="font-bold text-2xl text-stone-900">{selectedListing.title}</h1>

            {selectedListing.price && (
              <div className="text-2xl font-bold text-emerald-700">
                💰 {selectedListing.price}
              </div>
            )}

            {selectedListing.description && (
              <p className="text-base text-stone-700 leading-relaxed whitespace-pre-line">
                {selectedListing.description}
              </p>
            )}

            <div className="text-xs text-stone-400 pt-3 border-t border-stone-100">
              {formatDate(selectedListing.created_at)}
            </div>

            <a
              href={`tel:${selectedListing.phone}`}
              className="w-full py-4 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95 text-lg"
            >
              <Phone className="w-6 h-6" />
              <span>Qo'ng'iroq qilish</span>
            </a>

            {userId && selectedListing.user_id === userId && (
              <button
                onClick={() => handleDelete(selectedListing.id)}
                className="w-full py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-2xl font-bold flex items-center justify-center space-x-2 transition active:scale-95"
              >
                <Trash2 className="w-5 h-5" />
                <span>E'lonni o'chirish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

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

            {/* Фото */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Rasmlar ({images.length}/6)
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-24 object-cover rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 6 && (
                <label className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer hover:border-amber-500 transition">
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                      <span className="text-sm text-stone-500">Yuklanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-stone-400" />
                      <span className="text-sm text-stone-500">Rasm qo'shish</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || uploading || !title.trim() || !phone.trim()}
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
            filteredListings.map((item) => {
              const photos = item.image_urls || [];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedListing(item)}
                  className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-all text-left active:scale-[0.98]"
                >
                  {photos.length > 0 && (
                    <img
                      src={photos[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-base text-stone-900 leading-tight flex-1">
                        {item.title}
                      </h3>
                      <div className="text-xs text-stone-400 shrink-0 ml-2">
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                    {item.price && (
                      <div className="text-base font-bold text-emerald-700">
                        💰 {item.price}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
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