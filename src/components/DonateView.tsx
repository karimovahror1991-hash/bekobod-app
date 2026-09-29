import React, { useState } from 'react';
import { ArrowLeft, Heart, Copy, Check, CreditCard } from 'lucide-react';

interface DonateViewProps {
  onClose: () => void;
}

// 👇 ЗАМЕНИ НА СВОИ РЕКВИЗИТЫ
const CARDS = [
  { id: 1, name: 'Uzcard', number: '5614 6814 0499 5387', holder: 'KARIMOV A.' },
 
];

export const DonateView: React.FC<DonateViewProps> = ({ onClose }) => {
  const [showCards, setShowCards] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, number: string) => {
    const cleaned = number.replace(/\s/g, '');
    navigator.clipboard.writeText(cleaned);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-teal-100">
  <div className="bg-linear-to-br from-emerald-500 to-teal-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">💖 Loyihani qo'llab-quvvatlash</h1>
            <p className="text-xs text-white/80">Bekobod Shahar Portali</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-3">🏙️</div>
            <h2 className="font-bold text-xl text-stone-900">Bekobod Shahar Portali</h2>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">
            Assalomu alaykum, aziz foydalanuvchilar!
          </p>

          <p className="text-sm text-stone-700 leading-relaxed">
            <b>Bekobod Shahar Portali</b> — bu Bekobod shahri aholisi uchun bepul va qulay mobil ilova.
            Bu yerda siz yangiliklar, e'lonlar, taksi xizmatlari, ish o'rinlari, restoranlar va boshqa
            ko'plab foydali ma'lumotlarni topishingiz mumkin.
          </p>

          <p className="text-sm text-stone-700 leading-relaxed">
            Ilovani rivojlantirish, yangi funksiyalar qo'shish va server xarajatlarini qoplash uchun
            sizning yordamingiz kerak. Har qanday hissa — katta yoki kichik — biz uchun juda qadrli!
          </p>

                    <div className="bg-emerald-50 rounded-2xl p-4 text-xs text-emerald-800 space-y-1">
            <div>✅ Ilova doim bepul qoladi</div>
            <div>✅ Reklama kamayadi</div>
            <div>✅ Yangi funksiyalar tezroq qo'shiladi</div>
          </div>

          <p className="text-xs text-stone-500 text-center italic">
            Sizning har bir so'mingiz shahrimiz uchun xizmat qiladi! 🇺🇿
          </p>
        </div>

        {!showCards ? (
          <button
            onClick={() => setShowCards(true)}
                       className="w-full py-5 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-3xl font-bold text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Heart className="w-6 h-6 fill-white" />
            <span>Qo'llab-quvvatlash</span>
          </button>
        ) : (
          <>
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-2xl shadow-sm">
                <CreditCard className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-stone-800 text-sm">Karta rekvizitlari</span>
              </div>
            </div>

            {CARDS.map((card) => (
              <div
                key={card.id}
                                className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl text-white space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold opacity-90">{card.name}</div>
                  <CreditCard className="w-6 h-6 opacity-80" />
                </div>

                <div className="font-mono text-2xl font-bold tracking-wider">
                  {card.number}
                </div>

                <div className="text-xs opacity-80 uppercase tracking-wide">
                  {card.holder}
                </div>

                <button
                  onClick={() => handleCopy(card.id, card.number)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 active:scale-95"
                >
                  {copiedId === card.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Karta raqamini nusxalash</span>
                    </>
                  )}
                </button>
              </div>
            ))}

            <div className="bg-amber-50 rounded-2xl p-4 text-xs text-amber-800 text-center">
              💡 Karta raqamini nusxalab, o'z bankingiz ilovasiga o'tkazing va
              istalgan miqdorda yuboring. Rahmat!
            </div>
          </>
        )}

        <div className="text-center text-xs text-stone-400 pt-4">
          ❤️ Sizning yordamingiz uchun tashakkur!
        </div>
      </div>
    </div>
  );
};