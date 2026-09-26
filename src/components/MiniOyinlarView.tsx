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

export const MiniOyinlarView: React.FC<MiniOyinlarViewProps> = ({ onClose }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame) {
    const game = GAMES.find(g => g.id === selectedGame);
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