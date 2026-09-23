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
  created_at: string;
}

const CATEGORIES = [
  { id: 'bekobod', label: 'Bekobod yangiliklari', icon: '🏙️', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'uzbekistan', label: "O'zbekiston yangiliklari", icon: '🇺🇿', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'jahon', label: 'Jahon yangiliklari', icon: '🌍', gradient: 'from-orange-500 to-red-600' },
];

export const NewsView: React.FC<NewsViewProps> = ({ onClose }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hozir';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
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
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedNews(null)}
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
            {selectedNews.source && (
              <a
                href={selectedNews.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-amber-700 font-semibold pt-3 border-t border-stone-100"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Manbani ochish</span>
              </a>
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
                {filteredNews.length} ta yangilik
              </p>
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
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
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
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const count = news.filter(n => n.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-5 flex items-center justify-between shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-95`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{cat.icon}</div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-white">
                      {cat.label}
                    </div>
                    <div className="text-xs text-white/80">
                      {count} ta yangilik
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/80" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};