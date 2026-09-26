import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, MapPin, Phone, Calendar } from 'lucide-react';

interface EventsViewProps {
  onClose: () => void;
  userId: number | null;
}

interface EventItem {
  id: number;
  category: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  phone: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'madaniyat', label: 'Madaniyat', icon: '🎭', gradient: 'from-purple-500 to-indigo-600' },
  { id: 'sport', label: 'Sport', icon: '⚽', gradient: 'from-emerald-500 to-green-600' },
  { id: 'bayram', label: 'Bayramlar', icon: '🎪', gradient: 'from-pink-500 to-rose-600' },
  { id: 'talim', label: "Ta'lim", icon: '📚', gradient: 'from-blue-500 to-cyan-600' },
  { id: 'rasmiy', label: 'Rasmiy', icon: '🏛️', gradient: 'from-amber-500 to-orange-600' },
  { id: 'bozor', label: 'Yarmarkalar', icon: '🛒', gradient: 'from-teal-500 to-emerald-600' },
];

export const EventsView: React.FC<EventsViewProps> = ({ onClose, userId }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subBadges, setSubBadges] = useState<{ [key: string]: number }>({});

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/events/list`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Загрузка бейджей подкатегорий
  useEffect(() => {
    if (!userId) return;

    const loadSubBadges = async () => {
      const cats = CATEGORIES.map(c => c.id);
      const results: { [key: string]: number } = {};
      for (const c of cats) {
        try {
          const res = await fetch(`${API_URL}/api/badge-sub/events/${c}?userId=${userId}`);
          const data = await res.json();
          results[c] = data.count || 0;
        } catch {
          results[c] = 0;
        }
      }
      setSubBadges(results);
    };

    loadSubBadges();
  }, [userId, API_URL]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Экран списка событий категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredEvents = events.filter(e => e.category === selectedCategory);

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
                {filteredEvents.length} ta tadbir
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha tadbirlar yo'q</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100"
              >
                {event.image_url && (
                  <div className="w-full h-64 bg-stone-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-stone-900">
                    {event.title}
                  </h3>
                  {event.event_date && (
                    <div className="flex items-center space-x-2 text-sm text-stone-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center space-x-2 text-sm text-stone-600">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  {event.phone && (
                    <a
                      href={`tel:${event.phone}`}
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
          <h1 className="font-bold text-2xl text-stone-900">🎭 Tadbirlar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const count = events.filter(e => e.category === cat.id).length;
            const badge = subBadges[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (userId) {
                    fetch(`${API_URL}/api/badge-sub/events/${cat.id}/seen`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId }),
                    }).catch(() => {});
                    setSubBadges(prev => ({ ...prev, [cat.id]: 0 }));
                  }
                }}
                className={`relative w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                {badge > 0 && (
                  <div className="absolute top-4 right-4 min-w-7 h-7 px-2 bg-rose-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {badge > 99 ? '99+' : badge}
                  </div>
                )}
                <div className="text-7xl mb-4">{cat.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {cat.label}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  {count} ta tadbir
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};