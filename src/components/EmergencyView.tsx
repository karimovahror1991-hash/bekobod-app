import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Phone, MapPin } from 'lucide-react';
import { contacts, ContactCategory } from '../data/contacts';

interface EmergencyViewProps {
  onClose: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | null>(null);

  // Если выбрана категория — показываем контакты
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </button>
            <h1 className="font-bold text-lg text-stone-900">
              {selectedCategory.icon} {selectedCategory.title}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-2">
          {selectedCategory.contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-stone-900">
                  {contact.name}
                </div>
                {contact.address && (
                  <div className="text-xs text-stone-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{contact.address}</span>
                  </div>
                )}
              </div>
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="ml-3 px-4 py-2 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <Phone className="w-3 h-3" />
                  <span>{contact.phone}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Список категорий
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
                   <h1 className="font-bold text-lg text-stone-900">Shahar telefonlari</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {contacts.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category)}
            className="w-full bg-white rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 border border-stone-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{category.icon}</div>
              <div className="text-left">
                <div className="font-bold text-base text-stone-900">
                  {category.title}
                </div>
                <div className="text-xs text-stone-400">
                  {category.contacts.length} ta kontakt
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </button>
        ))}
      </div>
    </div>
  );
};