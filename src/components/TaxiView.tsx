import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2, Star } from 'lucide-react';

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

interface Driver {
  id: number;
  name: string;
  phone: string;
}

export const TaxiView: React.FC<TaxiViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'all' | 'bekobod_toshkent' | 'toshkent_bekobod'>('all');

  // Состояние формы
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [newDirection, setNewDirection] = useState('bekobod_toshkent');
  const [totalSeats, setTotalSeats] = useState(4);
  const [creating, setCreating] = useState(false);
  const [bookedRides, setBookedRides] = useState<number[]>([]);
  // Рейтинги
  const [ratings, setRatings] = useState<{[key: string]: {avg: number, count: number}}>({});
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadRides = async () => {
    try {
      setLoading(true);
      const url = direction === 'all' 
        ? `${API_URL}/api/taxi/list` 
        : `${API_URL}/api/taxi/list?direction=${direction}`;
      const res = await fetch(url);
      const data = await res.json();
      const ridesList = data.rides || [];
      setRides(ridesList);

      // Загружаем рейтинги по телефону таксиста
      const ratingsData: {[key: string]: {avg: number, count: number}} = {};
      
      for (const ride of ridesList) {
        if (!ratingsData[ride.driver_phone]) {
          try {
            const r = await fetch(`${API_URL}/api/taxi/driver-rating/${encodeURIComponent(ride.driver_phone)}`);
            const d = await r.json();
            ratingsData[ride.driver_phone] = { avg: d.avgRating || 0, count: d.count || 0 };
          } catch (e) {
            ratingsData[ride.driver_phone] = { avg: 0, count: 0 };
          }
        }
      }
      
      setRatings(ratingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/taxi/drivers`);
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRides();
  }, [direction]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim()) return;

    setCreating(true);
    try {
          // Нормализуем телефон: добавляем +998, если его нет
      let normalizedPhone = driverPhone.trim().replace(/\s/g, '');
      if (!normalizedPhone.startsWith('+')) {
        if (normalizedPhone.startsWith('998')) {
          normalizedPhone = '+' + normalizedPhone;
        } else {
          normalizedPhone = '+998' + normalizedPhone;
        }
      }

            // Сначала регистрируем таксиста (если его нет)
      const regRes = await fetch(`${API_URL}/api/taxi/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: driverName.trim(),
          phone: normalizedPhone,
        }),
      });
          const regData = await regRes.json();
      
            if (regData.error) {
        alert(regData.error);
        return;
      }
      setDriverName('');
      setDriverPhone('');
      setTab('list');
      loadRides();
      loadDrivers();
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
      setBookedRides((prev) => [...prev, rideId]);
    } catch (err) {
      console.error(err);
    }
  };
  const handleCancel = async (rideId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/taxi/cancel-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setBookedRides((prev) => prev.filter((id) => id !== rideId));
          loadRides();
     
    } catch (err) {
      console.error(err);
    }
  };
  const handleRate = async (rating: number) => {
    if (!showRatingModal) return;
    
    // showRatingModal хранит rideId
    const rideId = Number(showRatingModal);
    
    try {
      await fetch(`${API_URL}/api/taxi/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, rating }),
      });
      
           setShowRatingModal(null);
      setSelectedRating(0);
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
      <div className="bg-white/95 backdrop-blur-lg border-b border-stone-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>
          <h1 className="font-bold text-2xl text-stone-900">🚕 Taksi</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-4 flex space-x-3">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'list' 
                ? 'bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg scale-105' 
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span className="text-xl">🔍</span>
            <span>Qidirish</span>
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'create' 
                ? 'bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg scale-105' 
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span className="text-xl">🚗</span>
            <span>Haydovchi</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'list' && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                onClick={() => setDirection('all')}
                className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                  direction === 'all' 
                    ? 'bg-stone-900 text-white shadow-md' 
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setDirection('bekobod_toshkent')}
                className={`py-3 rounded-2xl text-xs font-bold transition-all leading-tight ${
                  direction === 'bekobod_toshkent' 
                    ? 'bg-stone-900 text-white shadow-md' 
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Bekobod<br/>→ Toshkent
              </button>
              <button
                onClick={() => setDirection('toshkent_bekobod')}
                className={`py-3 rounded-2xl text-xs font-bold transition-all leading-tight ${
                  direction === 'toshkent_bekobod' 
                    ? 'bg-stone-900 text-white shadow-md' 
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Toshkent<br/>→ Bekobod
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
                  const driverRating = ratings[ride.driver_phone];
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-stone-600">
                          <User className="w-4 h-4" />
                          <span>{ride.driver_name}</span>
                        </div>
                        {driverRating && driverRating.count > 0 && (
                          <button
                            onClick={() => setShowRatingModal(ride.id.toString())}
                            className="flex items-center space-x-1 text-xs"
                          >
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-stone-700">{driverRating.avg}</span>
                            <span className="text-stone-400">({driverRating.count})</span>
                          </button>
                        )}
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
                        {bookedRides.includes(ride.id) ? (
                          <button
                            onClick={() => handleCancel(ride.id)}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Bekor qilish
                          </button>
                        ) : (
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
                        )}
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

      {/* Модальное окно оценки */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-stone-900 text-center mb-2">
              Haydovchini baholang
            </h3>
            <p className="text-xs text-stone-500 text-center mb-4">
              Sizning bahoyingiz anonim saqlanadi
            </p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="text-4xl transition-transform active:scale-110"
                >
                  <span className={star <= selectedRating ? 'text-amber-500' : 'text-stone-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleRate(selectedRating)}
                disabled={selectedRating === 0}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold disabled:opacity-50 transition"
              >
                Yuborish
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(null);
                  setSelectedRating(0);
                }}
                className="px-5 py-3 text-stone-500 hover:text-stone-700"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};