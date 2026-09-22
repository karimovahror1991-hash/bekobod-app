import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2 } from 'lucide-react';

interface TaxiViewProps {
  onClose: () => void;
}

interface Ride {
  id: number;
  driver_name: string;
  driver_phone: string;
  direction: string;
  total_seats: number;
  booked_seats: number;
  status: string;
  created_at: string;
}

export const TaxiView: React.FC<TaxiViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'all' | 'bekobod_toshkent' | 'toshkent_bekobod'>('all');

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [newDirection, setNewDirection] = useState('bekobod_toshkent');
  const [totalSeats, setTotalSeats] = useState(4);
  const [creating, setCreating] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadRides = async () => {
    try {
      setLoading(true);
      const url = direction === 'all' 
        ? `${API_URL}/api/taxi/list` 
        : `${API_URL}/api/taxi/list?direction=${direction}`;
      const res = await fetch(url);
      const data = await res.json();
      setRides(data.rides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, [direction]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/taxi/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim(),
          direction: newDirection,
          totalSeats,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setDriverName('');
      setDriverPhone('');
      setTab('list');
      loadRides();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleBook = async (rideId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/taxi/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      loadRides();
    } catch (err) {
      console.error(err);
    }
  };

  const getDirectionLabel = (dir: string) => {
    return dir === 'bekobod_toshkent' ? 'Bekobod → Toshkent' : 'Toshkent → Bekobod';
  };

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
          <h1 className="font-bold text-lg text-stone-900">Taksi</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3 flex space-x-2">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
              tab === 'list' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            Qidirish
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
              tab === 'create' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            Haydovchi
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'list' && (
          <>
            <div className="flex space-x-2 mb-4 overflow-x-auto">
              <button
                onClick={() => setDirection('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                  direction === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setDirection('bekobod_toshkent')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                  direction === 'bekobod_toshkent' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Bekobod → Toshkent
              </button>
              <button
                onClick={() => setDirection('toshkent_bekobod')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                  direction === 'toshkent_bekobod' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Toshkent → Bekobod
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                Hozircha reyslar yo'q
              </div>
            ) : (
              <div className="space-y-3">
                {rides.map((ride) => {
                  const freeSeats = ride.total_seats - ride.booked_seats;
                  const isFull = freeSeats <= 0;
                  return (
                    <div
                      key={ride.id}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-base text-stone-900">
                          {getDirectionLabel(ride.direction)}
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isFull ? "To'lgan" : `${freeSeats} joy`}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-stone-600">
                        <User className="w-4 h-4" />
                        <span>{ride.driver_name}</span>
                      </div>

                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${(ride.booked_seats / ride.total_seats) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-stone-400 text-center">
                        {ride.booked_seats} / {ride.total_seats} joy band
                      </div>

                      <div className="flex space-x-2">
                        <a
                          href={`tel:${ride.driver_phone}`}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-1.5 transition"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Qo'ng'iroq</span>
                        </a>
                        <button
                          onClick={() => handleBook(ride.id)}
                          disabled={isFull}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                            isFull
                              ? 'bg-stone-100 text-stone-400'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {isFull ? "To'lgan" : 'Joy band qilish'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <h2 className="font-bold text-lg text-stone-900 mb-2">
              Haydovchi sifatida ro'yxatdan o'tish
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ismingiz
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Masalan: Akmal"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telefon raqamingiz
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Yo'nalish
              </label>
              <select
                value={newDirection}
                onChange={(e) => setNewDirection(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 bg-white"
              >
                <option value="bekobod_toshkent">Bekobod → Toshkent</option>
                <option value="toshkent_bekobod">Toshkent → Bekobod</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Bo'sh joylar soni
              </label>
              <select
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 bg-white"
              >
                <option value={2}>2 joy</option>
                <option value={3}>3 joy</option>
                <option value={4}>4 joy</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating || !driverName.trim() || !driverPhone.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Yaratilmoqda...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Reys yaratish</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};