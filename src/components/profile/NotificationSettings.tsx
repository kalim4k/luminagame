import React from 'react';
 import { Bell, BellOff, AlertCircle, CheckCircle, Bug, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOneSignal } from '@/hooks/useOneSignal';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';

interface NotificationSettingsProps {
  userId: string | null;
   showDiagnostics?: boolean;
}

 export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId, showDiagnostics = false }) => {
  const {
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
     refreshServiceWorkerInfo,
  } = useOneSignal(userId);
 
   const [showDebug, setShowDebug] = React.useState(false);
   const [sendingTest, setSendingTest] = React.useState(false);
 
   const handleSendTestNotification = async () => {
     if (!subscriptionId || !userId) {
       toast.error('Pas de subscriptionId ou userId');
       return;
     }
 
     setSendingTest(true);
     try {
       const { data, error } = await supabase.functions.invoke('send-push-notification', {
         body: {
           playerIds: [subscriptionId],
           title: '🔔 Test Notification',
           message: 'Si tu vois ceci, les notifications fonctionnent !',
           data: { type: 'test' },
         },
       });
 
       if (error) {
         console.error('Test notification error:', error);
         toast.error(`Erreur: ${error.message}`);
       } else if (data?.error) {
         console.error('OneSignal error:', data.error);
         toast.error(`OneSignal: ${data.error}`);
       } else {
         toast.success('Notification test envoyée ! Vérifie ton téléphone.');
         console.log('Test notification response:', data);
       }
     } catch (err) {
       console.error('Error sending test:', err);
       toast.error('Erreur lors de l\'envoi');
     } finally {
       setSendingTest(false);
     }
   };

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
    <div className="space-y-4">
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
 
      {/* Error display */}
       {initError && (
         <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
           <p className="text-sm text-destructive font-medium">⚠️ Erreur OneSignal</p>
           <p className="text-xs text-muted-foreground mt-1">{initError}</p>
         </div>
       )}
 
       {/* Diagnostics Panel */}
       {showDiagnostics && (
         <div className="space-y-2">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setShowDebug(!showDebug)}
             className="text-xs text-muted-foreground"
           >
             <Bug size={14} className="mr-1" />
             {showDebug ? 'Masquer diagnostics' : 'Afficher diagnostics'}
           </Button>
 
           {showDebug && (
             <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 text-sm">
               <div className="flex items-center justify-between">
                 <span className="font-medium">Diagnostic Notifications</span>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={refreshServiceWorkerInfo}
                   className="h-7"
                 >
                   <RefreshCw size={14} />
                 </Button>
               </div>
 
               <div className="grid gap-2 text-xs">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Permission navigateur:</span>
                   <span className={permission === 'granted' ? 'text-success' : 'text-destructive'}>
                     {permission}
                   </span>
                 </div>
 
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Mode PWA:</span>
                   <span className={isPWA ? 'text-success' : 'text-warning'}>
                     {isPWA ? 'Oui (installée)' : 'Non (navigateur)'}
                   </span>
                 </div>
 
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Abonné (optedIn):</span>
                   <span className={isSubscribed ? 'text-success' : 'text-muted-foreground'}>
                     {isSubscribed ? 'Oui' : 'Non'}
                   </span>
                 </div>
 
                 <div className="flex flex-col gap-1">
                   <span className="text-muted-foreground">Subscription ID:</span>
                   <code className="text-xs bg-background p-1 rounded break-all">
                     {subscriptionId || 'Aucun'}
                   </code>
                 </div>
 
                 <div className="flex flex-col gap-1">
                   <span className="text-muted-foreground">Service Workers actifs:</span>
                   {serviceWorkers.length === 0 ? (
                     <span className="text-warning">Aucun SW enregistré</span>
                   ) : (
                     serviceWorkers.map((sw, i) => (
                       <div key={i} className="bg-background p-2 rounded text-xs">
                         <div className="break-all"><strong>URL:</strong> {sw.scriptURL}</div>
                         <div><strong>Scope:</strong> {sw.scope}</div>
                         <div><strong>État:</strong> {sw.state}</div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
 
               {/* Test notification button */}
               {isSubscribed && subscriptionId && (
                 <Button
                   onClick={handleSendTestNotification}
                   disabled={sendingTest}
                   variant="outline"
                   size="sm"
                   className="w-full mt-2"
                 >
                   <Send size={14} className="mr-2" />
                   {sendingTest ? 'Envoi...' : 'Envoyer une notification test'}
                 </Button>
               )}
             </div>
           )}
         </div>
       )}
    </div>
  );
};
