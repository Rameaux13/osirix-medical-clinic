'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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
  // GESTION DE L'ENVOI DU LIEN DE RÉINITIALISATION
  // ==========================================
  const handleSendResetLink = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (!email || isLoading) return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      setMessage({
        type: 'success',
        text: response.data.message || 'Un email de réinitialisation a été envoyé.',
      });
      setEmail('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
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
      {/* CONTENU PRINCIPAL - CENTRÉ VERTICALEMENT */}
      {/* ========================================== */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="max-w-md w-full">

          {/* ========================================== */}
          {/* HEADER AVEC LOGO */}
          {/* ========================================== */}
          <div className="text-center mb-6 md:mb-8">
            {/* LOGO IMAGE - MASQUÉ SUR MOBILE, VISIBLE SUR TABLET+ */}
            <Link href="/" className="hidden sm:inline-block group">
              <img
                src="/logo.jpg"
                alt="OSIRIX Clinique Médical"
                className="h-16 md:h-20 lg:h-24 w-auto mx-auto drop-shadow-lg hover:scale-105 transition-transform duration-300 rounded-lg object-cover mb-3"
              />
            </Link>

            {/* TEXTE "OSIRIX" - VISIBLE SUR TOUS LES ÉCRANS */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-light text-theme-primary theme-transition tracking-wide text-center">
                <span className="font-bold text-primary-700">OSIRIX</span>
                <span className="ml-1.5 md:ml-2 text-theme-secondary">CLINIQUE MÉDICAL</span>
              </h1>
              <p className="text-xs sm:text-sm text-theme-tertiary theme-transition mt-1 text-center">
                Votre santé, notre priorité
              </p>
            </div>
          </div>

          {/* ========================================== */}
          {/* FORMULAIRE AVEC TITRE INTÉGRÉ */}
          {/* ========================================== */}
          <div className="bg-theme-card rounded-xl sm:rounded-2xl shadow-theme-xl border border-theme p-5 sm:p-6 md:p-8 theme-transition">

            {/* BOUTON DARK MODE DESKTOP */}
            <div className="hidden sm:flex justify-end mb-4">
              <button
                onClick={toggleDarkMode}
                type="button"
                className="p-3 rounded-full bg-theme-card hover:bg-theme-hover shadow-theme-lg theme-transition border border-theme"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z" />
                  </svg>
                )}
              </button>
            </div>

            {/* ========================================== */}
            {/* TITRE ET DESCRIPTION - INTÉGRÉS DANS LE BLOC */}
            {/* ========================================== */}
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-theme-primary theme-transition">
                Mot de passe oublié ?
              </h2>
              <p className="text-theme-secondary theme-transition mt-2 text-sm md:text-base">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            {/* ========================================== */}
            {/* MESSAGE DE SUCCÈS OU ERREUR */}
            {/* ========================================== */}
            {message && (
              <div
                className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg md:rounded-xl theme-transition ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-600'
                    : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600'
                }`}
              >
                <div className="flex items-start">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 md:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 md:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <p className={`text-xs md:text-sm font-semibold ${
                    message.type === 'success' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* CHAMP EMAIL */}
            {/* ========================================== */}
            <div className="space-y-5 md:space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-theme-primary theme-transition mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="input-theme w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="votre@email.com"
                />
              </div>

              {/* ========================================== */}
              {/* BOUTON D'ENVOI */}
              {/* ========================================== */}
              <div className="text-center">
                <a
                  href="#"
                  onClick={handleSendResetLink}
                  className={`inline-flex items-center justify-center w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm md:text-base transition-all shadow-lg ${
                    isLoading || !email
                      ? 'bg-neutral-400 dark:bg-neutral-600 text-white cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white cursor-pointer hover:shadow-xl transform hover:scale-105'
                  }`}
                  style={{
                    pointerEvents: (isLoading || !email) ? 'none' : 'auto',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Envoyer le lien de réinitialisation
                    </>
                  )}
                </a>
              </div>
            </div>

            {/* ========================================== */}
            {/* LIEN RETOUR CONNEXION */}
            {/* ========================================== */}
            <div className="mt-5 md:mt-6 text-center border-t border-theme pt-5 md:pt-6 theme-transition">
              <Link
                href="/login"
                className="inline-flex items-center text-primary-500 hover:text-primary-600 font-semibold transition-colors text-sm md:text-base"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la connexion
              </Link>
            </div>
          </div>

          {/* ========================================== */}
          {/* FOOTER */}
          {/* ========================================== */}
          <div className="w-full py-3 md:py-4 mt-4 md:mt-6">
            <p className="text-center text-[10px] md:text-xs text-theme-tertiary theme-transition">
              © 2025 OSIRIX Clinique Médical. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}