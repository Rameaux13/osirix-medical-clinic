'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendResetLink = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo.jpg"
              alt="OSIRIX"
              className="h-20 md:h-24 w-auto mx-auto drop-shadow-xl hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="mt-3 md:mt-4 text-xl md:text-2xl font-bold text-primary-700">
            Mot de passe oublié ?
          </h1>
          <p className="text-neutral-600 mt-2 text-sm md:text-base">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 border-2 border-primary-100">

          {/* Message de succès ou erreur */}
          {message && (
            <div
              className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg md:rounded-xl ${
                message.type === 'success'
                  ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
                  : 'bg-red-50 border-l-4 border-red-400 text-red-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2 md:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 md:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="text-xs md:text-sm font-semibold">{message.text}</p>
              </div>
            </div>
          )}

          {/* Champ Email */}
          <div className="space-y-5 md:space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs md:text-sm font-semibold text-primary-800 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 md:px-4 md:py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-all text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="votre@email.com"
              />
            </div>

            {/* LIEN CLIQUABLE (plus de bouton) */}
            <div className="text-center">
              <a
                href="#"
                onClick={handleSendResetLink}
                className={`inline-flex items-center justify-center w-full py-4 px-6 rounded-xl font-bold text-sm md:text-base transition-all shadow-lg ${
                  isLoading || !email
                    ? 'bg-neutral-400 text-white cursor-not-allowed'
                    : 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white cursor-pointer hover:shadow-xl'
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

          {/* Lien retour connexion */}
          <div className="mt-5 md:mt-6 text-center border-t border-primary-100 pt-5 md:pt-6">
            <Link
              href="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 font-semibold transition-colors text-sm md:text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full py-3 md:py-4 mt-4 md:mt-6">
          <div className="max-w-md mx-auto px-3 md:px-4">
            <p className="text-center text-[10px] md:text-xs text-neutral-600">
              © 2025 OSIRIX Clinique Médical. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}