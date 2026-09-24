import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { hayitlar } from '../data/hayitlar';

interface HayitlarViewProps {
  onClose: () => void;
}

export const HayitlarView: React.FC<HayitlarViewProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50 to-pink-100">
      {/* Заголовок */}
      <div className="bg-linear-to-br from-rose-600 to-pink-700 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🎉 Hayitlar</h1>
            <p className="text-xs text-white/80">Bayramlar taqvimi</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-3">
          {hayitlar.map((hayit) => (
            <div
              key={hayit.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex items-center space-x-4"
            >
              <div className="text-5xl shrink-0">{hayit.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg text-stone-900">
                  {hayit.title}
                </div>
                <div className="flex items-center space-x-1.5 text-sm text-rose-700 font-semibold mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{hayit.date}</span>
                </div>
                {hayit.description && (
                  <div className="text-xs text-stone-500 mt-1">
                    {hayit.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Примечание */}
        <div className="mt-6 bg-rose-50 rounded-3xl p-4 text-xs text-rose-800 text-center">
          Sanalar taxminiy. Aniq sanalar oyning ko'rinishiga qarab o'zgarishi mumkin.
        </div>
      </div>
    </div>
  );
};