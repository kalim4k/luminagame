import React, { useState } from 'react';
import { Megaphone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdminBroadcastButtonProps {
  userName: string | undefined;
}

export const AdminBroadcastButton: React.FC<AdminBroadcastButtonProps> = ({ userName }) => {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Vérifier si l'utilisateur est "michel"
  const isMichel = userName?.toLowerCase().includes('michel');

  if (!isMichel) {
    return null;
  }

  const handleSendBroadcast = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-broadcast-notification', {
        method: 'POST',
      });

      if (error) {
        console.error('Error sending broadcast:', error);
        setResult({ success: false, message: error.message || 'Erreur lors de l\'envoi' });
        return;
      }

      if (data?.success) {
        setResult({ 
          success: true, 
          message: `Notification envoyée à ${data.notified} abonné(s)` 
        });
      } else {
        setResult({ 
          success: false, 
          message: data?.error || 'Erreur inconnue' 
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setResult({ success: false, message: 'Erreur de connexion' });
    } finally {
      setIsSending(false);
      // Effacer le résultat après 5 secondes
      setTimeout(() => setResult(null), 5000);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-warning/20 text-warning rounded-lg">
          <Megaphone size={20} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Notification Broadcast</p>
          <p className="text-xs text-muted-foreground">Envoyer une notification à tous les abonnés</p>
        </div>
      </div>

      <button
        onClick={handleSendBroadcast}
        disabled={isSending}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-warning text-warning-foreground font-semibold rounded-xl hover:bg-warning/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Envoi en cours...</span>
          </>
        ) : (
          <>
            <Megaphone size={18} />
            <span>Envoyer la notification du jour</span>
          </>
        )}
      </button>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          result.success 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {result.success ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
};
