import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { Game } from '@/types';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const difficultyColor = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-destructive/10 text-destructive'
  };

  const difficultyLabel = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile'
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all">
      <div className="p-4 md:p-6">
        <div className="text-4xl md:text-5xl mb-4">{game.image}</div>
        <h3 className="font-bold text-foreground text-sm md:text-base mb-1">{game.name}</h3>
        <p className="text-muted-foreground text-xs mb-3">{game.category}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColor[game.difficulty]}`}>
            {difficultyLabel[game.difficulty]}
          </span>
          <span className="text-xs text-muted-foreground flex items-center">
            <Clock size={12} className="mr-1" />
            {game.duration}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-primary font-bold">
            <Zap size={16} className="mr-1" />
            <span className="text-sm md:text-base">{game.reward} FCFA</span>
          </div>
          <button 
            onClick={() => onPlay(game)}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-primary-foreground text-xs md:text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Jouer
          </button>
        </div>
      </div>
    </div>
  );
};
