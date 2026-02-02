import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Lock, Settings, Users, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SocialMessage } from '@/types';
import { useOneSignal } from '@/hooks/useOneSignal';
import { NotificationToggle } from './NotificationToggle';

interface SocialChatProps {
  userId: string | null;
  isConnected: boolean;
  onGoToConfig: () => void;
  onClose: () => void;
}

const PSEUDO_STORAGE_KEY = 'lumina_social_pseudo';

export const SocialChat: React.FC<SocialChatProps> = ({ 
  userId, 
  isConnected, 
  onGoToConfig,
  onClose
}) => {
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [pseudo, setPseudo] = useState(() => {
    return localStorage.getItem(PSEUDO_STORAGE_KEY) || '';
  });
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // OneSignal hook for push notifications
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    permission: pushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = useOneSignal(userId);

  // Générer un nombre aléatoire d'utilisateurs connectés entre 112 et 230
  useEffect(() => {
    const updateConnectedUsers = () => {
      const min = 112;
      const max = 230;
      const randomUsers = Math.floor(Math.random() * (max - min + 1)) + min;
      setConnectedUsers(randomUsers);
    };

    updateConnectedUsers();
    
    // Mise à jour toutes les 30-60 secondes avec une variation légère
    const interval = setInterval(() => {
      setConnectedUsers(prev => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 à +5
        const newValue = prev + change;
        return Math.max(112, Math.min(230, newValue));
      });
    }, 30000 + Math.random() * 30000);

    return () => clearInterval(interval);
  }, []);

  // Sauvegarder le pseudo dans localStorage
  useEffect(() => {
    if (pseudo) {
      localStorage.setItem(PSEUDO_STORAGE_KEY, pseudo);
    }
  }, [pseudo]);

  // Charger les messages au démarrage
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('social_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, []);

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('social_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_messages'
        },
        (payload) => {
          const newMsg = payload.new as SocialMessage;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll vers le bas lors de nouveaux messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !pseudo.trim() || !newMessage.trim() || !isConnected) return;
    
    // Validation
    if (pseudo.trim().length < 2 || pseudo.trim().length > 20) {
      return;
    }
    if (newMessage.trim().length > 500) {
      return;
    }

    setIsSending(true);

    const messageText = newMessage.trim();
    const pseudoText = pseudo.trim();

    const { error } = await supabase.from('social_messages').insert({
      user_id: userId,
      pseudo: pseudoText,
      message: messageText
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      
      // Send push notification to other users
      try {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            senderUserId: userId,
            senderPseudo: pseudoText,
            message: messageText
          }
        });
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }
    }
    
    setIsSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Fonction pour détecter et rendre les liens cliquables
  const renderMessageWithLinks = (text: string, isOwn: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:opacity-80 transition-opacity ${
              isOwn ? 'text-primary-foreground' : 'text-primary'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Grouper les messages par date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, SocialMessage[]>);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header avec bouton retour et compteur d'utilisateurs */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0 safe-area-top">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Retour</span>
        </button>
        
        <div className="flex items-center gap-2 text-sm">
          {/* Notification toggle button */}
          {isConnected && (
            <NotificationToggle
              isSupported={isPushSupported}
              isSubscribed={isPushSubscribed}
              isLoading={isPushLoading}
              permission={pushPermission}
              onSubscribe={subscribePush}
              onUnsubscribe={unsubscribePush}
            />
          )}
          
          <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-full">
            <Users size={14} />
            <span className="font-semibold">{connectedUsers}</span>
            <span className="text-success/80">en ligne</span>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Chargement des messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">Aucun message pour le moment</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Soyez le premier à écrire !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium">
                    {date}
                  </span>
                </div>
                
                {/* Messages */}
                <div className="space-y-3">
                  {dateMessages.map((msg) => {
                    const isOwn = msg.user_id === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-card border border-border text-foreground rounded-bl-md'
                          }`}
                        >
                          <p className={`text-xs font-bold mb-1 ${isOwn ? 'text-primary-foreground/80' : 'text-primary'}`}>
                            {msg.pseudo}
                          </p>
                          <p className="text-sm break-words">{renderMessageWithLinks(msg.message, isOwn)}</p>
                          <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone de saisie en bas */}
      <div className="bg-card border-t border-border px-4 py-3 shrink-0 safe-area-bottom">
        {isConnected ? (
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                maxLength={20}
                className="w-24 rounded-xl bg-secondary text-sm"
              />
              <Input
                type="text"
                placeholder="Votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                maxLength={500}
                className="flex-1 rounded-xl bg-secondary"
              />
              <Button
                type="submit"
                disabled={isSending || !pseudo.trim() || !newMessage.trim() || pseudo.trim().length < 2}
                size="icon"
                className="rounded-xl shrink-0"
              >
                <Send size={18} className={isSending ? 'animate-pulse' : ''} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Accès restreint</p>
              <p className="text-xs text-muted-foreground truncate">Configurez votre API pour participer</p>
            </div>
            <Button onClick={onGoToConfig} size="sm" className="rounded-xl gap-1.5 shrink-0">
              <Settings size={14} />
              Config
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
