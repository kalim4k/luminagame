import React from 'react';
import { Lock, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle className="text-xl">Accès refusé</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Vous n'êtes pas autorisé à jouer à ce jeu. Veuillez mettre à jour votre configuration pour débloquer l'accès.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onGoToConfig} className="w-full gap-2">
            <Settings size={18} />
            Aller à la configuration
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
