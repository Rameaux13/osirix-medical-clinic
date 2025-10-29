'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    identifier: '', // Email OU Téléphone
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Validation côté client
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email ou téléphone requis';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Le mot de passe doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // ✅ Détecter si c'est un email ou un téléphone
      const isEmail = formData.identifier.includes('@');

      // ✅ Préparer les données selon le format backend
      const loginData = {
        identifier: formData.identifier, // Le backend accepte maintenant identifier
        ...(isEmail
          ? { email: formData.identifier }
          : { phone: formData.identifier }
        ),
        password: formData.password,
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/staff/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stockage du token (backend renvoie "token" et non "access_token")
      if (data.token) {
        localStorage.setItem('staff_token', data.token);
      }

      if (data.user) {
        localStorage.setItem('staff_user', JSON.stringify(data.user));
      }

      // Redirection
      router.push('/staff/dashboard/secretary');

    } catch (error: any) {
      setApiError(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006D65] via-[#004d47] to-[#003329] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Arrière-plan animé avec formes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#E6A930] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-10 relative z-10 transform transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,109,101,0.3)]">
        {/* Header avec icône simple */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#006D65] to-[#004d47] shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#006D65] via-[#004d47] to-[#006D65] bg-clip-text text-transparent mb-3 tracking-tight">
            Connexion Personnel
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Accédez à votre espace de travail
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#006D65] to-[#E6A930] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Erreur API avec animation et icône */}
        {apiError && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl mb-6 shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{apiError}</span>
            </div>
          </div>
        )}

        {/* Formulaire avec transitions fluides */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email ou Téléphone */}
          <div className="relative group">
            <label className="block text-sm font-bold text-gray-700 mb-2.5 tracking-wide flex items-center">
              <svg className="w-4 h-4 mr-2 text-[#006D65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Email ou Téléphone
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) =>
                setFormData({ ...formData, identifier: e.target.value })
              }
              className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm shadow-sm hover:shadow-md font-medium ${errors.identifier ? 'border-red-400 ring-4 ring-red-100' : 'border-gray-200 hover:border-[#006D65]/40'
                }`}
              placeholder="exemple@email.com ou +225 XX XX XX XX"
            />
            {errors.identifier && (
              <p className="text-red-600 text-sm mt-2 flex items-center font-medium">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="relative group">
            <label className="block text-sm font-bold text-gray-700 mb-2.5 tracking-wide flex items-center">
              <svg className="w-4 h-4 mr-2 text-[#006D65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm shadow-sm hover:shadow-md font-medium ${errors.password ? 'border-red-400 ring-4 ring-red-100' : 'border-gray-200 hover:border-[#006D65]/40'
                }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-2 flex items-center font-medium">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Bouton de connexion avec effet premium */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#006D65] via-[#005952] to-[#006D65] hover:from-[#005952] hover:via-[#004d47] hover:to-[#005952] text-white font-bold py-4 px-6 rounded-xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ring-2 ring-transparent hover:ring-[#E6A930]/50 focus:ring-4 focus:ring-[#006D65]/30 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {loading ? (
              <span className="flex items-center justify-center relative z-10">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              <span className="relative z-10 text-lg tracking-wide">Se connecter →</span>
            )}
          </button>
        </form>

        {/* Lien vers inscription avec séparateur élégant */}
        <div className="mt-8 text-center pt-6 border-t-2 border-gray-100">
          <p className="text-gray-600 font-medium">
            Pas encore de compte ?{' '}
            <Link
              href="/staff/register"
              className="text-[#006D65] hover:text-[#E6A930] font-bold transition-all duration-300 hover:underline underline-offset-4 decoration-2 inline-flex items-center group"
            >
              S'inscrire
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}