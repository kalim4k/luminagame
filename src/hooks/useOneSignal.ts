import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const initAttempted = useRef(false);

  // Check OneSignal status (SDK is already initialized in index.html)
  const checkOneSignalStatus = useCallback(async (): Promise<boolean> => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return false;
    }

    setIsSupported(true);

    // Wait for OneSignal to be ready (initialized in index.html)
    const waitForOneSignal = (): Promise<any> => {
      return new Promise((resolve) => {
        if (window.OneSignal) {
          resolve(window.OneSignal);
        } else {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push((OneSignal: any) => {
            resolve(OneSignal);
          });
        }
      });
    };

    try {
      const OneSignal = await waitForOneSignal();
      
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
      return true;
    } catch (error) {
      console.error('Error checking OneSignal status:', error);
      setIsLoading(false);
      return false;
    }
  }, [userId]);

  // Save subscription to database
  const saveSubscription = async (playerId: string, currentUserId: string | null) => {
    if (!playerId) {
      console.error('No player ID provided');
      return;
    }
    
    // If no userId, try to get it from the current session
    let userIdToUse = currentUserId;
    if (!userIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      userIdToUse = user?.id || null;
    }
    
    if (!userIdToUse) {
      console.log('No user logged in, cannot save subscription');
      return;
    }

    try {
      console.log('Saving subscription:', { playerId, userId: userIdToUse });
      
      // Upsert the subscription
      const { error } = await supabase
        .from('onesignal_subscriptions')
        .upsert(
          { user_id: userIdToUse, player_id: playerId },
          { onConflict: 'player_id' }
        );

      if (error) {
        console.error('Error saving OneSignal subscription:', error);
      } else {
        console.log('Subscription saved successfully');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Check status on mount
  useEffect(() => {
    if (!initAttempted.current) {
      initAttempted.current = true;
      checkOneSignalStatus();
    }
  }, [checkOneSignalStatus]);

  // Re-check status when userId changes
  useEffect(() => {
    const recheckStatus = async () => {
      if (window.OneSignal) {
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
    const timer = setTimeout(recheckStatus, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!window.OneSignal || !isSupported) {
      // Try to check status first
      const initialized = await checkOneSignalStatus();
      if (!initialized || !window.OneSignal) return false;
    }

    try {
      setIsLoading(true);
      
      // Request permission and opt in
      await window.OneSignal.Notifications.requestPermission();
      await window.OneSignal.User.PushSubscription.optIn();

      const subscriptionId = await window.OneSignal.User.PushSubscription.id;
      const optedIn = await window.OneSignal.User.PushSubscription.optedIn;

      console.log('Subscription result:', { subscriptionId, optedIn, userId });

      if (optedIn && subscriptionId) {
        // Always try to save, saveSubscription will fetch userId if needed
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
  }, [isSupported, userId, checkOneSignalStatus]);

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
