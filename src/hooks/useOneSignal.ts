import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// @refresh reset - Force full reload on HMR to avoid React queue issues
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

// Save subscription to database (outside hook to avoid dependency issues)
const saveSubscriptionToDb = async (playerId: string, userId: string): Promise<boolean> => {
  if (!userId || !playerId) {
    console.log('[OneSignal] Cannot save: missing userId or playerId');
    return false;
  }

  try {
    console.log('[OneSignal] Saving subscription:', { playerId, userId });
    
    const { error } = await supabase
      .from('onesignal_subscriptions')
      .upsert(
        { user_id: userId, player_id: playerId },
        { onConflict: 'player_id' }
      );

    if (error) {
      console.error('[OneSignal] Error saving subscription:', error);
      return false;
    }
    
    console.log('[OneSignal] Subscription saved successfully');
    return true;
  } catch (error) {
    console.error('[OneSignal] Error saving subscription:', error);
    return false;
  }
};

export const useOneSignal = (userId: string | null) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const initAttempted = useRef(false);
  const userIdRef = useRef(userId);

  // Keep ref updated
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Sync existing subscription to database (for resync button)
  const syncSubscription = useCallback(async (): Promise<boolean> => {
    if (!window.OneSignal || !userId) {
      console.log('[OneSignal] Cannot sync: OneSignal not ready or no userId');
      return false;
    }

    try {
      setIsSyncing(true);
      console.log('[OneSignal] Starting manual sync...');
      
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      
      console.log('[OneSignal] Current state:', { optedIn, subscriptionId });
      
      if (optedIn && subscriptionId) {
        const success = await saveSubscriptionToDb(subscriptionId, userId);
        setIsSyncing(false);
        return success;
      } else {
        console.log('[OneSignal] User not subscribed, nothing to sync');
        setIsSyncing(false);
        return false;
      }
    } catch (error) {
      console.error('[OneSignal] Sync error:', error);
      setIsSyncing(false);
      return false;
    }
  }, [userId]);

  // Initialize OneSignal SDK (only once globally)
  const initOneSignal = useCallback(async (): Promise<boolean> => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('[OneSignal] Push notifications not supported');
      setIsSupported(false);
      setIsLoading(false);
      return false;
    }

    setIsSupported(true);

    // If already initialized, just check the current status
    if (oneSignalInitialized && window.OneSignal) {
      try {
        const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
        const subscriptionId = await window.OneSignal.User.PushSubscription.id;
        
        console.log('[OneSignal] Already initialized, status:', { optedIn, subscriptionId });
        
        setIsSubscribed(optedIn);
        setPermission(Notification.permission as 'default' | 'granted' | 'denied');
        
        // Proactive sync: if user is subscribed, ensure DB is up to date
        if (optedIn && subscriptionId && userIdRef.current) {
          console.log('[OneSignal] Proactive sync on init...');
          await saveSubscriptionToDb(subscriptionId, userIdRef.current);
        }
        
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
          console.log('[OneSignal] Loading SDK...');
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
              console.log('[OneSignal] Initializing with appId:', ONESIGNAL_APP_ID);
              await OneSignal.init({
                appId: ONESIGNAL_APP_ID,
                allowLocalhostAsSecureOrigin: true,
                serviceWorkerPath: '/OneSignalSDKWorker.js',
              });
              oneSignalInitialized = true;
              console.log('[OneSignal] Initialized successfully');
            }

            // Check current subscription status
            const optedIn = await OneSignal.User.PushSubscription.optedIn;
            const subscriptionId = await OneSignal.User.PushSubscription.id;
            
            console.log('[OneSignal] Post-init status:', { optedIn, subscriptionId });
            
            setIsSubscribed(optedIn);

            // Get current permission
            const currentPermission = Notification.permission;
            setPermission(currentPermission as 'default' | 'granted' | 'denied');

            // Proactive sync: save to DB if already subscribed
            if (optedIn && subscriptionId && userIdRef.current) {
              console.log('[OneSignal] Proactive sync after init...');
              await saveSubscriptionToDb(subscriptionId, userIdRef.current);
            }

            // Listen for subscription changes
            OneSignal.User.PushSubscription.addEventListener('change', async (event: any) => {
              console.log('[OneSignal] Subscription changed:', event.current);
              setIsSubscribed(event.current.optedIn);
              
              // Save subscription to database if user is logged in - use ref for latest value
              if (userIdRef.current && event.current.optedIn && event.current.id) {
                await saveSubscriptionToDb(event.current.id, userIdRef.current);
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
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!initAttempted.current) {
      initAttempted.current = true;
      initOneSignal();
    }
  }, [initOneSignal]);

  // Re-check and sync status when userId changes
  useEffect(() => {
    const checkStatus = async () => {
      if (window.OneSignal && oneSignalInitialized) {
        try {
          const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
          const subscriptionId = await window.OneSignal.User.PushSubscription.id;
          
          console.log('[OneSignal] Re-checking status for userId:', userId, { optedIn, subscriptionId });
          
          setIsSubscribed(optedIn);
          setPermission(Notification.permission as 'default' | 'granted' | 'denied');
          
          // Sync to DB when userId becomes available
          if (optedIn && subscriptionId && userId) {
            console.log('[OneSignal] Syncing on userId change...');
            await saveSubscriptionToDb(subscriptionId, userId);
          }
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

      console.log('[OneSignal] Subscribe result:', { optedIn, subscriptionId });

      if (optedIn && subscriptionId && userId) {
        await saveSubscriptionToDb(subscriptionId, userId);
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
    isSyncing,
    permission,
    subscribe,
    unsubscribe,
    syncSubscription,
  };
};
