import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONESIGNAL_APP_ID = 'b6ec05f3-8d01-45e0-9697-8529fd355531';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: any) => void>;
    OneSignal?: any;
  }
}

export const useOneSignal = (userId: string | null) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<string>('default');

  // Check current subscription status
  const checkStatus = useCallback(async () => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) {
        setIsLoading(false);
        return;
      }

      const permission = await OneSignal.Notifications.permission;
      const optedIn = await OneSignal.User.PushSubscription.optedIn;
      const subscriptionId = await OneSignal.User.PushSubscription.id;

      setPermissionState(permission ? 'granted' : 'default');
      setIsSubscribed(!!optedIn && !!subscriptionId);
      setIsLoading(false);
    } catch (err) {
      console.error('OneSignal status check error:', err);
      setIsLoading(false);
    }
  }, []);

  // Initialize OneSignal SDK
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    setIsSupported(true);

    // Load OneSignal SDK if not already loaded
    if (!window.OneSignal && !document.querySelector('script[src*="OneSignalSDK"]')) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);

      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: '/' },
          });

          // Listen for subscription changes
          OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
            const isNowSubscribed = !!event.current.optedIn && !!event.current.id;
            setIsSubscribed(isNowSubscribed);

            if (isNowSubscribed && userId && event.current.id) {
              saveSubscription(userId, event.current.id);
            }
          });

          await checkStatus();
        } catch (err) {
          console.error('OneSignal init error:', err);
          setIsLoading(false);
        }
      });
    } else {
      // SDK already loaded, just check status
      const waitForReady = () => {
        if (window.OneSignal) {
          checkStatus();
        } else {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push(async () => {
            await checkStatus();
          });
        }
      };
      waitForReady();
    }
  }, [checkStatus]);

  // Save subscription to database
  const saveSubscription = async (uid: string, playerId: string) => {
    try {
      await supabase.from('onesignal_subscriptions').upsert(
        { user_id: uid, player_id: playerId },
        { onConflict: 'user_id,player_id' }
      );
    } catch (err) {
      console.error('Error saving subscription:', err);
    }
  };

  // Remove subscription from database
  const removeSubscription = async (uid: string) => {
    try {
      await supabase
        .from('onesignal_subscriptions')
        .delete()
        .eq('user_id', uid);
    } catch (err) {
      console.error('Error removing subscription:', err);
    }
  };

  // Subscribe to notifications
  const subscribe = useCallback(async () => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;

      await OneSignal.Notifications.requestPermission();
      await OneSignal.User.PushSubscription.optIn();

      const subscriptionId = await OneSignal.User.PushSubscription.id;
      if (subscriptionId && userId) {
        await saveSubscription(userId, subscriptionId);
      }

      await checkStatus();
    } catch (err) {
      console.error('OneSignal subscribe error:', err);
    }
  }, [userId, checkStatus]);

  // Unsubscribe from notifications
  const unsubscribe = useCallback(async () => {
    try {
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;

      await OneSignal.User.PushSubscription.optOut();

      if (userId) {
        await removeSubscription(userId);
      }

      setIsSubscribed(false);
      await checkStatus();
    } catch (err) {
      console.error('OneSignal unsubscribe error:', err);
    }
  }, [userId, checkStatus]);

  return {
    isSubscribed,
    isSupported,
    isLoading,
    permissionState,
    subscribe,
    unsubscribe,
  };
};
