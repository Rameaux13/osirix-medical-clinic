'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Le mot de passe doit contenir au moins 6 caractères',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Les mots de passe ne correspondent pas',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Mot de passe réinitialisé avec succès !',
      });

      // Redirection vers login après 2 secondes
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Token invalide ou expiré. Veuillez refaire une demande.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo.jpg"
              alt="OSIRIX"
              className="h-24 w-auto mx-auto drop-shadow-xl hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-primary-700">
            Nouveau mot de passe
          </h1>
          <p className="text-neutral-600 mt-2">
            Créez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100">
          
          {/* Message de succès ou erreur */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                message.type === 'success'
                  ? 'bg-green-50 border-l-4 border-green-400 text-green-800'
                  : 'bg-red-50 border-l-4 border-red-400 text-red-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <p className="text-sm font-semibold">{message.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-primary-800 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-500 hover:text-primary-700"
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

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary-800 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-300 focus:border-primary-500 transition-all"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réinitialisation...
                </span>
              ) : (
                'Réinitialiser mon mot de passe'
              )}
            </button>
          </form>

          {/* Lien retour connexion */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-500 font-semibold transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}