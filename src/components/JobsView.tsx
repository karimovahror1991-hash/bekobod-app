import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Briefcase, Plus, Loader2, Building2, Wallet } from 'lucide-react';

interface JobsViewProps {
  onClose: () => void;
}

interface Job {
  id: number;
  company_name: string;
  position: string;
  salary: string | null;
  description: string | null;
  phone: string;
  status: string;
  created_at: string;
}

export const JobsView: React.FC<JobsViewProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [creating, setCreating] = useState(false);

  const API_URL = 'https://bekobod-app-1.onrender.com';

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/jobs/list`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !position.trim() || !phone.trim()) return;

    setCreating(true);
    try {
      let normalizedPhone = phone.trim().replace(/\s/g, '');
      if (!normalizedPhone.startsWith('+')) {
        if (normalizedPhone.startsWith('998')) {
          normalizedPhone = '+' + normalizedPhone;
        } else {
          normalizedPhone = '+998' + normalizedPhone;
        }
      }

      const res = await fetch(`${API_URL}/api/jobs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          position: position.trim(),
          salary: salary.trim() || null,
          description: description.trim() || null,
          phone: normalizedPhone,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setCompanyName('');
      setPosition('');
      setSalary('');
      setDescription('');
      setPhone('');
      setTab('list');
      loadJobs();
    } catch (err) {
      console.error(err);
      alert('Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
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
          <h1 className="font-bold text-2xl text-stone-900">💼 Vakansiya</h1>
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
            <span>Ish qidirish</span>
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'create'
                ? 'bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg scale-105'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span className="text-xl">🏢</span>
            <span>Ish beruvchi</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'list' && (
          <>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <div className="text-5xl mb-3">💼</div>
                <p className="text-sm">Hozircha vakansiyalar yo'q</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-stone-900 leading-tight">
                          {job.position}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-sm text-stone-600 mt-1">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">{job.company_name}</span>
                        </div>
                      </div>
                    </div>

                    {job.salary && (
                      <div className="flex items-center space-x-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                        <Wallet className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}

                    {job.description && (
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    <a
                      href={`tel:${job.phone}`}
                      className="w-full py-3 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-lg active:scale-95"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Qo'ng'iroq qilish</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
            <h2 className="font-bold text-lg text-stone-900 mb-2">
              Vakansiya joylashtirish
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kompaniya nomi
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Masalan: Bekobod Textile"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Lavozim
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Masalan: Tikuvchi"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Maosh (ixtiyoriy)
              </label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Masalan: 3 000 000 so'm"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Qo'shimcha ma'lumot (ixtiyoriy)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ish sharoiti, talablar..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating || !companyName.trim() || !position.trim() || !phone.trim()}
              className="w-full py-3 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Joylashtirilmoqda...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Joylashtirish</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};