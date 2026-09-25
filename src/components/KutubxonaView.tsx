import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Book, Download, User } from 'lucide-react';

interface KutubxonaViewProps {
  onClose: () => void;
}

interface Book {
  id: number;
  category: string;
  title: string;
  author: string | null;
  description: string | null;
  file_url: string;
  cover_url: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'badiiy', label: 'Badiiy', icon: '📖', gradient: 'from-amber-500 to-orange-600' },
  { id: 'diniy', label: 'Diniy', icon: '🕌', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'ilmiy', label: 'Ilmiy', icon: '🔬', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'bolalar', label: 'Bolalar', icon: '🧸', gradient: 'from-pink-500 to-rose-600' },
];

export const KutubxonaView: React.FC<KutubxonaViewProps> = ({ onClose }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/books/list`);
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Экран списка книг категории
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
    const filteredBooks = books.filter(b => b.category === selectedCategory);

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
              <p className="text-xs text-white/80">{filteredBooks.length} ta kitob</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{catInfo?.icon}</div>
              <p className="text-sm">Hozircha kitoblar yo'q</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <a
                key={book.id}
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${catInfo?.gradient} flex items-center justify-center text-white shrink-0`}>
                    <Book className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-stone-900 leading-tight">
                      {book.title}
                    </h3>
                    {book.author && (
                      <div className="flex items-center space-x-1 text-xs text-stone-500 mt-1">
                        <User className="w-3 h-3" />
                        <span>{book.author}</span>
                      </div>
                    )}
                    {book.description && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-amber-600">
                    <Download className="w-6 h-6" />
                  </div>
                </div>
              </a>
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
          <h1 className="font-bold text-2xl text-stone-900">📚 Kutubxona</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const count = books.filter(b => b.category === cat.id).length;
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
                <div className="text-sm text-white/80 mt-2">{count} ta kitob</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};