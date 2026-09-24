import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Phone, MapPin, User } from 'lucide-react';

interface ShifokorlarViewProps {
  onClose: () => void;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  created_at: string;
}

const SPECIALTIES = [
  { id: 'all', label: 'Barchasi', icon: '👨‍⚕️' },
  { id: 'terapevt', label: 'Terapevt', icon: '🩺' },
  { id: 'stomatolog', label: 'Stomatolog', icon: '🦷' },
  { id: 'pediatr', label: 'Pediatr', icon: '👶' },
  { id: 'nevropatolog', label: 'Nevropatolog', icon: '🧠' },
  { id: 'okulist', label: 'Okulist', icon: '👁' },
  { id: 'lor', label: 'LOR', icon: '👂' },
  { id: 'dermatolog', label: 'Dermatolog', icon: '🧴' },
  { id: 'kardiolog', label: 'Kardiolog', icon: '❤️' },
];

export const ShifokorlarView: React.FC<ShifokorlarViewProps> = ({ onClose }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const url = selectedSpecialty === 'all'
        ? `${API_URL}/api/doctors/list`
        : `${API_URL}/api/doctors/list?specialty=${selectedSpecialty}`;
      const res = await fetch(url);
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [selectedSpecialty]);

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-50 to-red-100">
      {/* Заголовок */}
      <div className="bg-linear-to-br from-rose-600 to-red-700 text-white sticky top-0 z-20 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🏥 Shifokorlar</h1>
            <p className="text-xs text-white/80">Shifokorlar ro'yxati</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Специальности */}
        <div className="flex overflow-x-auto gap-2 mb-5 no-scrollbar pb-2">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecialty(spec.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === spec.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {spec.icon} {spec.label}
            </button>
          ))}
        </div>

        {/* Список врачей */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-5xl mb-3">🏥</div>
            <p className="text-sm">Hozircha shifokorlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-stone-900">
                      {doctor.name}
                    </div>
                    <div className="text-xs text-rose-700 font-semibold">
                      {doctor.specialty}
                    </div>
                  </div>
                </div>

                {doctor.description && (
                  <p className="text-sm text-stone-600">
                    {doctor.description}
                  </p>
                )}

                {doctor.address && (
                  <div className="flex items-start space-x-2 text-xs text-stone-500">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                    <span>{doctor.address}</span>
                  </div>
                )}

                {doctor.phone && (
                  <a
                    href={`tel:${doctor.phone.replace(/\s/g, '')}`}
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