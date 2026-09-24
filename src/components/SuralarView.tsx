import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react';

interface SuralarViewProps {
  onClose: () => void;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  arabic: string;
  transliteration: string;
  translation: string;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export const SuralarView: React.FC<SuralarViewProps> = ({ onClose }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/surahs`);
        const data = await res.json();
        setSurahs(data.surahs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSurahs();
  }, []);

  const loadSurahDetail = async (number: number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`${API_URL}/api/surah/${number}`);
      const data = await res.json();
      setSelectedSurah(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Экран текста суры
  if (selectedSurah) {
    return (
      <div className="min-h-screen bg-linear-to-b from-amber-50 to-orange-100">
        <div className="bg-linear-to-br from-amber-600 to-orange-700 text-white sticky top-0 z-20 shadow-md">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedSurah(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-lg text-white">
                {selectedSurah.number}. {selectedSurah.englishName}
              </h1>
              <p className="text-xs text-white/80">
                {selectedSurah.numberOfAyahs} oyat • {selectedSurah.revelationType === 'Meccan' ? 'Makkiy' : 'Madaniy'}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : (
            selectedSurah.ayahs.map((ayah) => (
              <div
                key={ayah.number}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                    {ayah.number}
                  </div>
                </div>

                {ayah.transliteration && (
                  <div className="text-sm text-stone-700 italic leading-relaxed text-center">
                    {ayah.transliteration}
                  </div>
                )}

                {ayah.translation && (
                  <div className="text-sm text-stone-800 leading-relaxed text-center border-t border-stone-100 pt-3">
                    {ayah.translation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Экран списка сур
  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 to-orange-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">📖 Suralar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="space-y-2">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => loadSurahDetail(surah.number)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {surah.number}
                  </div>
                                     <div className="text-left">
                    <div className="font-bold text-stone-900">
                      {surah.number}. {surah.englishName}
                    </div>
                    <div className="text-xs text-stone-500">
                      {surah.numberOfAyahs} oyat • {surah.revelationType === 'Meccan' ? 'Makkiy' : 'Madaniy'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};