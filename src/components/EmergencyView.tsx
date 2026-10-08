import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, Loader2 } from 'lucide-react';

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
  line: string;
}

const CATEGORY_INFO: CategoryInfo[] = [
  { id: 'favqulodda', title: 'Favqulodda xizmatlar', icon: '🚨', line: 'from-rose-400 to-red-500' },
  { id: 'hokimiyat', title: 'Hokimiyat', icon: '🏛️', line: 'from-indigo-400 to-violet-500' },
  { id: 'aloqa', title: 'Aloqa va Internet', icon: '📡', line: 'from-cyan-400 to-blue-500' },
  { id: 'banklar', title: 'Banklar', icon: '🏦', line: 'from-emerald-400 to-green-500' },
  { id: 'soliq', title: 'Boshqa xizmatlar', icon: '🏢', line: 'from-amber-400 to-orange-500' },
];

export const EmergencyView: React.FC<EmergencyViewProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://bekobod-app-1.onrender.com';

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

  useEffect(() => {
    loadContacts();
  }, []);

  // === ЭКРАН КОНТАКТОВ КАТЕГОРИИ ===
  if (selectedCategory) {
    const categoryContacts = contacts.filter(c => c.category === selectedCategory.id);

    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={`/icons/${selectedCategory.id}.png`}
                alt=""
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg text-stone-900">{selectedCategory.title}</h1>
                <p className="text-xs text-stone-400">{categoryContacts.length} ta kontakt</p>
              </div>
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
              <img
                src={`/icons/${selectedCategory.id}.png`}
                alt=""
                className="w-24 h-24 object-contain mx-auto mb-4 opacity-50"
              />
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

  // === ГЛАВНЫЙ ЭКРАН — ВЫБОР КАТЕГОРИИ ===
  return (
    <PullToRefresh onRefresh={loadContacts}>
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
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
          <div className="space-y-6">
            {CATEGORY_INFO.map((cat) => {
              const count = contacts.filter(c => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
                >
                  <img
                    src={`/icons/${cat.id}.png`}
                    alt={cat.title}
                    className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                  />

                  <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                    {cat.title}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{count} ta kontakt</span>
                  </div>

                  <div className={`mt-4 w-20 h-1 rounded-full bg-linear-to-r ${cat.line}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
};