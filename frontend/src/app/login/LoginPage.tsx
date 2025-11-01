'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, userType, clearError } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // INITIALISATION DU DARK MODE DEPUIS LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // ==========================================
  // FONCTION TOGGLE DARK MODE
  // ==========================================
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // ==========================================
  // REDIRECTION SI DÉJÀ CONNECTÉ
  // ==========================================
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

  // ==========================================
  // EFFACER LES ERREURS AU CHANGEMENT DE CHAMPS
  // ==========================================
  useEffect(() => {
    if (error && (formData.email || formData.password)) {
      clearError();
    }
  }, [formData.email, formData.password]);

  // ==========================================
  // GESTION DES CHANGEMENTS D'INPUT
  // ==========================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // SOUMISSION DU FORMULAIRE DE CONNEXION
  // ==========================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !formData.email || !formData.password) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return;

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary theme-transition flex flex-col">

      {/* ========================================== */}
      {/* BOUTON DARK MODE - VERSION MOBILE (FIXE) */}
      {/* ========================================== */}
      <div className="fixed top-4 right-4 z-50 sm:hidden">
        <button
          onClick={toggleDarkMode}
          type="button"
          className="p-3 rounded-full bg-theme-card hover:bg-theme-hover shadow-theme-lg theme-transition border border-theme"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
            </svg>
          )}
        </button>
      </div>

      {/* ========================================== */}
      {/* HEADER - VERSION MOBILE ET DESKTOP */}
      {/* ========================================== */}
      <div className="w-full py-3 sm:py-4 md:py-6">
        <div className="text-center">
          {/* LOGO IMAGE - MASQUÉ SUR MOBILE, VISIBLE SUR TABLET+ */}
          <Link href="/" className="hidden sm:inline-block group">
            {/* 
              LOGO RESPONSIVE - AFFICHÉ UNIQUEMENT SUR TABLET ET DESKTOP :
              - Tablet (640px - 768px) : h-12 (48px) - Taille petite
              - Desktop (768px - 1024px) : h-16 (64px) - Taille normale desktop
              - Large Desktop (> 1024px) : h-18 (72px) - Taille grande desktop
            */}
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-12 md:h-16 lg:h-18 w-auto mx-auto drop-shadow-lg group-hover:scale-105 transition-transform duration-300 rounded-lg object-cover mb-2"
            />
          </Link>
          
          {/* 
            TEXTE DU LOGO - VISIBLE SUR TOUS LES ÉCRANS (MOBILE + DESKTOP)
            Bien centré avec text-center
          */}
          <div className="mt-2">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-theme-primary theme-transition tracking-wide text-center">
              <span className="font-bold text-primary-700">OSIRIX</span>
              <span className="ml-1 sm:ml-1.5 md:ml-2 text-theme-secondary">CLINIQUE MÉDICAL</span>
            </h1>
            {/* 
              SLOGAN - VISIBLE SUR TOUS LES ÉCRANS
              Bien centré avec text-center
            */}
            <p className="text-xs sm:text-sm text-theme-tertiary theme-transition mt-1 text-center">
              Votre santé, notre priorité
            </p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CONTENU PRINCIPAL */}
      {/* Margin-top ajouté sur mobile pour descendre le formulaire */}
      {/* ========================================== */}
      <div className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 w-full mt-8 sm:mt-0">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-stretch">

          {/* ========================================== */}
          {/* FORMULAIRE DE CONNEXION (GAUCHE) */}
          {/* ========================================== */}
          <div className="lg:col-span-6">
            <div className="bg-theme-card rounded-xl sm:rounded-2xl shadow-theme-xl border border-theme p-4 sm:p-6 md:p-8 h-full flex flex-col theme-transition">

              {/* TITRE + DARK MODE DESKTOP */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  {/* Icône de connexion */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  {/* Titre et sous-titre */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-theme-primary theme-transition">
                      Connexion
                    </h2>
                    <p className="text-xs sm:text-sm text-theme-secondary theme-transition">
                      Accédez à votre espace sécurisé
                    </p>
                  </div>
                </div>

                {/* BOUTON DARK MODE DESKTOP + TOOLTIP */}
                <div className="hidden sm:block relative group">
                  <button
                    onClick={toggleDarkMode}
                    type="button"
                    className="p-3.5 rounded-full bg-theme-card hover:bg-theme-hover shadow-theme-lg theme-transition border border-theme flex items-center justify-center"
                    aria-label="Toggle Dark Mode"
                  >
                    {darkMode ? (
                      <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
                      </svg>
                    )}
                  </button>
                  {/* Tooltip au survol */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <div className="bg-theme-primary text-theme-inverse text-xs font-medium px-3 py-1.5 rounded-lg shadow-theme-lg whitespace-nowrap">
                      Mode sombre
                    </div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-theme-primary"></div>
                  </div>
                </div>
              </div>

              {/* ========================================== */}
              {/* MESSAGE D'ERREUR */}
              {/* ========================================== */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded-r-lg theme-transition">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-red-700 dark:text-red-300 text-sm font-semibold">Erreur de connexion</p>
                      <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* FORMULAIRE */}
              {/* ========================================== */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 flex-1">

                {/* CHAMP EMAIL */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* CHAMP MOT DE PASSE */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                      placeholder="••••••"
                    />
                    {/* Bouton pour afficher/masquer le mot de passe */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-tertiary hover:text-primary-500 theme-transition"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* OPTIONS : SE SOUVENIR + MOT DE PASSE OUBLIÉ */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                    <span className="ml-2 text-theme-secondary theme-transition">Se souvenir</span>
                  </label>
                  <Link href="/forgot-password" className="text-primary-500 hover:text-primary-600 font-medium">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* ========================================== */}
                {/* BOUTONS D'ACTION */}
                {/* ========================================== */}
                <div className="space-y-3">
                  {/* BOUTON SE CONNECTER */}
                  <button
                    type="submit"
                    disabled={isLoading || !formData.email || !formData.password}
                    className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 disabled:opacity-50 text-white font-bold py-3 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Se connecter</span>
                      </>
                    )}
                  </button>

                  {/* BOUTON CRÉER UN COMPTE */}
                  <Link
                    href="/register"
                    className="w-full bg-theme-card border-2 border-theme hover:bg-theme-hover text-theme-primary font-bold py-3 sm:py-3.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Créer un compte</span>
                  </Link>
                </div>
              </form>

              {/* LIEN RETOUR À L'ACCUEIL */}
              <div className="mt-4 text-center">
                <Link href="/" className="inline-flex items-center space-x-2 text-theme-secondary hover:text-primary-500 font-medium text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Retour à l'accueil</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* TÉMOIGNAGE (DESKTOP UNIQUEMENT - DROITE) */}
          {/* ========================================== */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            {/* IMAGE AVEC BADGES */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://rainbow-sante.com/wp-content/uploads/2024/02/shutterstock_2267075473-scaled.webp"
                alt="Infirmière OSIRIX"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent"></div>
              
              {/* Badge "Équipe OSIRIX" en bas à gauche */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-base font-bold text-primary-700">Équipe OSIRIX</span>
                </div>
              </div>
              
              {/* Badge "5.0" en haut à droite */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold text-secondary-600">5.0</span>
                  <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* CITATION DU TÉMOIGNAGE */}
            <div className="space-y-6">
              <blockquote className="text-lg font-light text-theme-secondary pl-6 relative">
                <svg className="absolute -top-3 -left-3 w-8 h-8 text-primary-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
                Depuis que je suis suivi à OSIRIX, ma qualité de vie s'est considérablement améliorée.
              </blockquote>
              
              {/* PROFIL DU TÉMOIN */}
              <div className="flex items-center space-x-4 pl-6">
                <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-theme-light shadow-lg">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Marc Kouassi" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-theme-primary">Marc Kouassi</h3>
                  <p className="text-sm text-theme-secondary">Patient depuis 2022</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* FOOTER */}
      {/* ========================================== */}
      <div className="w-full py-3 sm:py-4 mt-auto">
        <p className="text-center text-xs text-theme-tertiary theme-transition">
          © 2025 OSIRIX Clinique Médical. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}