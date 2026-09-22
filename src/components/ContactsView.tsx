import React from 'react';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';
import { contacts } from '../data/contacts';

interface ContactsViewProps {
  onClose: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      {/* Заголовок */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <h1 className="font-bold text-lg text-stone-900">Favqulodda</h1>
        </div>
      </div>

      {/* Контакты */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {contacts.map((category, catIndex) => (
          <div key={catIndex}>
            <h2 className="font-bold text-base text-stone-900 mb-3 flex items-center space-x-2">
              <span>{category.icon}</span>
              <span>{category.title}</span>
            </h2>
            <div className="space-y-2">
              {category.contacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-stone-900 truncate">
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
        ))}
      </div>
    </div>
  );
};