import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useOneSignal } from '@/hooks/useOneSignal';

interface NotificationSettingsProps {
  userId: string | null;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const { isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = useOneSignal(userId);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/50 opacity-60">
        <div className="flex items-center">
          <div className="p-2 bg-muted text-muted-foreground rounded-lg mr-3">
            <BellOff size={20} />
          </div>
          <div>
            <span className="font-medium text-foreground block">Notifications push</span>
            <span className="text-xs text-muted-foreground">Non supporté sur ce navigateur</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary transition-colors group"
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg mr-3 transition-colors ${
          isSubscribed 
            ? 'bg-primary/10 text-primary' 
            : 'bg-warning/10 text-warning group-hover:bg-warning/20'
        }`}>
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isSubscribed ? (
            <Bell size={20} />
          ) : (
            <BellOff size={20} />
          )}
        </div>
        <div className="text-left">
          <span className="font-medium text-foreground block">Notifications push</span>
          <span className="text-xs text-muted-foreground">
            {isLoading
              ? 'Chargement...'
              : isSubscribed
                ? 'Activées — vous recevrez des alertes'
                : 'Désactivées — appuyez pour activer'}
          </span>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
        isSubscribed ? 'bg-primary' : 'bg-muted'
      }`}>
        <div className={`bg-primary-foreground w-4 h-4 rounded-full shadow-md transform transition-transform ${
          isSubscribed ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );
};
