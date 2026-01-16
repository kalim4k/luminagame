import React, { useState, useEffect } from 'react';
import { Game } from '@/types';
import { X, Trophy, Loader2 } from 'lucide-react';

interface GameSessionProps {
  game: Game | null;
  onClose: () => void;
  onComplete: (amount: number) => void;
}

export const GameSession: React.FC<GameSessionProps> = ({ game, onClose, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!game) return;

    // Reset state
    setProgress(0);
    setIsCompleted(false);

    // Simulate game duration
    const intervalTime = 100;
    const steps = (game.durationSec * 1000) / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsCompleted(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [game]);

  const handleCollect = () => {
    if (game) {
      onComplete(game.reward);
    }
  };

  if (!game) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        {/* Close button */}
        {!isCompleted && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        {/* Game Content */}
        <div
          className="relative h-64 bg-cover bg-center flex flex-col items-center justify-center p-6 text-center"
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${game.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"></div>

          <h3 className="relative text-2xl font-bold text-white mb-4 z-10">{game.title}</h3>

          {!isCompleted ? (
            <div className="relative z-10 w-full">
              <p className="text-white/80 text-sm mb-4">Jeu en cours... Maximisez votre score !</p>

              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="mt-4 flex justify-center">
                <Loader2 size={32} className="text-white animate-spin" />
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                <Trophy size={40} className="text-white" />
              </div>

              <div className="text-center mb-6">
                <p className="text-2xl font-bold text-white">Félicitations !</p>
                <p className="text-3xl font-black text-primary mt-1">+{game.reward} FCFA</p>
              </div>

              <button
                onClick={handleCollect}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors shadow-lg shadow-primary/30"
              >
                Réclamer mes gains
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
