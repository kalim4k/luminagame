import React, { useState, useEffect } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import { Game } from '@/types';

interface GameSessionProps {
  game: Game;
  onClose: () => void;
  onComplete: (reward: number) => void;
}

export const GameSession: React.FC<GameSessionProps> = ({ game, onClose, onComplete }) => {
  const [phase, setPhase] = useState<'playing' | 'loading' | 'complete'>('playing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase === 'playing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase('loading');
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }

    if (phase === 'loading') {
      const timeout = setTimeout(() => {
        setPhase('complete');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  const handleClaim = () => {
    onComplete(game.reward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{game.image}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{game.name}</h2>
          
          {phase === 'playing' && (
            <div className="mt-6">
              <p className="text-muted-foreground mb-4">Partie en cours...</p>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
          )}

          {phase === 'loading' && (
            <div className="mt-6 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Calcul de vos gains...</p>
            </div>
          )}

          {phase === 'complete' && (
            <div className="mt-6">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Félicitations !</h3>
              <p className="text-muted-foreground mb-2">Vous avez gagné</p>
              <p className="text-3xl font-bold text-primary mb-6">{game.reward} FCFA</p>
              <button
                onClick={handleClaim}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Réclamer ma récompense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
