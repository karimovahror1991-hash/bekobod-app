import React, { useState } from 'react';
import { ArrowLeft, Loader2, Copy, Check, ArrowDownUp, X } from 'lucide-react';

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
  { code: 'ky', label: "Qirg'izcha", flag: '🇰🇬' },
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
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const fromInfo = LANGUAGES.find(l => l.code === fromLang);
  const toInfo = LANGUAGES.find(l => l.code === toLang);

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

  const handleClear = () => {
    setText('');
    setResult('');
  };

  // Экран выбора языка
  if (showFromPicker || showToPicker) {
    const isFrom = showFromPicker;
    const current = isFrom ? fromLang : toLang;
    return (
      <div className="min-h-screen bg-linear-to-b from-cyan-50 to-blue-100">
        <div className="bg-linear-to-br from-cyan-500 to-blue-600 text-white sticky top-0 z-20 shadow-md">
          <div className="max-w-2xl mx-auto px-4 py-5 flex items-center space-x-3">
            <button
              onClick={() => {
                setShowFromPicker(false);
                setShowToPicker(false);
              }}
              className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-xl text-white">
              {isFrom ? 'Qaysi tildan' : 'Qaysi tilga'}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                if (isFrom) setFromLang(l.code);
                else setToLang(l.code);
                setShowFromPicker(false);
                setShowToPicker(false);
              }}
              className={`w-full p-5 rounded-2xl flex items-center space-x-4 transition-all active:scale-95 ${
                current === l.code
                  ? 'bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-stone-800 shadow-sm border border-stone-100 hover:shadow-md'
              }`}
            >
              <span className="text-3xl">{l.flag}</span>
              <span className="font-bold text-lg">{l.label}</span>
              {current === l.code && (
                <Check className="w-6 h-6 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-cyan-50 to-blue-100">
      {/* Заголовок */}
      <div className="bg-linear-to-br from-cyan-500 to-blue-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🌐 Tarjimon</h1>
            <p className="text-xs text-white/80">Matn tarjimoni</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Выбор языков */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-stone-100">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFromPicker(true)}
              className="flex-1 p-4 rounded-2xl bg-cyan-50 hover:bg-cyan-100 transition-all active:scale-95 text-left"
            >
              <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wide mb-1">
                Qaysi tildan
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{fromInfo?.flag}</span>
                <span className="font-bold text-base text-stone-900 truncate">
                  {fromInfo?.label}
                </span>
              </div>
            </button>

            <button
              onClick={handleSwap}
              className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform shrink-0"
            >
              <ArrowDownUp className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowToPicker(true)}
              className="flex-1 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-all active:scale-95 text-left"
            >
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1">
                Qaysi tilga
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{toInfo?.flag}</span>
                <span className="font-bold text-base text-stone-900 truncate">
                  {toInfo?.label}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Ввод текста */}
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Matn kiriting
            </label>
            {text && (
              <button
                onClick={handleClear}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tarjima qilish uchun matn yozing..."
            rows={6}
            className="w-full px-4 py-4 rounded-2xl bg-stone-50 border-2 border-stone-200 text-base focus:outline-none focus:border-cyan-500 resize-none transition-colors"
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className="w-full mt-4 py-5 bg-linear-to-br from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-xl active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Tarjima qilinmoqda...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Tarjima qilish</span>
              </>
            )}
          </button>
        </div>

        {/* Результат */}
        {result && (
          <div className="bg-linear-to-br from-cyan-500 to-blue-600 rounded-3xl p-5 shadow-xl text-white">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wide text-white/90">
                Tarjima
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition"
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
            <div className="px-4 py-4 rounded-2xl bg-white/10 text-base leading-relaxed whitespace-pre-wrap font-medium">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};