import React from 'react';
import { Lock, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface GameBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToConfig: () => void;
}

export const GameBlockedModal: React.FC<GameBlockedModalProps> = ({
  isOpen,
  onClose,
  onGoToConfig,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[320px] p-0 gap-0 rounded-[20px] border-0 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl">
        {/* Icon Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Lock className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          
          <h3 className="text-[17px] font-semibold text-foreground text-center leading-tight">
            Accès non autorisé
          </h3>
          
          <p className="text-[13px] text-muted-foreground text-center mt-2 leading-relaxed px-2">
            Veuillez configurer votre clé API et votre adresse IP pour accéder aux jeux.
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-border/50" />

        {/* Actions - iOS Style Stacked Buttons */}
        <div className="flex flex-col">
          <button
            onClick={onGoToConfig}
            className="w-full py-3.5 text-[17px] font-medium text-primary hover:bg-accent/50 active:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <Settings size={18} />
            Configuration
          </button>
          
          <div className="h-px bg-border/50" />
          
          <button
            onClick={onClose}
            className="w-full py-3.5 text-[17px] text-muted-foreground hover:bg-accent/50 active:bg-accent transition-colors"
          >
            Annuler
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
