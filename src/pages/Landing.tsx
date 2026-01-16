import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Wallet } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-indigo-950/20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-xl">L</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Lumina</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/auth" 
              className="px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Connexion
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="px-6 py-2.5 text-sm font-semibold bg-white text-black rounded-full hover:bg-white/90 transition-all"
            >
              Commencer
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Zap size={14} className="text-yellow-400 mr-2" />
            <span className="text-sm text-white/70">Plateforme de récompenses #1 en Afrique</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Jouez.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Gagnez.
            </span>
            <br />
            Retirez.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Transformez votre temps libre en revenus. Jouez à des jeux captivants et 
            retirez vos gains instantanément sur Mobile Money.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/auth?mode=signup" 
              className="group flex items-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Créer un compte gratuit
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/auth" 
              className="px-8 py-4 text-white/70 font-medium hover:text-white transition-colors"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
              <Zap size={24} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Jeux instantanés</h3>
            <p className="text-white/50 leading-relaxed">
              Des jeux rapides et amusants conçus pour maximiser vos gains en quelques minutes.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
              <Wallet size={24} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Retrait rapide</h3>
            <p className="text-white/50 leading-relaxed">
              Retirez vos gains sur Orange Money, MTN, Wave et plus encore en quelques clics.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
              <Shield size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Sécurisé</h3>
            <p className="text-white/50 leading-relaxed">
              Vos données et vos gains sont protégés par les meilleurs systèmes de sécurité.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-24 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-2">50K+</div>
            <div className="text-sm text-white/40 uppercase tracking-wider">Joueurs actifs</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-2">2M+</div>
            <div className="text-sm text-white/40 uppercase tracking-wider">FCFA distribués</div>
          </div>
          <div>
            <div className="text-4xl sm:text-5xl font-black text-white mb-2">10+</div>
            <div className="text-sm text-white/40 uppercase tracking-wider">Jeux disponibles</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/30">
            © 2024 Lumina. Tous droits réservés.
          </div>
          <div className="flex items-center space-x-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Conditions</a>
            <a href="#" className="hover:text-white/60 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
