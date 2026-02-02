import React from 'react';
import { Bell, BellOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOneSignal } from '@/hooks/useOneSignal';

interface NotificationSettingsProps {
  userId: string | null;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = useOneSignal(userId);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl border border-border bg-secondary/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <BellOff size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Notifications non supportées</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Votre navigateur ne supporte pas les notifications push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertCircle size={20} className="text-destructive" />
          </div>
          <div>
            <p className="font-medium text-foreground">Notifications bloquées</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vous avez bloqué les notifications. Veuillez les réactiver dans les paramètres de votre navigateur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-success/10' : 'bg-accent'}`}>
            {isSubscribed ? (
              <Bell size={20} className="text-success" />
            ) : (
              <BellOff size={20} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">Notifications push</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isSubscribed 
                ? 'Vous recevez les notifications du chat' 
                : 'Activez pour recevoir les messages du chat'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isSubscribed && (
            <CheckCircle size={18} className="text-success" />
          )}
          
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={isSubscribed ? 'outline' : 'default'}
            size="sm"
            className="rounded-xl"
          >
            {isLoading 
              ? 'Chargement...' 
              : isSubscribed 
                ? 'Désactiver' 
                : 'Activer'}
          </Button>
        </div>
      </div>
    </div>
  );
};
