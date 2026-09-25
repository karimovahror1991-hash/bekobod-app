import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, User, Plus, Loader2, Star, Search, Car } from 'lucide-react';

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
  user_id: number | null;
  created_at: string;
}

interface Driver {
  id: number;
  name: string;
  phone: string;
}

export const TaxiView: React.FC<TaxiViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [userId, setUserId] = useState<number | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'all' | string>('all');

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [newDirection, setNewDirection] = useState('');
  const [totalSeats, setTotalSeats] = useState(4);
  const [creating, setCreating] = useState(false);
  const [bookedRides, setBookedRides] = useState<number[]>([]);
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
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      setUserId(tg.initDataUnsafe.user.id);
    }
  }, []);

  useEffect(() => {
    loadRides();
  }, [direction]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !driverPhone.trim() || !newDirection.trim()) return;

    setCreating(true);
    try {
      let normalizedPhone = driverPhone.trim().replace(/\s/g, '');
      if (!normalizedPhone.startsWith('+')) {
        if (normalizedPhone.startsWith('998')) {
          normalizedPhone = '+' + normalizedPhone;
        } else {
          normalizedPhone = '+998' + normalizedPhone;
        }
      }

      const regRes = await fetch(`${API_URL}/api/taxi/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: driverName.trim(),
          driverPhone: normalizedPhone,
          direction: newDirection,
          totalSeats,
          userId,
        }),
      });
      const regData = await regRes.json();
      
      if (regData.error) {
        alert(regData.error);
        return;
      }
      setDriverName('');
      setDriverPhone('');
      setNewDirection('');
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
        body: JSON.stringify({ rideId, userId }),
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

  const handleDelete = async (rideId: number) => {
    if (!userId) return;
    if (!confirm("Reysni o'chirishni tasdiqlaysizmi?")) return;

    try {
      const res = await fetch(`${API_URL}/api/taxi/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, userId }),
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

  const handleRate = async (rating: number) => {
    if (!showRatingModal) return;
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

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      {/* Заголовок */}
      <div className="bg-linear-to-br from-amber-500 to-orange-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-white">🚕 Shaharlararo taksi</h1>
            <p className="text-xs text-white/80">Sayohat qilish oson</p>
          </div>
        </div>

        {/* Вкладки */}
        <div className="max-w-2xl mx-auto px-4 pb-4 flex space-x-2">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'list'
                ? 'bg-white text-amber-700 shadow-lg'
                : 'bg-white/20 text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Qidirish</span>
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'create'
                ? 'bg-white text-amber-700 shadow-lg'
                : 'bg-white/20 text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Haydovchi</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {tab === 'list' && (
          <>
            {/* Фильтр */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setDirection('all')}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                  direction === 'all'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setDirection('shaharlararo')}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                  direction === 'shaharlararo'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                🚗 Shaharlararo
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <div className="text-6xl mb-3">🚕</div>
                <p className="text-sm">Hozircha reyslar yo'q</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => {
                  const freeSeats = ride.total_seats - ride.booked_seats;
                  const isFull = freeSeats <= 0;
                  const driverRating = ratings[ride.driver_phone];
                  const fillPercent = (ride.booked_seats / ride.total_seats) * 100;

                  return (
                    <div
                      key={ride.id}
                      className="bg-white rounded-3xl shadow-md border border-stone-100 overflow-hidden"
                    >
                      {/* Верхняя часть — маршрут */}
                      <div className="bg-linear-to-br from-amber-50 to-orange-50 p-5 border-b border-amber-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">
                              Yo'nalish
                            </div>
                            <div className="font-bold text-lg text-stone-900 leading-tight">
                              {ride.direction}
                            </div>
                          </div>
                          <div className={`text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap ml-3 ${
                            isFull
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isFull ? "To'lgan" : `${freeSeats} joy`}
                          </div>
                        </div>
                      </div>

                      {/* Водитель + рейтинг */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-stone-900">
                                {ride.driver_name}
                              </div>
                              {driverRating && driverRating.count > 0 && (
                                <div className="flex items-center space-x-1 text-xs">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span className="font-bold text-stone-700">{driverRating.avg}</span>
                                  <span className="text-stone-400">({driverRating.count})</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowRatingModal(ride.id.toString())}
                            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-semibold transition"
                          >
                            ⭐ Baholash
                          </button>
                        </div>

                        {/* Прогресс-бар */}
                        <div>
                          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                            <span>Band joylar</span>
                            <span className="font-bold">{ride.booked_seats} / {ride.total_seats}</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-linear-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex space-x-2">
                          <a
                            href={`tel:${ride.driver_phone}`}
                            className="flex-1 py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-1.5 transition shadow-md active:scale-95"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Qo'ng'iroq</span>
                          </a>
                          {bookedRides.includes(ride.id) ? (
                            <button
                              onClick={() => handleCancel(ride.id)}
                              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition shadow-md active:scale-95"
                            >
                              Bekor qilish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBook(ride.id)}
                              disabled={isFull}
                              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition shadow-md active:scale-95 ${
                                isFull
                                  ? 'bg-stone-100 text-stone-400'
                                  : 'bg-linear-to-br from-amber-500 to-orange-600 text-white'
                              }`}
                            >
                              {isFull ? "To'lgan" : 'Joy band qilish'}
                            </button>
                          )}
                        </div>

                        {userId && ride.user_id === userId && (
                          <button
                            onClick={() => handleDelete(ride.id)}
                            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-semibold transition border border-rose-200"
                          >
                            🗑 Reysni o'chirish
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
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg">
              <div className="text-4xl mb-2">🚗</div>
              <h2 className="font-bold text-xl mb-1">Haydovchi bo'ling</h2>
              <p className="text-sm text-white/80">
                Reys yaratib, yo'lovchilarni toping
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                  Ismingiz
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Masalan: Akmal"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                  Telefon raqamingiz
                </label>
                <input
                  type="tel"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                  Yo'nalish
                </label>
                <input
                  type="text"
                  required
                  value={newDirection}
                  onChange={(e) => setNewDirection(e.target.value)}
                  placeholder="Masalan: Bekobod → Samarqand"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Shahar nomlarini to'g'ri yozing
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                  Bo'sh joylar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalSeats(n)}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                        totalSeats === n
                          ? 'bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-md'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {n} joy
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !driverName.trim() || !driverPhone.trim() || !newDirection.trim()}
              className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg active:scale-95"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Yaratilmoqda...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
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