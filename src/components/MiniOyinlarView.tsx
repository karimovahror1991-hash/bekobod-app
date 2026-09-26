import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface MiniOyinlarViewProps {
  onClose: () => void;
}

interface Game {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  description: string;
}

const GAMES: Game[] = [
  { id: 'randomizer', title: 'Randomizer', icon: '🎲', gradient: 'from-purple-500 to-indigo-600', description: 'Tasodifiy son tanlash' },
  { id: 'coin', title: 'Monetka', icon: '🪙', gradient: 'from-amber-500 to-orange-600', description: 'Boshi yoki dumi' },
  { id: 'rps', title: "Tosh-qaychi-qog'oz", icon: '✊', gradient: 'from-rose-500 to-pink-600', description: 'Kompyuterga qarshi' },
  { id: 'guess', title: 'Sonni top', icon: '🔢', gradient: 'from-emerald-500 to-teal-600', description: '1 dan 100 gacha' },
  { id: 'tictactoe', title: 'Krestik-nolik', icon: '✏️', gradient: 'from-cyan-500 to-blue-600', description: "Klassik o'yin" },
  { id: 'sudoku', title: 'Sudoku 4×4', icon: '📝', gradient: 'from-violet-500 to-purple-600', description: 'Mantiqiy jumboq' },
];

// ============ RANDOMIZER ============
const RandomizerGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (min > max) {
      alert("Minimal son maksimaldan katta bo'lmasligi kerak");
      return;
    }
    setRolling(true);
    setResult(null);

    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * (max - min + 1)) + min);
      count++;
      if (count >= 15) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * (max - min + 1)) + min;
        setResult(final);
        setRolling(false);
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className={`bg-linear-to-br ${game?.gradient} text-white sticky top-0 z-20 shadow-md`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-xl text-white">🎲 Randomizer</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Показ числа */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 text-center">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-4">
            Natija
          </div>
          <div className={`text-7xl font-bold transition-all ${
            rolling ? 'text-stone-300' : 'text-purple-600'
          }`}>
            {result !== null ? result : '?'}
          </div>
          <div className="text-xs text-stone-400 mt-3">
            {min} dan {max} gacha
          </div>
        </div>

        {/* Настройки диапазона */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                Dan (min)
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 text-center text-lg font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide">
                Gacha (max)
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-200 text-center text-lg font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={roll}
            disabled={rolling}
            className="w-full py-5 bg-linear-to-br from-purple-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-50"
          >
            {rolling ? '🎲 Aylanmoqda...' : '🎲 Tasodifiy son'}
          </button>
        </div>
      </div>
    </div>
  );
};
// ============ /RANDOMIZER ============

export const MiniOyinlarView: React.FC<MiniOyinlarViewProps> = ({ onClose }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame) {
    const game = GAMES.find(g => g.id === selectedGame);

    if (selectedGame === 'randomizer') {
      return <RandomizerGame onClose={() => setSelectedGame(null)} game={game} />;
    }
    if (selectedGame === 'coin') {
      return <MonetkaGame onClose={() => setSelectedGame(null)} game={game} />;
    }
    return (
      <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
        <div className={`bg-linear-to-br ${game?.gradient} text-white sticky top-0 z-20 shadow-md`}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
            <button
              onClick={() => setSelectedGame(null)}
              className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="font-bold text-xl text-white">
              {game?.icon} {game?.title}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-stone-400">
          <div className="text-7xl mb-4">{game?.icon}</div>
          <p className="text-lg font-bold mb-2">{game?.title}</p>
          <p className="text-sm">O'yin tez orada qo'shiladi</p>
        </div>
      </div>
    );
  }

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
          <h1 className="font-bold text-2xl text-stone-900">🎮 Mini o'yinlar</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`bg-linear-to-br ${game.gradient} text-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 min-h-45`}
            >
              <div className="text-6xl mb-3">{game.icon}</div>
              <div className="font-bold text-base text-white text-center leading-tight">
                {game.title}
              </div>
              <div className="text-[10px] text-white/80 mt-2 text-center">
                {game.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
// ============ MONETKA ============
const MonetkaGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const [result, setResult] = useState<'orol' | 'reshka' | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [stats, setStats] = useState({ orol: 0, reshka: 0 });

  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);

    setTimeout(() => {
      const isOrol = Math.random() < 0.5;
      const res = isOrol ? 'orol' : 'reshka';
      setResult(res);
      setStats(prev => ({
        ...prev,
        [res]: prev[res] + 1,
      }));
      setFlipping(false);
    }, 800);
  };

  const resetStats = () => {
    setStats({ orol: 0, reshka: 0 });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-50 to-stone-100">
      <div className={`bg-linear-to-br ${game?.gradient} text-white sticky top-0 z-20 shadow-md`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-xl text-white">🪙 Monetka</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Монетка */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-stone-100 text-center">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-4">
            Natija
          </div>

          <div className="flex items-center justify-center mb-6" style={{ perspective: '1000px' }}>
            <div
              className={`w-40 h-40 rounded-full flex items-center justify-center text-7xl shadow-2xl transition-all duration-700 ${
                flipping ? 'animate-spin' : ''
              } ${
                result === 'orol'
                  ? 'bg-linear-to-br from-amber-400 to-yellow-600'
                  : result === 'reshka'
                  ? 'bg-linear-to-br from-stone-400 to-stone-600'
                  : 'bg-linear-to-br from-amber-200 to-amber-400'
              }`}
            >
              {result === 'orol' ? '👑' : result === 'reshka' ? '🦅' : '🪙'}
            </div>
          </div>

          <div className="text-2xl font-bold">
            {result === 'orol' && <span className="text-amber-600">👑 Boshi (Orol)</span>}
            {result === 'reshka' && <span className="text-stone-600">🦅 Dumi (Reshka)</span>}
            {!result && <span className="text-stone-300">—</span>}
          </div>
        </div>

        {/* Кнопка */}
        <button
          onClick={flip}
          disabled={flipping}
          className="w-full py-5 bg-linear-to-br from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-50"
        >
          {flipping ? '🪙 Aylanmoqda...' : '🪙 Tashlash'}
        </button>

        {/* Статистика */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              Statistika
            </div>
            <button
              onClick={resetStats}
              className="text-xs text-stone-400 hover:text-rose-500 transition font-semibold"
            >
              Tozalash
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">👑</div>
              <div className="text-2xl font-bold text-amber-600">{stats.orol}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Boshi</div>
            </div>
            <div className="bg-stone-100 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-1">🦅</div>
              <div className="text-2xl font-bold text-stone-600">{stats.reshka}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Dumi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============ /MONETKA ============