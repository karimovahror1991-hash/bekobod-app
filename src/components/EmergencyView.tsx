import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Phone, MapPin, Loader2 } from 'lucide-react';

interface EmergencyViewProps {
  onClose: () => void;
}

interface Contact {
  id: number;
  category: string;
  name: string;
  phone: string | null;
  address: string | null;
}

interface CategoryInfo {
  id: string;
  title: string;
  icon: string;
  gradient: string;
}

const CATEGORY_INFO: CategoryInfo[] = [
  { id: 'favqulodda', title: 'Favqulodda xizmatlar', icon: '🚨', gradient: 'from-rose-500 to-red-600' },
  { id: 'hokimiyat', title: 'Hokimiyat', icon: '🏛️', gradient: 'from-indigo-500 to-violet-600' },
  { id: 'aloqa', title: 'Aloqa va Internet', icon: '📡', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'banklar', title: 'Banklar', icon: '🏦', gradient: 'from-emerald-500 to-green-600' },
  { id: 'soliq', title: 'Soliq va boshqa xizmatlar', icon: '🏢', gradient: 'from-amber-500 to-orange-600' },
  { id: 'boshqa', title: 'Boshqa xizmatlar', icon: '📋', gradient: 'from-stone-500 to-stone-700' },
];

export const EmergencyView: React.FC<EmergencyViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/contacts/list`);
        const data = await res.json();
        setContacts(data.contacts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Экран контактов категории
  if (selectedCategory) {
    const categoryContacts = contacts.filter(c => c.category === selectedCategory.id);

    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${selectedCategory.gradient} text-white sticky top-0 z-20 shadow-md`}>
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
                {categoryContacts.length} ta kontakt
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : categoryContacts.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <div className="text-5xl mb-3">{selectedCategory.icon}</div>
              <p className="text-sm">Hozircha kontaktlar yo'q</p>
            </div>
          ) : (
            categoryContacts.map((contact) => (
              <div
                key={contact.id}
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
          <h1 className="font-bold text-2xl text-stone-900">📞 Shahar telefonlari</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {CATEGORY_INFO.map((cat) => {
            const count = contacts.filter(c => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full bg-linear-to-br ${cat.gradient} text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-50`}
              >
                <div className="text-7xl mb-4">{cat.icon}</div>
                <div className="font-bold text-xl text-white text-center leading-tight">
                  {cat.title}
                </div>
                <div className="text-sm text-white/80 mt-2">
                  {count} ta kontakt
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};