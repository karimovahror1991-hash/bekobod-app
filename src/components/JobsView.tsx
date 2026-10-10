import { PullToRefresh } from './PullToRefresh';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Plus, Loader2, Building2, Wallet, Trash2 } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

interface JobsViewProps {
  onClose: () => void;
  userId: number | null;
}

interface Job {
  id: number;
  company_name: string;
  position: string;
  salary: string | null;
  description: string | null;
  phone: string;
  category: string;
  status: string;
  user_id: number | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'qurilish', label: 'Qurilish', icon: '🏗️', iconFile: 'qurilish', line: 'from-orange-400 to-red-500' },
  { id: 'savdo', label: 'Savdo', icon: '🛒', iconFile: 'savdo_job', line: 'from-emerald-400 to-teal-500' },
  { id: 'talim', label: "Ta'lim", icon: '🎓', iconFile: 'talim_job', line: 'from-blue-400 to-indigo-500' },
  { id: 'tibbiyot', label: 'Tibbiyot', icon: '🏥', iconFile: 'tibbiyot', line: 'from-rose-400 to-pink-500' },
  { id: 'transport', label: 'Transport', icon: '🚗', iconFile: 'transport', line: 'from-cyan-400 to-blue-500' },
  { id: 'boshqa', label: 'Boshqa', icon: '💼', iconFile: 'boshqa_job', line: 'from-violet-400 to-purple-500' },
];

export const JobsView: React.FC<JobsViewProps> = ({ onClose, userId }) => {
  const [tab, setTab] = useState<'list' | 'create'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('boshqa');
  const [creating, setCreating] = useState(false);
  useSwipeBack(() => {
  if (selectedCategory) { setSelectedCategory(null); return; }
  onClose();
});

  const API_URL = 'https://bekobod-app-1.onrender.com';
// ✅ Получить initData из Telegram
const getInitData = (): string => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initData || '';
};
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
  category,
  initData: getInitData(),
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

  const handleDelete = async (jobId: number) => {
    if (!userId) return;
    if (!confirm("Vakansiyani o'chirishni tasdiqlaysizmi?")) return;

    try {
      const res = await fetch(`${API_URL}/api/jobs/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, initData: getInitData() }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hozir';
    if (diffHours < 24) return `${diffHours} soat oldin`;
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const filteredJobs = selectedCategory
    ? jobs.filter(j => j.category === selectedCategory)
    : [];

  const getCategoryLabel = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.label : catId;
  };

  const getCategoryIconFile = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.iconFile : 'boshqa_job';
  };

  // === ЭКРАН СПИСКА ВАКАНСИЙ КАТЕГОРИИ ===
  if (selectedCategory) {
    const catInfo = CATEGORIES.find(c => c.id === selectedCategory);

    return (
      <PullToRefresh onRefresh={loadJobs}>
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
                  src={`/icons/${catInfo?.iconFile}.png`}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="font-bold text-lg text-stone-900">{catInfo?.label}</h1>
                  <p className="text-xs text-stone-400">{filteredJobs.length} ta vakansiya</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <img
                  src={`/icons/${catInfo?.iconFile}.png`}
                  alt=""
                  className="w-24 h-24 object-contain mx-auto mb-4 opacity-50"
                />
                <p className="text-sm">Hozircha vakansiyalar yo'q</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
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
                    <div className="text-xs text-stone-400 shrink-0 ml-2">
                      {formatDate(job.created_at)}
                    </div>
                  </div>

                  {job.phone && (
                    <div className="flex items-center space-x-2 text-sm text-stone-700">
                      <Phone className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span className="font-semibold">{job.phone}</span>
                    </div>
                  )}
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

                  {userId && job.user_id === userId && (
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-semibold transition border border-rose-200 flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Vakansiyani o'chirish</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </PullToRefresh>
    );
  }

  // === ЭКРАН ФОРМЫ СОЗДАНИЯ ===
  if (tab === 'create') {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={() => setTab('list')}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-2xl text-stone-900">➕ Vakansiya joylash</h1>
          </div>
        </div>

        <form onSubmit={handleCreate} className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
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
                Soha (kategoriya)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:border-amber-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
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
          </div>

          <button
            type="submit"
            disabled={creating || !companyName.trim() || !position.trim() || !phone.trim()}
            className="w-full py-4 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition shadow-lg"
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
      </div>
    );
  }

  // === ГЛАВНЫЙ ЭКРАН ===
  return (
    <PullToRefresh onRefresh={loadJobs}>
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 flex items-center space-x-3">
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-stone-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-stone-700" />
            </button>
            <h1 className="font-bold text-2xl text-stone-900">💼 Vakansiya</h1>
          </div>

          <div className="max-w-2xl mx-auto px-4 pb-4">
            <button
              onClick={() => setTab('create')}
              className="w-full py-4 bg-linear-to-br from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Vakansiya joylash</span>
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {CATEGORIES.map((cat) => {
              const count = jobs.filter(j => j.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group w-full bg-white rounded-3xl pt-6 pb-4 px-6 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 active:scale-[0.98]"
                >
                  <img
                    src={`/icons/${cat.iconFile}.png`}
                    alt={cat.label}
                    className="w-32 h-32 object-contain mb-3 group-hover:scale-110 transition-transform duration-300"
                  />

                  <div className="text-xl font-bold text-stone-900 text-center leading-tight">
                    {cat.label}
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-sm text-stone-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{count} ta vakansiya</span>
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