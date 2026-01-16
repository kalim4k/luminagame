import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Shield, Smartphone, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="px-6 py-5 border-b border-gray-100">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
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
      <main className="px-6">
        <div className="max-w-6xl mx-auto pt-20 pb-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Nouveau : Retraits instantanés disponibles
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-gray-900 mb-6">
              Gagnez de l'argent
              <br />
              <span className="text-indigo-600">en jouant.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-500 max-w-xl leading-relaxed mb-10">
              La plateforme qui récompense votre temps. Jouez à des mini-jeux et retirez vos gains directement sur Mobile Money.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link 
                to="/auth?mode=signup" 
                className="group inline-flex items-center px-6 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Créer un compte gratuit
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                to="/auth" 
                className="inline-flex items-center px-6 py-3.5 text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                <Play size={16} className="mr-2" />
                Voir comment ça marche
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-500 mt-1">Utilisateurs actifs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">2M FCFA</div>
              <div className="text-sm text-gray-500 mt-1">Distribués ce mois</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{"<"}5min</div>
              <div className="text-sm text-gray-500 mt-1">Délai de retrait</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto py-24 border-t border-gray-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça fonctionne</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Trois étapes simples pour commencer à gagner de l'argent avec Lumina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone size={28} className="text-indigo-600" />
              </div>
              <div className="text-sm font-semibold text-indigo-600 mb-2">Étape 1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Créez votre compte</h3>
              <p className="text-gray-500 leading-relaxed">
                Inscription gratuite en 30 secondes. Aucune carte bancaire requise.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play size={28} className="text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">Étape 2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Jouez aux jeux</h3>
              <p className="text-gray-500 leading-relaxed">
                Choisissez parmi notre catalogue de jeux et commencez à accumuler des gains.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={28} className="text-amber-600" />
              </div>
              <div className="text-sm font-semibold text-amber-600 mb-2">Étape 3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Retirez vos gains</h3>
              <p className="text-gray-500 leading-relaxed">
                Transférez vers Orange Money, Wave, MTN ou Moov en quelques clics.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="max-w-6xl mx-auto py-24 border-t border-gray-100">
          <div className="bg-gray-50 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-green-600" />
                <span className="text-sm font-semibold text-green-600">Sécurisé & Fiable</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Vos gains sont protégés
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Nous utilisons les technologies de sécurité les plus avancées pour protéger vos données et garantir des paiements fiables.
              </p>
            </div>
            <Link 
              to="/auth?mode=signup" 
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Rejoindre Lumina
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-medium text-gray-900">Lumina</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 Lumina. Tous droits réservés.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Conditions</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
