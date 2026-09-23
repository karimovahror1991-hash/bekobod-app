import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Phone, MapPin } from 'lucide-react';
import { contacts, ContactCategory } from '../data/contacts';

interface EmergencyViewProps {
  onClose: () => void;
}

const CATEGORY_GRADIENTS: { [key: string]: string } = {
  'Favqulodda xizmatlar': 'from-rose-500 to-red-600',
  'Hokimiyat': 'from-indigo-500 to-violet-600',
  'Aloqa va Internet': 'from-cyan-500 to-blue-600',
  'Banklar': 'from-emerald-500 to-green-600',
  'Soliq va boshqa xizmatlar': 'from-amber-500 to-orange-600',
};

export const EmergencyView: React.FC<EmergencyViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | null>(null);

  // Если выбрана категория — показываем контакты
  if (selectedCategory) {
    const gradient = CATEGORY_GRADIENTS[selectedCategory.title] || 'from-stone-500 to-stone-700';
    
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="font-bold text-xl text-white">
                {selectedCategory.icon} {selectedCategory.title}
              </h1>
              <p className="text-xs text-white/80">
                {selectedCategory.contacts.length} ta kontakt
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {selectedCategory.contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
            >
              <div className="font-bold text-base text-stone-900">
                {contact.name}
              </div>
              {contact.address && (
                <div className="text-sm text-stone-500 flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" />
                  <span>{contact.phone}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Экран категорий (большие иконки)
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
          <h1 className="font-bold text-2xl text-stone-900">📞 Shahar telefonlari</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {contacts.map((category, index) => {
            const gradient = CATEGORY_GRADIENTS[category.title] || 'from-stone-500 to-stone-700';
            return (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`w-full bg-linear-to-br ${gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                <div className="text-7xl mb-4">{category.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {category.title}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  {category.contacts.length} ta kontakt
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};