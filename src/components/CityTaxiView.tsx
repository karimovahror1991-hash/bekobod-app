import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Phone } from 'lucide-react';

interface CityTaxiViewProps {
  onClose: () => void;
}

interface CityTaxi {
  id: number;
  name: string;
  phone: string;
  description: string | null;
  created_at: string;
}

export const CityTaxiView: React.FC<CityTaxiViewProps> = ({ onClose }) => {
  const [taxis, setTaxis] = useState<CityTaxi[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  useEffect(() => {
    const loadTaxis = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/city-taxi/list`);
        const data = await res.json();
        setTaxis(data.taxis || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTaxis();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className="bg-linear-to-br from-amber-500 to-orange-600 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🚕 Shahar taksi</h1>
            <p className="text-xs text-white/80">
              {taxis.length} ta xizmat
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          </div>
        ) : taxis.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">🚕</div>
            <p className="text-sm">Hozircha shahar taksi xizmatlari yo'q</p>
          </div>
        ) : (
          taxis.map((taxi) => (
            <div
              key={taxi.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shrink-0">
                  🚕
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-stone-900">
                    {taxi.name}
                  </h3>
                  {taxi.description && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {taxi.description}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`tel:${taxi.phone.replace(/\s/g, '')}`}
                className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
              >
                <Phone className="w-5 h-5" />
                <span>{taxi.phone}</span>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};