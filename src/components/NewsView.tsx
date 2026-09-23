import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronRight, Newspaper, ExternalLink } from 'lucide-react';

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
  { id: 'bekobod', label: 'Bekobod yangiliklari', icon: '🏙️' },
  { id: 'uzbekistan', label: "O'zbekiston yangiliklari", icon: '🇺🇿' },
  { id: 'jahon', label: 'Jahon yangiliklari', icon: '🌍' },
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hozir';
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
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
            />
          )}

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <div className="text-xs text-stone-400">
              {formatDate(selectedNews.created_at)}
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
              <div className="pt-3 border-t border-stone-100 text-xs text-stone-500">
                Manba: {selectedNews.source}
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
        <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-xl text-stone-900">
              {catInfo?.icon} {catInfo?.label}
            </h1>
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
                  className="w-full bg-white rounded-3xl p-4 shadow-sm border border-stone-100 flex items-center justify-between hover:shadow-xl transition-all text-left active:scale-95"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-stone-400 mb-1">
                      {formatDate(item.created_at)}
                    </div>
                    <h3 className="font-bold text-base text-stone-900 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 shrink-0 ml-3" />
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
                className="w-full bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 border border-stone-100"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{cat.icon}</div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-stone-900">
                      {cat.label}
                    </div>
                    <div className="text-xs text-stone-400">
                      {count} ta yangilik
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-stone-300" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};