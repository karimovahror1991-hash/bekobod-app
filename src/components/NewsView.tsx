import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronRight, Clock, ExternalLink } from 'lucide-react';

interface NewsViewProps {
  onClose: () => void;
}

interface NewsItem {
  id: number;
  category: string;
  title: string;
  content: string | null;
  image_url: string | null;
  source: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'bekobod', label: 'Bekobod yangiliklari', icon: '🏙️', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'jahon', label: "O'zbekiston va Jahon yangiliklari", icon: '🌍', gradient: 'from-emerald-500 to-teal-600' },
];

export const NewsView: React.FC<NewsViewProps> = ({ onClose }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [subBadges, setSubBadges] = useState<{ [key: string]: number }>({});
  const [userId, setUserId] = useState<number | null>(null);
  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/news/list`);
      const data = await res.json();
      setNews(data.news || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadNews();

    const tg = (window as any).Telegram?.WebApp;
    const uid = tg?.initDataUnsafe?.user?.id;
    if (uid) setUserId(uid);
  }, []);

  // Загрузка бейджей подкатегорий
  useEffect(() => {
    if (!userId) return;

    const loadSubBadges = async () => {
      const cats = ['bekobod', 'jahon'];
      const results: { [key: string]: number } = {};
      for (const c of cats) {
        try {
          const res = await fetch(`${API_URL}/api/badge-sub/news/${c}?userId=${userId}`);
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

    const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('uz-UZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Экран полной новости
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
             onClick={() =>  setSelectedNews(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-lg text-stone-900">Yangilik</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {selectedNews.image_url && (
            <img
              src={selectedNews.image_url}
              alt={selectedNews.title}
              className="w-full rounded-3xl shadow-lg"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatFullDate(selectedNews.created_at)}</span>
            </div>
            <h1 className="font-bold text-xl text-stone-900 leading-tight">
              {selectedNews.title}
            </h1>
            {selectedNews.content && (
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {selectedNews.content}
              </p>
            )}
           {(selectedNews.youtube_url || selectedNews.instagram_url || selectedNews.source) && (
  <div className="pt-3 border-t border-stone-100 space-y-2">
    {/* YouTube */}
    {selectedNews.youtube_url && (
      <button
        onClick={() => {
          const tg = (window as any).Telegram?.WebApp;
          const url = selectedNews.youtube_url!;
          if (tg?.openLink) tg.openLink(url);
          else window.open(url, '_blank');
        }}
        className="w-full py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>YouTube'da ko'rish</span>
      </button>
    )}

    {/* Instagram */}
    {selectedNews.instagram_url && (
      <button
        onClick={() => {
          const tg = (window as any).Telegram?.WebApp;
          const url = selectedNews.instagram_url!;
          if (tg?.openLink) tg.openLink(url);
          else window.open(url, '_blank');
        }}
        className="w-full py-3 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <span>Instagram'da ko'rish</span>
      </button>
    )}

    {/* Обычная ссылка (fallback для старых новостей) */}
    {selectedNews.source && !selectedNews.youtube_url && !selectedNews.instagram_url && (
      <button
        onClick={() => {
          const tg = (window as any).Telegram?.WebApp;
          const url = selectedNews.source!;
          if (tg?.openLink) tg.openLink(url);
          else window.open(url, '_blank');
        }}
        className="w-full py-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
      >
        <ExternalLink className="w-5 h-5" />
        <span>Manbani ochish</span>
      </button>
    )}
  </div>
)}
          </div>
        </div>
      </div>
    );
  }

  // Экран списка новостей категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredNews = news.filter(n => n.category === selectedCategory);

    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${catInfo?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
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
             </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha yangiliklar yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedNews(item)}
                  className="w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-xl transition-all text-left active:scale-[0.98]"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center space-x-1.5 text-xs text-stone-400 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900 leading-snug line-clamp-3">
                      {item.title}
                    </h3>
                    {item.content && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    <div className="flex items-center justify-end mt-2 text-amber-600">
                      <span className="text-xs font-semibold">Batafsil</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Экран категорий
   return (
    <PullToRefresh onRefresh={loadNews}>
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">📰 Yangiliklar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const count = news.filter(n => n.category === cat.id).length;
            return (
                            <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (userId) {
                    fetch(`${API_URL}/api/badge-sub/news/${cat.id}/seen`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId }),
                    }).catch(() => {});
                    setSubBadges(prev => ({ ...prev, [cat.id]: 0 }));
                  }
                }}
                className={`relative w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                {subBadges[cat.id] > 0 && (
                  <div className="absolute top-4 right-4 min-w-7 h-7 px-2 bg-rose-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {subBadges[cat.id] > 99 ? '99+' : subBadges[cat.id]}
                  </div>
                )}
                <div className="text-7xl mb-4">{cat.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {cat.label}
                </div>
               </button>
            );
          })}
        </div>
         </div>
    </div>
    </PullToRefresh>
  );
};