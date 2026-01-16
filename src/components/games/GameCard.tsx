import React from 'react';
import { Game } from '@/types';
import { Play, Clock, Trophy } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const difficultyColor = {
    'Facile': 'bg-emerald-500',
    'Moyen': 'bg-amber-500',
    'Difficile': 'bg-rose-500'
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all">
      {/* Image Header */}
      <div className="relative h-28 sm:h-36 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-xs font-bold text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${difficultyColor[game.difficulty as keyof typeof difficultyColor] || 'bg-slate-500'}`}>
          {game.difficulty}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded">
              {game.category}
            </span>
            <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{game.title}</h3>
          </div>
        </div>

        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
              {game.durationSec}s
            </span>
            <span className="flex items-center gap-1 font-bold text-primary">
              <Trophy size={12} className="sm:w-3.5 sm:h-3.5" />
              {game.reward} FCFA
            </span>
          </div>

          <button
            onClick={() => onPlay(game)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Play size={16} className="sm:w-5 sm:h-5" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
