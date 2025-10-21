'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, userType, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated && userType) {
      switch (userType) {
        case 'patient':
          router.push('/dashboard/patient');
          break;
        case 'doctor':
          router.push('/dashboard/doctor');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
      }
    }
  }, [isAuthenticated, userType, router]);

  // Effacer les erreurs au changement de champ
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.email || !formData.password) {
      return;
    }
    
    try {
      await login(formData);
      // La redirection se fait automatiquement via useEffect
    } catch (error) {
      // L'erreur est déjà gérée par le store
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      
      {/* Header avec logo agrandi */}
      <div className="w-full py-8">
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-32 md:h-36 w-auto mx-auto drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <div className="mt-5">
            <h1 className="text-3xl md:text-4xl font-light text-neutral-800 tracking-wide">
              <span className="font-bold text-primary-700">OSIRIX</span>
              <span className="ml-3 text-neutral-600">CLINIQUE MÉDICAL</span>
            </h1>
            <p className="text-neutral-500 font-light text-base mt-3">Votre santé, notre priorité</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Section login à gauche - Plus large */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-br from-primary-50/80 to-primary-100/60 rounded-3xl shadow-2xl border-2 border-primary-200/50 p-12 h-full flex flex-col backdrop-blur-sm">
              
              {/* Titre du formulaire avec stéthoscope */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-semibold text-primary-800 mb-3">
                  Connexion
                </h2>
                <p className="text-primary-700 text-base font-medium">
                  Accédez à votre espace personnel sécurisé
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-red-800 text-sm font-semibold">Erreur de connexion</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                
                {/* Champ Email */}
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-base font-semibold text-primary-800">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all duration-300 bg-white/90 placeholder-primary-400 text-primary-800 font-medium shadow-sm"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-base font-semibold text-primary-800">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 pr-14 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all duration-300 bg-white/90 placeholder-primary-400 text-primary-800 font-medium shadow-sm"
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-500 hover:text-primary-700 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-base">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-600 bg-white border-2 border-primary-300 rounded-lg focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="ml-3 text-primary-700 group-hover:text-primary-800 transition-colors font-medium">
                      Se souvenir de moi
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Bouton de connexion - Couleur orange OSIRIX */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold py-5 px-8 rounded-xl shadow-xl hover:shadow-2xl disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-lg">Se connecter</span>
                    </>
                  )}
                </button>

                {/* Lien vers inscription */}
                <Link
                  href="/register"
                  className="w-full bg-white/80 border-2 border-primary-300 hover:border-primary-400 text-primary-700 hover:text-primary-600 font-bold py-5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="text-lg">Créer un compte patient</span>
                </Link>
              </form>

              {/* Comptes de test */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-primary-200 shadow-sm">
                  <h3 className="text-sm font-bold text-primary-700 mb-4 text-center uppercase tracking-wider">
                    Comptes de démonstration
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 border border-primary-100">
                      <span className="font-bold text-blue-600">Patient</span>
                      <span className="font-mono text-primary-700">test@patient.com</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 rounded-lg p-3 border border-primary-100">
                      <span className="font-bold text-green-600">Admin</span>
                      <span className="font-mono text-primary-700">admin@osirix-medical.com</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton retour avec icône porte de sortie */}
              <div className="mt-8 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-3 text-primary-700 hover:text-primary-600 font-bold transition-colors group text-base"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Retour à l'accueil</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section témoignage avec photo à droite */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Photo principale - Infirmière noire */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://rainbow-sante.com/wp-content/uploads/2024/02/shutterstock_2267075473-scaled.webp"
                  alt="Infirmière professionnelle souriante à OSIRIX"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent"></div>
                
                {/* Badge OSIRIX sur la photo */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    <span className="text-base font-bold text-primary-700">Équipe OSIRIX</span>
                  </div>
                </div>
                
                {/* Note de satisfaction */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-secondary-600">5.0</span>
                    <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Témoignage élégant */}
            <div className="space-y-6">
              <div className="relative">
                <svg className="absolute -top-3 -left-3 w-8 h-8 text-primary-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
                <blockquote className="text-xl md:text-2xl font-light text-neutral-700 leading-relaxed pl-6">
                  Depuis que je suis suivi à OSIRIX, ma qualité de vie s'est considérablement améliorée. L'équipe médicale est exceptionnelle et le suivi personnalisé fait toute la différence.
                </blockquote>
              </div>
              
              {/* Informations du patient */}
              <div className="flex items-center space-x-4 pl-6">
                <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-primary-200 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                    alt="Marc Kouassi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-800 text-lg">Marc Kouassi</h3>
                  <p className="text-base text-neutral-600">Patient depuis 2022 • Cardiologie</p>
                </div>
                <div className="ml-auto hidden md:flex items-center space-x-6 text-base">
                  <div className="text-center">
                    <div className="font-bold text-primary-600 text-xl">98%</div>
                    <div className="text-neutral-500">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-secondary-600 text-xl">24h</div>
                    <div className="text-neutral-500">Disponible</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}