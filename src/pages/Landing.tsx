import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GAMES } from '@/constants';

const Landing: React.FC = () => {
  const featuredGames = GAMES.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-100">
        <nav className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-xl text-gray-900">Lumina</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/auth" 
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Commencer
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
            Plateforme de récompenses #1
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6">
            Jouez et gagnez
            <br />
            <span className="text-indigo-600">de l'argent réel</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
            Transformez votre temps libre en revenus. Retirez vos gains sur Mobile Money en quelques clics.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/auth?mode=signup" 
              className="inline-flex items-center px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Créer un compte
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/auth" 
              className="px-7 py-3.5 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-sm text-gray-500 mt-1">Joueurs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">2M+ FCFA</div>
            <div className="text-sm text-gray-500 mt-1">Distribués</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">10+</div>
            <div className="text-sm text-gray-500 mt-1">Jeux</div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos jeux populaires</h2>
            <p className="text-gray-500">Découvrez notre sélection de jeux rémunérateurs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {featuredGames.map((game) => (
              <div 
                key={game.id} 
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100"
              >
                <img 
                  src={game.image} 
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{game.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/70 text-sm">{game.category}</span>
                    <span className="text-green-400 font-semibold text-sm">+{game.reward} FCFA</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link 
              to="/auth?mode=signup" 
              className="inline-flex items-center px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Voir tous les jeux
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à commencer ?</h2>
          <p className="text-gray-400 mb-8">Rejoignez des milliers de joueurs et commencez à gagner dès aujourd'hui.</p>
          <Link 
            to="/auth?mode=signup" 
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Créer mon compte gratuit
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-medium text-gray-900">Lumina</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 Lumina. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
