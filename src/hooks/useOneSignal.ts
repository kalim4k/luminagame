import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ONESIGNAL_APP_ID = '15b4ea8d-7db6-46eb-86e0-1b3a1046c2af';

 export interface ServiceWorkerInfo {
   scriptURL: string;
   scope: string;
   state: string;
 }
 
 export interface OneSignalDiagnostics {
   permission: NotificationPermission;
   subscriptionId: string | null;
   optedIn: boolean;
   isPWA: boolean;
   serviceWorkers: ServiceWorkerInfo[];
   initError: string | null;
 }
 
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
   const [initError, setInitError] = useState<string | null>(null);
   const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
   const [serviceWorkers, setServiceWorkers] = useState<ServiceWorkerInfo[]>([]);
  const initAttempted = useRef(false);

   // Check if running as installed PWA
   const isPWA = typeof window !== 'undefined' && 
     (window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true);
 
   // Get all registered service workers
   const refreshServiceWorkerInfo = useCallback(async () => {
     if ('serviceWorker' in navigator) {
       try {
         const registrations = await navigator.serviceWorker.getRegistrations();
         const swInfo: ServiceWorkerInfo[] = registrations.map(reg => ({
           scriptURL: reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || 'unknown',
           scope: reg.scope,
           state: reg.active?.state || reg.installing?.state || reg.waiting?.state || 'unknown',
         }));
         setServiceWorkers(swInfo);
         console.log('[OneSignal] Service Workers:', swInfo);
       } catch (error) {
         console.error('[OneSignal] Error getting SW registrations:', error);
       }
     }
   }, []);
 
  // Initialize OneSignal SDK (only once globally)
  const initOneSignal = useCallback(async (): Promise<boolean> => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return false;
    }

    setIsSupported(true);
     setInitError(null);
 
     // Log SW info for debugging
     await refreshServiceWorkerInfo();

    // If already initialized, just check the current status
    if (oneSignalInitialized && window.OneSignal) {
      try {
        const optedIn = await window.OneSignal.User.PushSubscription.optedIn;
         const subId = await window.OneSignal.User.PushSubscription.id;
        setIsSubscribed(optedIn);
         setSubscriptionId(subId || null);
        setPermission(Notification.permission as 'default' | 'granted' | 'denied');
        setIsLoading(false);
         await refreshServiceWorkerInfo();
        return true;
      } catch (error) {
        console.error('Error checking OneSignal status:', error);
         setInitError(`Erreur vérification: ${error}`);
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
                // Use the unified PWA service worker that includes OneSignal
                serviceWorkerPath: '/sw.js',
              });
              oneSignalInitialized = true;
               console.log('[OneSignal] Initialized successfully with unified SW');
            }

            // Check current subscription status
            const optedIn = await OneSignal.User.PushSubscription.optedIn;
             const subId = await OneSignal.User.PushSubscription.id;
            setIsSubscribed(optedIn);
             setSubscriptionId(subId || null);

            // Get current permission
            const currentPermission = Notification.permission;
            setPermission(currentPermission as 'default' | 'granted' | 'denied');

            // Listen for subscription changes
            OneSignal.User.PushSubscription.addEventListener('change', async (event: any) => {
              setIsSubscribed(event.current.optedIn);
               setSubscriptionId(event.current.id || null);
              
              // Save subscription to database if user is logged in
              if (userId && event.current.optedIn && event.current.id) {
                await saveSubscription(event.current.id, userId);
              }
            });

            setIsLoading(false);
             await refreshServiceWorkerInfo();
            resolve();
          } catch (error) {
            console.error('Error initializing OneSignal:', error);
             const errorMessage = error instanceof Error ? error.message : String(error);
             setInitError(errorMessage);
             
             // Check for domain mismatch error
             if (errorMessage.includes('Can only be used on')) {
               setInitError(`Domaine non autorisé. OneSignal est configuré pour un autre domaine.`);
             }
             
            setIsLoading(false);
            resolve();
          }
        });
      } catch (error) {
        console.error('Error loading OneSignal SDK:', error);
         setInitError(`Erreur chargement SDK: ${error}`);
        setIsLoading(false);
        resolve();
      }
    });

    await oneSignalInitPromise;
    return true;
  }, [userId, refreshServiceWorkerInfo]);

  const saveSubscription = async (playerId: string, currentUserId: string) => {
    if (!currentUserId) return;

    try {
     // 1. Supprimer toutes les anciennes subscriptions de cet utilisateur
     await supabase
       .from('onesignal_subscriptions')
       .delete()
       .eq('user_id', currentUserId);

     // 2. Supprimer ce player_id s'il était associé à un autre utilisateur
     await supabase
       .from('onesignal_subscriptions')
       .delete()
       .eq('player_id', playerId);

     // 3. Insérer le nouveau player_id
      const { error } = await supabase
        .from('onesignal_subscriptions')
       .insert({ user_id: currentUserId, player_id: playerId });

      if (error) {
        console.error('Error saving OneSignal subscription:', error);
     } else {
       console.log('OneSignal subscription saved successfully:', { userId: currentUserId, playerId });
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
           const subId = await window.OneSignal.User.PushSubscription.id;
          setIsSubscribed(optedIn);
           setSubscriptionId(subId || null);
          setPermission(Notification.permission as 'default' | 'granted' | 'denied');
           await refreshServiceWorkerInfo();
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };
    
    // Small delay to ensure OneSignal is ready
    const timer = setTimeout(checkStatus, 500);
    return () => clearTimeout(timer);
  }, [userId, refreshServiceWorkerInfo]);

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
       setSubscriptionId(subscriptionId || null);
      setPermission(Notification.permission as 'default' | 'granted' | 'denied');
      setIsLoading(false);
       await refreshServiceWorkerInfo();
      
      return optedIn;
    } catch (error) {
      console.error('Error subscribing to push:', error);
       setInitError(`Erreur abonnement: ${error}`);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId, initOneSignal, refreshServiceWorkerInfo]);

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
       setInitError(`Erreur désabonnement: ${error}`);
      setIsLoading(false);
      return false;
    }
  }, [isSupported, userId]);

   // Get diagnostics for debugging
   const getDiagnostics = useCallback((): OneSignalDiagnostics => {
     return {
       permission: Notification.permission,
       subscriptionId,
       optedIn: isSubscribed,
       isPWA,
       serviceWorkers,
       initError,
     };
   }, [subscriptionId, isSubscribed, isPWA, serviceWorkers, initError]);
 
  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
     initError,
     subscriptionId,
     serviceWorkers,
     isPWA,
    subscribe,
    unsubscribe,
     getDiagnostics,
     refreshServiceWorkerInfo,
  };
};
