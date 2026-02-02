import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOneSignal } from '@/hooks/useOneSignal';

const PROMPT_DISMISSED_KEY = 'lumina_notification_prompt_dismissed';
const PROMPT_DELAY_MS = 3000; // Show prompt after 3 seconds

interface NotificationPromptProps {
  userId: string | null;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(PROMPT_DISMISSED_KEY) === 'true';
  });
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
  } = useOneSignal(userId);

  // Check if notifications are blocked
  const isBlocked = permission === 'denied';

  // Show prompt after delay if not subscribed and not dismissed
  useEffect(() => {
    if (isDismissed || isSubscribed || !isSupported || isBlocked) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      // Check again in case status changed
      if (!isDismissed && !isSubscribed && isSupported && !isBlocked) {
        setIsVisible(true);
      }
    }, PROMPT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isDismissed, isSubscribed, isSupported, isBlocked]);

  // Hide when subscribed
  useEffect(() => {
    if (isSubscribed) {
      setIsVisible(false);
    }
  }, [isSubscribed]);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setIsVisible(false);
      localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  };

  if (!isVisible || !isSupported || isSubscribed || isBlocked) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-bold text-foreground mb-1">Restez informé !</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Recevez des alertes quand quelqu'un vous envoie un message dans le chat.
            </p>
            
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              size="sm"
              className="w-full rounded-xl"
            >
              {isLoading ? 'Activation...' : 'Activer les notifications'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
