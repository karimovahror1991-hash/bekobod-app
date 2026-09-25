import React, { useState } from 'react';
import { ArrowLeft, Loader2, Copy, Check, Volume2 } from 'lucide-react';

interface TarjimonViewProps {
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'kk', label: 'Qozoqcha', flag: '🇰🇿' },
  { code: 'ky', label: 'Qirg\'izcha', flag: '🇰🇬' },
  { code: 'tg', label: 'Tojikcha', flag: '🇹🇯' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export const TarjimonView: React.FC<TarjimonViewProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [fromLang, setFromLang] = useState('uz');
  const [toLang, setToLang] = useState('ru');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), from: fromLang, to: toLang }),
      });
      const data = await res.json();
      if (data.error) {
        setResult('Xatolik: ' + data.error);
      } else {
        setResult(data.translated || '');
      }
    } catch (err) {
      console.error(err);
      setResult('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setText(result);
    setResult(text);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-cyan-50 to-blue-100">
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🌐 Tarjimon</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Языки */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Qaysi tildan
            </label>
            <select
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-cyan-500 bg-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="w-full py-2 text-cyan-600 font-semibold text-sm hover:bg-cyan-50 rounded-xl transition"
          >
            ⇅ Almashtirish
          </button>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Qaysi tilga
            </label>
            <select
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-cyan-500 bg-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ввод текста */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100">
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            Matn kiriting
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tarjima qilish uchun matn yozing..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-cyan-500 resize-none"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="w-full mt-3 py-3 bg-linear-to-br from-cyan-500 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Tarjima qilinmoqda...</span>
              </>
            ) : (
              <span>Tarjima qilish</span>
            )}
          </button>
        </div>

        {/* Результат */}
        {result && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-stone-700">
                Tarjima
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs text-cyan-600 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>
            <div className="px-4 py-3 rounded-xl bg-cyan-50 text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};