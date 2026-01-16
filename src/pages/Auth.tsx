import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: formData.name
            }
          }
        });

        if (error) throw error;
        toast.success('Compte créé avec succès !');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;
        toast.success('Connexion réussie !');
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-5">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="font-semibold text-2xl text-gray-900">Lumina</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isSignUp ? 'Créer un compte' : 'Connexion'}
              </h1>
              <p className="text-gray-500 text-sm">
                {isSignUp 
                  ? 'Rejoignez Lumina gratuitement' 
                  : 'Heureux de vous revoir'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vous@exemple.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  isSignUp ? 'Créer mon compte' : 'Se connecter'
                )}
              </button>
            </form>
          </div>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : "Pas de compte ? S'inscrire"
              }
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
