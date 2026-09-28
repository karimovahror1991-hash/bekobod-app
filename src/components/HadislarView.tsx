import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronRight, BookOpen } from 'lucide-react';

interface HadislarViewProps {
  onClose: () => void;
}

interface Category {
  id: string;
  title: string;
  hadeeths_count: string;
  parent_id: string | null;
}

interface HadithListItem {
  id: string;
  title: string;
}

interface HadithFull {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation: string;
  hadeeth_ar: string;
  hints: string[];
}

export const HadislarView: React.FC<HadislarViewProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hadiths, setHadiths] = useState<HadithListItem[]>([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState<HadithFull | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  // Загрузка категорий
  useEffect(() => {
    fetch(`${API_URL}/api/hadith/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [API_URL]);

  // Загрузка хадисов категории
  const loadHadiths = (cat: Category) => {
    setSelectedCategory(cat);
    setLoadingHadiths(true);
    fetch(`${API_URL}/api/hadith/list?category=${cat.id}`)
      .then((res) => res.json())
      .then((data) => setHadiths(data.hadiths || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingHadiths(false));
  };

  // Загрузка полного хадиса
  const loadFullHadith = (id: string) => {
    setLoadingFull(true);
    fetch(`${API_URL}/api/hadith/one?id=${id}`)
      .then((res) => res.json())
      .then((data) => setSelectedHadith(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingFull(false));
  };

  // Экран полного хадиса
  if (selectedHadith) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 text-white sticky top-0 z-20 shadow-md">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedHadith(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-lg text-white leading-tight">
              {selectedHadith.title}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {/* Арабский оригинал */}
          {selectedHadith.hadeeth_ar && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <div className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wide">
                العربية
              </div>
              <div
                className="text-right text-xl leading-loose text-stone-800 font-arabic"
                dir="rtl"
                style={{ fontFamily: 'Traditional Arabic, serif' }}
              >
                {selectedHadith.hadeeth_ar}
              </div>
            </div>
          )}

          {/* Узбекский перевод */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <div className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wide">
              O'zbekcha tarjima
            </div>
            <p className="text-base text-stone-800 leading-relaxed">
              {selectedHadith.hadeeth}
            </p>
          </div>

          {/* Источник и степень */}
          <div className="bg-emerald-50 rounded-3xl p-4 text-sm space-y-2">
            {selectedHadith.attribution && (
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-800">📚 Manba:</span>
                <span className="text-emerald-900">{selectedHadith.attribution}</span>
              </div>
            )}
            {selectedHadith.grade && (
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-800">✅ Darajasi:</span>
                <span className="text-emerald-900">{selectedHadith.grade}</span>
              </div>
            )}
          </div>

          {/* Объяснение */}
          {selectedHadith.explanation && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <div className="text-xs font-bold text-emerald-700 mb-3 uppercase tracking-wide">
                Sharh
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {selectedHadith.explanation}
              </p>
            </div>
          )}

          {/* Полезные заметки */}
          {selectedHadith.hints && selectedHadith.hints.length > 0 && (
            <div className="bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-100">
              <div className="text-xs font-bold text-amber-800 mb-3 uppercase tracking-wide">
                💡 Foydali ma'lumotlar
              </div>
              <ul className="space-y-2 text-sm text-stone-700 list-disc list-inside">
                {selectedHadith.hints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Экран списка хадисов категории
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
        <div className="bg-linear-to-br from-emerald-600 to-teal-700 text-white sticky top-0 z-20 shadow-md">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-white leading-tight">
                {selectedCategory.title}
              </h1>
              <p className="text-xs text-white/80">
                {hadiths.length} ta hadis
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loadingHadiths ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : hadiths.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">📖</div>
              <p className="text-sm">Hadislar topilmadi</p>
            </div>
          ) : (
            hadiths.map((h) => (
              <button
                key={h.id}
                onClick={() => loadFullHadith(h.id)}
                disabled={loadingFull}
                className="w-full bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-xl transition-all text-left active:scale-[0.98] disabled:opacity-50"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-stone-900 leading-snug">
                      {h.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 shrink-0 mt-2" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Экран категорий
  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">📖 Hadislar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => loadHadiths(cat)}
                className="w-full bg-white rounded-3xl p-5 shadow-sm border border-stone-100 hover:shadow-xl transition-all text-left active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-bold text-base text-stone-900 leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      {cat.hadeeths_count} ta hadis
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};