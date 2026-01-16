import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, Trophy, Smartphone, Clock } from 'lucide-react';
import { GAMES } from '@/constants';

const Landing: React.FC = () => {
  const featuredGames = GAMES.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-primary-foreground font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-xl text-foreground">Lumina</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link 
              to="/auth" 
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              S'inscrire
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={14} className="mr-2" />
            Plateforme de récompenses #1 en Afrique
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6">
            Jouez, gagnez et
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
              retirez vos gains
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Transformez votre temps libre en revenus réels. Retirez instantanément sur Mobile Money.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/auth?mode=signup" 
              className="group inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1"
            >
              Commencer gratuitement
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/auth" 
              className="inline-flex items-center px-8 py-4 text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">100% Sécurisé</h3>
              <p className="text-sm text-muted-foreground">Vos gains sont protégés et garantis</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Retrait instantané</h3>
              <p className="text-sm text-muted-foreground">Recevez vos gains en quelques minutes</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Mobile Money</h3>
              <p className="text-sm text-muted-foreground">Orange, MTN, Wave, Moov...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border p-8 sm:p-12">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">50K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Joueurs actifs</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">2M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">FCFA distribués</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">10+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Jeux disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Trophy size={12} className="mr-1.5" />
              TOP JEUX
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Jeux populaires</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Découvrez notre sélection de jeux et commencez à gagner dès maintenant</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
            {featuredGames.map((game, index) => (
              <div 
                key={game.id} 
                className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-muted cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Badge difficulté */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-md ${
                    game.difficulty === 'Facile' ? 'bg-emerald-500/80 text-white' :
                    game.difficulty === 'Moyen' ? 'bg-amber-500/80 text-white' :
                    'bg-rose-500/80 text-white'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-sm sm:text-lg mb-1">{game.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs sm:text-sm flex items-center gap-1">
                      <Clock size={12} />
                      {game.durationSec}s
                    </span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm bg-emerald-400/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      +{game.reward} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/auth?mode=signup" 
              className="group inline-flex items-center px-6 py-3 border-2 border-border text-foreground font-medium rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
            >
              Voir tous les jeux
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Comment ça marche ?</h2>
            <p className="text-muted-foreground">3 étapes simples pour commencer à gagner</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Créez votre compte</h3>
              <p className="text-sm text-muted-foreground">Inscription gratuite en moins de 30 secondes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Jouez aux jeux</h3>
              <p className="text-sm text-muted-foreground">Choisissez parmi notre sélection de jeux</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Retirez vos gains</h3>
              <p className="text-sm text-muted-foreground">Retrait instantané sur Mobile Money</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 sm:p-12 text-center overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Prêt à gagner de l'argent ?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                Rejoignez des milliers de joueurs et commencez à générer des revenus dès maintenant.
              </p>
              <Link 
                to="/auth?mode=signup" 
                className="group inline-flex items-center px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/95 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Créer mon compte gratuit
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-foreground">Lumina</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Lumina. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
