import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2, TreePine, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PAYMENT_PROVIDERS } from '@/constants';

interface ForestMysteryGameProps {
  onBack: () => void;
  userId: string;
  onEarnings: (amount: number, gameTitle: string) => void;
}

const ForestMysteryGame: React.FC<ForestMysteryGameProps> = ({ onBack, userId, onEarnings }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error' | 'already_used'>('idle');
  const [reward, setReward] = useState(0);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const providers = Object.entries(PAYMENT_PROVIDERS);

  const handleSubmit = async () => {
    if (!code.trim() || status === 'checking') return;

    setStatus('checking');
    setErrorMessage('');

    try {
      // Check if code exists
      const { data: codeData, error: codeError } = await supabase
        .from('game_codes')
        .select('*')
        .eq('code', code.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (codeError) throw codeError;

      if (!codeData) {
        setStatus('error');
        setErrorMessage('Code invalide. Vérifiez et réessayez.');
        return;
      }

      // Check if already used
      const { data: usedData } = await supabase
        .from('used_codes')
        .select('id')
        .eq('user_id', userId)
        .eq('code_id', codeData.id)
        .maybeSingle();

      if (usedData) {
        setStatus('already_used');
        setErrorMessage('Vous avez déjà utilisé ce code.');
        return;
      }

      // Mark as used
      await supabase.from('used_codes').insert({
        user_id: userId,
        code_id: codeData.id,
      });

      const earnedAmount = codeData.reward;
      setReward(earnedAmount);

      // Show floating reward animation
      setShowRewardAnimation(true);
      setTimeout(() => setShowRewardAnimation(false), 2000);

      // 3s loading then success
      setTimeout(() => {
        setStatus('success');
        onEarnings(earnedAmount, 'Forest Mystery');
      }, 3000);

    } catch (error) {
      console.error('Error checking code:', error);
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Réessayez.');
    }
  };

  const handleReset = () => {
    setCode('');
    setStatus('idle');
    setReward(0);
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--background))] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <TreePine size={18} className="text-emerald-500" />
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Forest Mystery</h1>
        </div>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all active:scale-95"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Floating reward animation */}
        {showRewardAnimation && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-reward-float pointer-events-none">
            <div className="flex items-center gap-2 text-emerald-500">
              <Sparkles size={24} />
              <span className="text-4xl font-black tracking-tight">+{reward} FCFA</span>
              <Sparkles size={24} />
            </div>
          </div>
        )}

        {status === 'checking' ? (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-[3px] border-emerald-500/20 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Vérification en cours</p>
              <p className="text-sm text-muted-foreground mt-1">Validation de votre code...</p>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center gap-6 animate-scale-in max-w-sm w-full">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">Code validé !</p>
              <p className="text-3xl font-black text-emerald-500 mt-2">+{reward} FCFA</p>
              <p className="text-sm text-muted-foreground mt-3">
                La récompense a été envoyée à votre adresse de paiement.
              </p>
            </div>
            {/* Mix By Yass payment method */}
            <div className="flex items-center gap-3 bg-secondary/80 border border-border/50 rounded-xl px-5 py-3">
              <img
                src={PAYMENT_PROVIDERS['Mix By Yass']}
                alt="Mix By Yass"
                className="w-10 h-10 rounded-lg object-cover"
              />
              <span className="text-sm font-semibold text-foreground">Mix By Yass</span>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all active:scale-[0.97] mt-2"
            >
              Saisir un autre code
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm flex flex-col items-center gap-6">
            {/* Scrolling Payment Providers - above input */}
            <div className="w-full overflow-hidden py-2">
              <div className="flex animate-scroll-left">
                {[...providers, ...providers, ...providers].map(([name, url], i) => (
                  <div key={`${name}-${i}`} className="flex-shrink-0 mx-4 flex items-center gap-2 opacity-50">
                    <img src={url} alt={name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Entrez votre code</h2>
              <p className="text-sm text-muted-foreground mt-2">Saisissez un code valide pour recevoir votre récompense</p>
            </div>

            <div className="w-full space-y-3">
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (status === 'error' || status === 'already_used') {
                    setStatus('idle');
                    setErrorMessage('');
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ex: FOREST-XXXX"
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-xl text-foreground text-center text-lg font-mono tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
              />

              {(status === 'error' || status === 'already_used') && (
                <p className="text-sm text-destructive text-center animate-fade-in">{errorMessage}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!code.trim()}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all active:scale-[0.97] disabled:active:scale-100"
              >
                Valider le code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForestMysteryGame;
