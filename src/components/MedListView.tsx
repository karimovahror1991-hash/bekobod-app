import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Phone, MapPin } from 'lucide-react';

interface MedListViewProps {
  onClose: () => void;
  type: 'dorixona' | 'kasalxona';
}

interface MedItem {
  id: number;
  type: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

const TYPE_INFO = {
  dorixona: { label: 'Dorixonalar', icon: '💊', gradient: 'from-emerald-500 to-green-600' },
  kasalxona: { label: 'Kasalxonalar', icon: '🏨', gradient: 'from-blue-500 to-indigo-600' },
};

export const MedListView: React.FC<MedListViewProps> = ({ onClose, type }) => {
  const [items, setItems] = useState<MedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://bekobod-app-1.onrender.com';
  const info = TYPE_INFO[type];

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/med/list?type=${type}`);
        const data = await res.json();
        setItems(data.med || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type]);

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className={`bg-linear-to-br ${info.gradient} text-white sticky top-0 z-20 shadow-md`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-xl text-white">
            {info.icon} {info.label}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">{info.icon}</div>
            <p className="text-sm">Hozircha ma'lumot yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <h3 className="font-bold text-lg text-stone-900">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="text-sm text-stone-600">{item.description}</p>
                )}

                {item.address && (
                  <div className="flex items-start space-x-2 text-sm text-stone-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                    <span>{item.address}</span>
                  </div>
                )}

                {item.phone && (
                  <a
                    href={`tel:${item.phone.replace(/\s/g, '')}`}
                    className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Qo'ng'iroq qilish</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};