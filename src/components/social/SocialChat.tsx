import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Lock, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocialMessage } from '@/types';

interface SocialChatProps {
  userId: string | null;
  isConnected: boolean;
  onGoToConfig: () => void;
}

const PSEUDO_STORAGE_KEY = 'lumina_social_pseudo';

export const SocialChat: React.FC<SocialChatProps> = ({ 
  userId, 
  isConnected, 
  onGoToConfig 
}) => {
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [pseudo, setPseudo] = useState(() => {
    return localStorage.getItem(PSEUDO_STORAGE_KEY) || '';
  });
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    const { error } = await supabase.from('social_messages').insert({
      user_id: userId,
      pseudo: pseudo.trim(),
      message: newMessage.trim()
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
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

  // Grouper les messages par date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, SocialMessage[]>);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-150px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Chat Communautaire</h2>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-secondary/30 rounded-2xl border border-border p-4 mb-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucun message pour le moment.</p>
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
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-card border border-border text-foreground rounded-bl-md'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold text-primary mb-1">{msg.pseudo}</p>
                          )}
                          <p className="text-sm break-words">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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

      {/* Input Area or Blocked State */}
      {isConnected ? (
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Votre pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              maxLength={20}
              className="w-32 rounded-xl bg-card"
            />
            <Input
              type="text"
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              className="flex-1 rounded-xl bg-card"
            />
            <Button
              type="submit"
              disabled={isSending || !pseudo.trim() || !newMessage.trim() || pseudo.trim().length < 2}
              className="rounded-xl px-4"
            >
              <Send size={18} className={isSending ? 'animate-pulse' : ''} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Pseudo : 2-20 caractères • Message : max 500 caractères
          </p>
        </form>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Accès restreint</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configurez votre clé API et IP proxy pour envoyer des messages.
          </p>
          <Button onClick={onGoToConfig} className="rounded-xl gap-2">
            <Settings size={16} />
            Aller à la configuration
          </Button>
        </div>
      )}
    </div>
  );
};
