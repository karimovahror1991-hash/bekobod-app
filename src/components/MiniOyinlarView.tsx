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
        if (selectedGame === 'rps') {
      return <RPSGame onClose={() => setSelectedGame(null)} game={game} />;
    }
        if (selectedGame === 'guess') {
      return <GuessGame onClose={() => setSelectedGame(null)} game={game} />;
    }
        if (selectedGame === 'tictactoe') {
      return <TicTacToeGame onClose={() => setSelectedGame(null)} game={game} />;
    }
        if (selectedGame === 'sudoku') {
      return <SudokuGame onClose={() => setSelectedGame(null)} game={game} />;
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
// ============ RPS (Tosh-qaychi-qog'oz) ============
type RPSChoice = 'tosh' | 'qaychi' | 'qogoz';

const RPSGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const [playerChoice, setPlayerChoice] = useState<RPSChoice | null>(null);
  const [compChoice, setCompChoice] = useState<RPSChoice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [stats, setStats] = useState({ win: 0, lose: 0, draw: 0 });

  const choices: { id: RPSChoice; label: string; icon: string; beats: RPSChoice }[] = [
    { id: 'tosh', label: 'Tosh', icon: '✊', beats: 'qaychi' },
    { id: 'qaychi', label: 'Qaychi', icon: '✌️', beats: 'qogoz' },
    { id: 'qogoz', label: "Qog'oz", icon: '✋', beats: 'tosh' },
  ];

  const play = (choice: RPSChoice) => {
    if (playing) return;
    setPlaying(true);
    setPlayerChoice(choice);
    setCompChoice(null);
    setResult(null);

    setTimeout(() => {
      const randomComp = choices[Math.floor(Math.random() * 3)].id;
      setCompChoice(randomComp);

      let res: 'win' | 'lose' | 'draw';
      if (choice === randomComp) {
        res = 'draw';
      } else if (choices.find(c => c.id === choice)?.beats === randomComp) {
        res = 'win';
      } else {
        res = 'lose';
      }

      setResult(res);
      setStats(prev => ({ ...prev, [res]: prev[res] + 1 }));
      setPlaying(false);
    }, 700);
  };

  const resetStats = () => {
    setStats({ win: 0, lose: 0, draw: 0 });
    setPlayerChoice(null);
    setCompChoice(null);
    setResult(null);
  };

  const getIcon = (choice: RPSChoice | null) => {
    if (!choice) return '❓';
    return choices.find(c => c.id === choice)?.icon || '❓';
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
          <h1 className="font-bold text-xl text-white">✊ Tosh-qaychi-qog'oz</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Арена */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-center">
              <div className="text-[10px] font-bold text-stone-400 uppercase mb-2">Siz</div>
              <div className="text-6xl">{getIcon(playerChoice)}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-400">VS</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold text-stone-400 uppercase mb-2">Kompyuter</div>
              <div className="text-6xl">{playing ? '❓' : getIcon(compChoice)}</div>
            </div>
          </div>

          {result && (
            <div className={`mt-6 text-center text-2xl font-bold ${
              result === 'win' ? 'text-emerald-600' :
              result === 'lose' ? 'text-rose-600' :
              'text-stone-500'
            }`}>
              {result === 'win' && '🎉 Siz yutdingiz!'}
              {result === 'lose' && '😢 Siz yutqazdingiz'}
              {result === 'draw' && '🤝 Durang'}
            </div>
          )}
        </div>

        {/* Кнопки выбора */}
        <div className="grid grid-cols-3 gap-3">
          {choices.map((c) => (
            <button
              key={c.id}
              onClick={() => play(c.id)}
              disabled={playing}
              className="bg-white rounded-3xl p-4 shadow-lg border-2 border-stone-100 hover:border-rose-300 active:scale-95 transition-all disabled:opacity-50 flex flex-col items-center space-y-2"
            >
              <div className="text-5xl">{c.icon}</div>
              <div className="font-bold text-sm text-stone-700">{c.label}</div>
            </button>
          ))}
        </div>

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
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.win}</div>
              <div className="text-[10px] text-stone-500 font-semibold">G'alaba</div>
            </div>
            <div className="bg-stone-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.draw}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Durang</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-rose-600">{stats.lose}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Mag'lubiyat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============ /RPS ============
// ============ SONNI TOP (Угадай число) ============
const GuessGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState<{ value: number; hint: 'low' | 'high' }[]>([]);
  const [message, setMessage] = useState('');
  const [won, setWon] = useState(false);

  const checkGuess = () => {
    const num = Number(guess);
    if (!num || num < 1 || num > 100) {
      setMessage('1 dan 100 gacha son kiriting');
      return;
    }

    if (num === target) {
      setAttempts(prev => [...prev, { value: num, hint: 'low' }]);
      setWon(true);
      setMessage(`🎉 To'g'ri! Siz ${attempts.length + 1} ta urinishda topdingiz!`);
      setGuess('');
      return;
    }

    const hint: 'low' | 'high' = num < target ? 'low' : 'high';
    setAttempts(prev => [...prev, { value: num, hint }]);
    setMessage(hint === 'low' ? '⬆️ Kattaroq son kiriting' : '⬇️ Kichikroq son kiriting');
    setGuess('');
  };

  const restart = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts([]);
    setMessage('');
    setWon(false);
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
          <h1 className="font-bold text-xl text-white">🔢 Sonni top</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Инфо */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 text-center">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">
            Kompyuter 1 dan 100 gacha son o'yladi
          </div>
          <div className="text-6xl font-bold text-emerald-600 mb-2">
            {attempts.length}
          </div>
          <div className="text-xs text-stone-500">ta urinish</div>
        </div>

        {/* Ввод */}
        {!won ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
              placeholder="Son kiriting..."
              min="1"
              max="100"
              className="w-full px-4 py-5 rounded-2xl border-2 border-stone-200 text-center text-3xl font-bold focus:outline-none focus:border-emerald-500"
            />

            {message && (
              <div className="text-center text-base font-bold text-stone-700">
                {message}
              </div>
            )}

            <button
              onClick={checkGuess}
              disabled={!guess}
              className="w-full py-5 bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-50"
            >
              Tekshirish
            </button>
          </div>
        ) : (
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-lg text-white text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <div className="text-2xl font-bold">Tabriklaymiz!</div>
            <div className="text-sm text-white/90">
              Siz {target} sonini {attempts.length} ta urinishda topdingiz
            </div>
            <button
              onClick={restart}
              className="w-full py-4 bg-white text-emerald-700 rounded-2xl font-bold shadow-lg active:scale-95 transition"
            >
              🔄 Yana o'ynash
            </button>
          </div>
        )}

        {/* История попыток */}
        {attempts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">
              Urinishlar
            </div>
            <div className="flex flex-wrap gap-2">
              {attempts.map((a, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl font-bold text-sm ${
                    a.hint === 'low'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {a.hint === 'low' ? '⬆️' : '⬇️'} {a.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ============ /SONNI TOP ============
// ============ KRESTIK-NOLIK ============
type Cell = 'X' | 'O' | null;

const TicTacToeGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Cell | 'draw' | null>(null);
  const [stats, setStats] = useState({ win: 0, lose: 0, draw: 0 });

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (b: Cell[]): Cell | 'draw' | null => {
    for (const [a, c, d] of WIN_LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(cell => cell !== null)) return 'draw';
    return null;
  };

  // Простой AI: 1) выиграть, 2) блокировать, 3) центр, 4) угол, 5) рандом
  const computerMove = (b: Cell[]): number => {
    // 1. Выиграть
    for (const [a, c, d] of WIN_LINES) {
      const line = [b[a], b[c], b[d]];
      const oCount = line.filter(x => x === 'O').length;
      const emptyIdx = [a, c, d].find(i => b[i] === null);
      if (oCount === 2 && emptyIdx !== undefined) return emptyIdx;
    }
    // 2. Блокировать
    for (const [a, c, d] of WIN_LINES) {
      const line = [b[a], b[c], b[d]];
      const xCount = line.filter(x => x === 'X').length;
      const emptyIdx = [a, c, d].find(i => b[i] === null);
      if (xCount === 2 && emptyIdx !== undefined) return emptyIdx;
    }
    // 3. Центр
    if (b[4] === null) return 4;
    // 4. Углы
    const corners = [0, 2, 6, 8].filter(i => b[i] === null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Рандом
    const empty = b.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      if (w === 'X') setStats(prev => ({ ...prev, win: prev.win + 1 }));
      else if (w === 'O') setStats(prev => ({ ...prev, lose: prev.lose + 1 }));
      else setStats(prev => ({ ...prev, draw: prev.draw + 1 }));
      return;
    }

    setIsPlayerTurn(false);

    setTimeout(() => {
      const compIdx = computerMove(newBoard);
      const afterComp = [...newBoard];
      afterComp[compIdx] = 'O';
      setBoard(afterComp);

      const w2 = checkWinner(afterComp);
      if (w2) {
        setWinner(w2);
        if (w2 === 'X') setStats(prev => ({ ...prev, win: prev.win + 1 }));
        else if (w2 === 'O') setStats(prev => ({ ...prev, lose: prev.lose + 1 }));
        else setStats(prev => ({ ...prev, draw: prev.draw + 1 }));
      }
      setIsPlayerTurn(true);
    }, 400);
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  const resetStats = () => {
    setStats({ win: 0, lose: 0, draw: 0 });
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
          <h1 className="font-bold text-xl text-white">✏️ Krestik-nolik</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Статус */}
        <div className="bg-white rounded-3xl p-4 shadow-lg border border-stone-100 text-center">
          {winner ? (
            <div className={`text-xl font-bold ${
              winner === 'X' ? 'text-emerald-600' :
              winner === 'O' ? 'text-rose-600' :
              'text-stone-500'
            }`}>
              {winner === 'X' && '🎉 Siz yutdingiz!'}
              {winner === 'O' && '😢 Kompyuter yutdi'}
              {winner === 'draw' && '🤝 Durang'}
            </div>
          ) : (
            <div className="text-base font-bold text-stone-600">
              {isPlayerTurn ? '👤 Sizning navbatingiz (X)' : '🤖 Kompyuter o\'ylayapti...'}
            </div>
          )}
        </div>

        {/* Игровое поле */}
        <div className="bg-white rounded-3xl p-4 shadow-lg border border-stone-100">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleClick(i)}
                disabled={!!cell || !!winner || !isPlayerTurn}
                className={`aspect-square rounded-2xl flex items-center justify-center text-5xl font-bold transition-all active:scale-95 ${
                  cell === 'X'
                    ? 'bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : cell === 'O'
                    ? 'bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-lg'
                    : 'bg-stone-50 border-2 border-stone-200 hover:border-cyan-300'
                } disabled:cursor-not-allowed`}
              >
                {cell === 'X' && '✕'}
                {cell === 'O' && '○'}
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка заново */}
        <button
          onClick={restart}
          className="w-full py-5 bg-linear-to-br from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition"
        >
          🔄 Yangi o'yin
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
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.win}</div>
              <div className="text-[10px] text-stone-500 font-semibold">G'alaba</div>
            </div>
            <div className="bg-stone-100 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-stone-600">{stats.draw}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Durang</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-rose-600">{stats.lose}</div>
              <div className="text-[10px] text-stone-500 font-semibold">Mag'lubiyat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============ /KRESTIK-NOLIK ============
// ============ SUDOKU ============
const SudokuGame: React.FC<{ onClose: () => void; game?: Game }> = ({ onClose, game }) => {
  const PUZZLES_4 = [
    {
      solution: [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],
      puzzle: [[1,0,0,4],[0,4,0,0],[0,1,0,0],[4,0,2,1]],
    },
    {
      solution: [[2,1,4,3],[4,3,2,1],[1,2,3,4],[3,4,1,2]],
      puzzle: [[2,0,4,0],[0,3,0,1],[1,0,0,4],[0,4,1,0]],
    },
  ];

  const PUZZLES_9 = [
    {
      solution: [
        [5,3,4,6,7,8,9,1,2],
        [6,7,2,1,9,5,3,4,8],
        [1,9,8,3,4,2,5,6,7],
        [8,5,9,7,6,1,4,2,3],
        [4,2,6,8,5,3,7,9,1],
        [7,1,3,9,2,4,8,5,6],
        [9,6,1,5,3,7,2,8,4],
        [2,8,7,4,1,9,6,3,5],
        [3,4,5,2,8,6,1,7,9],
      ],
      puzzle: [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9],
      ],
    },
    {
      solution: [
        [1,2,3,4,5,6,7,8,9],
        [4,5,6,7,8,9,1,2,3],
        [7,8,9,1,2,3,4,5,6],
        [2,3,4,5,6,7,8,9,1],
        [5,6,7,8,9,1,2,3,4],
        [8,9,1,2,3,4,5,6,7],
        [3,4,5,6,7,8,9,1,2],
        [6,7,8,9,1,2,3,4,5],
        [9,1,2,3,4,5,6,7,8],
      ],
      puzzle: [
        [1,0,0,4,0,0,7,0,0],
        [0,5,0,0,8,0,0,2,0],
        [0,0,9,0,0,3,0,0,6],
        [2,0,0,0,6,0,0,0,1],
        [0,6,0,0,9,0,0,3,0],
        [0,0,1,0,0,4,0,0,7],
        [3,0,0,0,7,0,0,0,2],
        [0,7,0,0,1,0,0,4,0],
        [0,0,2,0,0,5,0,0,8],
      ],
    },
  ];

  const [mode, setMode] = useState<4 | 9>(4);
  const PUZZLES = mode === 4 ? PUZZLES_4 : PUZZLES_9;
  const size = mode;

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<number[][]>(PUZZLES_4[0].puzzle.map(r => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);
  const [errors, setErrors] = useState<[number, number][]>([]);

  const switchMode = (newMode: 4 | 9) => {
    setMode(newMode);
    const newPuzzles = newMode === 4 ? PUZZLES_4 : PUZZLES_9;
    setPuzzleIndex(0);
    setBoard(newPuzzles[0].puzzle.map(r => [...r]));
    setSelected(null);
    setWon(false);
    setErrors([]);
  };

  const loadPuzzle = (idx: number) => {
    setPuzzleIndex(idx);
    setBoard(PUZZLES[idx].puzzle.map(r => [...r]));
    setSelected(null);
    setWon(false);
    setErrors([]);
  };

  const handleCellClick = (r: number, c: number) => {
    if (won) return;
    if (PUZZLES[puzzleIndex].puzzle[r][c] !== 0) return;
    setSelected([r, c]);
  };

  const handleNumber = (num: number) => {
    if (!selected || won) return;
    const [r, c] = selected;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    const newErrors: [number, number][] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newBoard[i][j] !== 0 && newBoard[i][j] !== PUZZLES[puzzleIndex].solution[i][j]) {
          newErrors.push([i, j]);
        }
      }
    }
    setErrors(newErrors);

    const solved = newBoard.every((row, i) =>
      row.every((v, j) => v === PUZZLES[puzzleIndex].solution[i][j])
    );
    if (solved) setWon(true);
  };

  const handleClear = () => {
    if (!selected || won) return;
    const [r, c] = selected;
    if (PUZZLES[puzzleIndex].puzzle[r][c] !== 0) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    setErrors(errors.filter(([i, j]) => !(i === r && j === c)));
  };

  const restart = () => loadPuzzle(puzzleIndex);

  const getBorderClasses = (r: number, c: number) => {
    if (size === 4) {
      const borderR = (c + 1) % 2 === 0 && c !== 3 ? 'border-r-4 border-stone-700' : '';
      const borderB = (r + 1) % 2 === 0 && r !== 3 ? 'border-b-4 border-stone-700' : '';
      return `${borderR} ${borderB}`;
    } else {
      const borderR = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-4 border-stone-700' : '';
      const borderB = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-4 border-stone-700' : '';
      return `${borderR} ${borderB}`;
    }
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
          <h1 className="font-bold text-xl text-white">📝 Sudoku</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Переключатель режима */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchMode(4)}
            className={`py-3 rounded-2xl font-bold text-sm transition-all ${
              mode === 4
                ? 'bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            4×4 (Oson)
          </button>
          <button
            onClick={() => switchMode(9)}
            className={`py-3 rounded-2xl font-bold text-sm transition-all ${
              mode === 9
                ? 'bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            9×9 (Qiyin)
          </button>
        </div>

        {/* Статус */}
        <div className="bg-white rounded-3xl p-4 shadow-lg border border-stone-100 text-center">
          {won ? (
            <div className="text-xl font-bold text-emerald-600">
              🎉 Tabriklaymiz! Siz yechdingiz!
            </div>
          ) : (
            <div className="text-xs font-bold text-stone-600">
              Har bir qatorda, ustunda va {size === 4 ? '2×2' : '3×3'} blokda 1-{size} raqamlari takrorlanmasin
            </div>
          )}
        </div>

        {/* Игровое поле */}
        <div className="bg-white rounded-3xl p-3 shadow-lg border border-stone-100">
          <div
            className="grid gap-0.5 w-full mx-auto"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isGiven = PUZZLES[puzzleIndex].puzzle[r][c] !== 0;
                const isSelected = selected?.[0] === r && selected?.[1] === c;
                const isError = errors.some(([i, j]) => i === r && j === c);
                const borders = getBorderClasses(r, c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`aspect-square rounded-md flex items-center justify-center font-bold transition-all ${borders} ${
                      size === 4 ? 'text-3xl' : 'text-base'
                    } ${
                      isGiven
                        ? 'bg-stone-200 text-stone-800 cursor-not-allowed'
                        : isError
                        ? 'bg-rose-100 text-rose-700'
                        : isSelected
                        ? 'bg-violet-200 text-violet-800 ring-2 ring-violet-400'
                        : 'bg-stone-50 text-violet-700 hover:bg-violet-50'
                    }`}
                  >
                    {cell !== 0 ? cell : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Цифры */}
        <div className={`grid gap-1.5 ${size === 4 ? 'grid-cols-5' : 'grid-cols-5'}`}>
          {Array.from({ length: size }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              disabled={!selected || won}
              className={`aspect-square bg-linear-to-br from-violet-500 to-purple-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition disabled:opacity-30 ${
                size === 4 ? 'text-2xl' : 'text-lg'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={!selected || won}
            className="aspect-square bg-stone-200 text-stone-700 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-30"
          >
            ⌫
          </button>
        </div>

        {/* Кнопки */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={restart}
            className="py-4 bg-stone-700 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
          >
            🔄 Qaytadan
          </button>
          <button
            onClick={() => loadPuzzle((puzzleIndex + 1) % PUZZLES.length)}
            className="py-4 bg-linear-to-br from-violet-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition"
          >
            ➡️ Keyingi
          </button>
        </div>
      </div>
    </div>
  );
};
// ============ /SUDOKU ============