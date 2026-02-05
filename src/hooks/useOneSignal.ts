import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONESIGNAL_APP_ID = '15b4ea8d-7db6-46eb-86e0-1b3a1046c2af';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

// Track if OneSignal has been initialized globally
let oneSignalInitialized = false;
let oneSignalInitPromise: Promise<void> | null = null;

export const useOneSignal = (userId: string | null) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const initAttempted = useRef(false);

  // Initialize OneSignal SDK (only once globally)
  const initOneSignal = useCallback(async (): Promise<boolean> => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return false;
    }

    setIsSupported(true);

    // If already initialized, just check the current status
    if (oneSignalInitialized && window.OneSignal) {
      try {
        const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
        setIsSubscribed(optedIn);
        setPermission(Notification.permission as 'default' | 'granted' | 'denied');
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Error checking OneSignal status:', error);
        setIsLoading(false);
        return false;
      }
    }

    // If initialization is in progress, wait for it
    if (oneSignalInitPromise) {
      await oneSignalInitPromise;
      return true;
    }

    // Start initialization
    oneSignalInitPromise = new Promise<void>(async (resolve) => {
      try {
        // Load OneSignal SDK if not already loaded
        if (!window.OneSignal && !document.querySelector('script[src*="OneSignalSDK"]')) {
          const script = document.createElement('script');
          script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
          script.async = true;
          document.head.appendChild(script);

          await new Promise<void>((resolveScript) => {
            script.onload = () => resolveScript();
          });
        }

        // Wait for OneSignal to be available
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            // Only initialize once
            if (!oneSignalInitialized) {
              await OneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerPath: '/OneSignalSDKWorker.js',
              });
              oneSignalInitialized = true;
            }

            // Check current subscription status
            const optedIn = await OneSignal.User.PushSubscription.optedIn;
            setIsSubscribed(optedIn);

            // Get current permission
            const currentPermission = Notification.permission;
            setPermission(currentPermission as 'default' | 'granted' | 'denied');

            // Listen for subscription changes
            OneSignal.User.PushSubscription.addEventListener('change', async (event: any) => {
              setIsSubscribed(event.current.optedIn);
              
              // Save subscription to database if user is logged in
              if (userId && event.current.optedIn && event.current.id) {
                await saveSubscription(event.current.id, userId);
              }
            });

            setIsLoading(false);
            resolve();
          } catch (error) {
            console.error('Error initializing OneSignal:', error);
            setIsLoading(false);
            resolve();
          }
        });
      } catch (error) {
        console.error('Error loading OneSignal SDK:', error);
        setIsLoading(false);
        resolve();
      }
    });

    await oneSignalInitPromise;
    return true;
  }, [userId]);

  // Save subscription to database
  const saveSubscription = async (playerId: string, currentUserId: string) => {
    if (!currentUserId) return;

    try {
      // Upsert the subscription
      const { error } = await supabase
        .from('onesignal_subscriptions')
        .upsert(
          { user_id: currentUserId, player_id: playerId },
          { onConflict: 'player_id' }
        );

      if (error) {
        console.error('Error saving OneSignal subscription:', error);
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (!initAttempted.current) {
      initAttempted.current = true;
      initOneSignal();
    }
  }, [initOneSignal]);

  // Re-check status when component mounts or userId changes
  useEffect(() => {
    const checkStatus = async () => {
      if (window.OneSignal && oneSignalInitialized) {
        try {
          const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
          setIsSubscribed(optedIn);
          setPermission(Notification.permission as 'default' | 'granted' | 'denied');
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };
    
    // Small delay to ensure OneSignal is ready
    const timer = setTimeout(checkStatus, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!window.OneSignal || !isSupported) {
      // Try to initialize first
      const initialized = await initOneSignal();
      if (!initialized || !window.OneSignal) return false;
    }

    try {
      setIsLoading(true);
      
      // Request permission and opt in
      await window.OneSignal.Notifications.requestPermission();
      await window.OneSignal.User.PushSubscription.optIn();

      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;

      if (optedIn && subscriptionId && userId) {
        await saveSubscription(subscriptionId, userId);
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
  }, [isSupported, userId, initOneSignal]);

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
