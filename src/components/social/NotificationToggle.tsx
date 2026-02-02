import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NotificationToggleProps {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: 'default' | 'granted' | 'denied';
  onSubscribe: () => Promise<boolean>;
  onUnsubscribe: () => Promise<boolean>;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  isSupported,
  isSubscribed,
  isLoading,
  permission,
  onSubscribe,
  onUnsubscribe,
}) => {
  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await onUnsubscribe();
    } else {
      await onSubscribe();
    }
  };

  const getTooltipContent = () => {
    if (permission === 'denied') {
      return 'Notifications bloquées. Activez-les dans les paramètres du navigateur.';
    }
    if (isSubscribed) {
      return 'Désactiver les notifications';
    }
    return 'Activer les notifications';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isLoading || permission === 'denied'}
            className={`rounded-full h-9 w-9 ${
              isSubscribed 
                ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
