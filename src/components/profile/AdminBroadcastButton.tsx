import React, { useState } from 'react';
import { Megaphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BROADCAST_MESSAGES = [
  { names: 'Alex et 78 autres joueurs', min: 2000, max: 7000 },
  { names: 'Sarah et 134 autres joueurs', min: 3000, max: 8500 },
  { names: 'Moussa et 92 autres joueurs', min: 1500, max: 6000 },
  { names: 'Fatou et 156 autres joueurs', min: 2500, max: 9000 },
  { names: 'Ibrahim et 67 autres joueurs', min: 1000, max: 5500 },
  { names: 'Awa et 113 autres joueurs', min: 3500, max: 7500 },
  { names: 'Koffi et 89 autres joueurs', min: 2000, max: 8000 },
  { names: 'Aminata et 145 autres joueurs', min: 4000, max: 10000 },
];

export const AdminBroadcastButton: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBroadcast = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      // Pick a random message template
      const template = BROADCAST_MESSAGES[Math.floor(Math.random() * BROADCAST_MESSAGES.length)];
      const amount = `${template.min.toLocaleString()} et ${template.max.toLocaleString()} FCFA`;

      const title = '💰 Retraits en cours !';
      const body = `${template.names} ont retiré entre ${amount} aujourd'hui. Jouez maintenant !`;

      const { data, error } = await supabase.functions.invoke('send-broadcast-notification', {
        body: { title, body },
      });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Broadcast error:', err);
      setErrorMessage(err.message || 'Erreur lors de l\'envoi');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-warning/10 text-warning rounded-lg">
          <Megaphone size={20} />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Broadcast Admin</h3>
          <p className="text-xs text-muted-foreground">Envoyer une notification à tous les abonnés</p>
        </div>
      </div>

      <button
        onClick={handleBroadcast}
        disabled={status === 'loading'}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
          status === 'success'
            ? 'bg-success/10 text-success border border-success/30'
            : status === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/30'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
        }`}
      >
        {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
        {status === 'success' && <CheckCircle size={18} />}
        {status === 'error' && <AlertCircle size={18} />}
        <span>
          {status === 'loading'
            ? 'Envoi en cours...'
            : status === 'success'
              ? 'Notification envoyée !'
              : status === 'error'
                ? errorMessage
                : 'Envoyer une notification'}
        </span>
      </button>
    </div>
  );
};
