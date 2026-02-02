import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONESIGNAL_APP_ID = '15b4ea8d-7db6-46eb-86e0-1b3a1046c2af';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export const useOneSignal = (userId: string | null) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');

  // Initialize OneSignal SDK
  useEffect(() => {
    const initOneSignal = async () => {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      setIsSupported(true);

      // Load OneSignal SDK if not already loaded
      if (!window.OneSignal) {
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise<void>((resolve) => {
          script.onload = () => resolve();
        });
      }

      // Initialize OneSignal
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: '/OneSignalSDKWorker.js',
          });

          // Check current subscription status
          const subscribed = await OneSignal.User.PushSubscription.optedIn;
          setIsSubscribed(subscribed);

          // Get current permission
          const currentPermission = Notification.permission;
          setPermission(currentPermission as 'default' | 'granted' | 'denied');

          // Listen for subscription changes
          OneSignal.User.PushSubscription.addEventListener('change', async (event: any) => {
            setIsSubscribed(event.current.optedIn);
            
            // Save subscription to database if user is logged in
            if (userId && event.current.optedIn && event.current.id) {
              await saveSubscription(event.current.id);
            }
          });

          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing OneSignal:', error);
          setIsLoading(false);
        }
      });
    };

    initOneSignal();
  }, [userId]);

  // Save subscription to database
  const saveSubscription = async (playerId: string) => {
    if (!userId) return;

    try {
      // Upsert the subscription
      const { error } = await supabase
        .from('onesignal_subscriptions')
        .upsert(
          { user_id: userId, player_id: playerId },
          { onConflict: 'player_id' }
        );

      if (error) {
        console.error('Error saving OneSignal subscription:', error);
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!window.OneSignal || !isSupported) return false;

    try {
      setIsLoading(true);
      
      // Request permission and opt in
      await window.OneSignal.Notifications.requestPermission();
      await window.OneSignal.User.PushSubscription.optIn();

      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;

      if (optedIn && subscriptionId && userId) {
        await saveSubscription(subscriptionId);
      }

      setIsSubscribed(optedIn);
      setPermission(Notification.permission as 'default' | 'granted' | 'denied');
      setIsLoading(false);
      
      return optedIn;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!window.OneSignal || !isSupported) return false;

    try {
      setIsLoading(true);
      await window.OneSignal.User.PushSubscription.optOut();
      
      // Remove subscription from database
      if (userId) {
        const subscriptionId = await window.OneSignal.User.PushSubscription.id;
        if (subscriptionId) {
          await supabase
            .from('onesignal_subscriptions')
            .delete()
            .eq('player_id', subscriptionId);
        }
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  };
};
