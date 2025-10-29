'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    role: 'SECRETARY',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Validation côté client
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prénom requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Téléphone requis';
    } else {
      // Accepte: +225XXXXXXXXXX (avec ou sans espaces) ou 10 chiffres
      const cleanPhone = formData.phone.replace(/\s/g, '');
      const phoneRegex = /^(\+225\d{10}|\d{10})$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Format : +225XXXXXXXXXX ou 10 chiffres';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Genre requis';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Minimum 3 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/staff/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          gender: formData.gender,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      // Stockage du token
      localStorage.setItem('staff_token', data.token);
      localStorage.setItem('staff_user', JSON.stringify(data.user));

      // Redirection vers le dashboard secrétaire
      router.push('/staff/dashboard/secretary');
    } catch (error: any) {
      setApiError(error.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#006D65] via-[#004d47] to-[#003329] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Arrière-plan */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[#E6A930] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl p-10 relative z-10 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#006D65] to-[#004d47] shadow-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#006D65] via-[#004d47] to-[#006D65] bg-clip-text text-transparent mb-2">
            Inscription Personnel
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Créez votre compte OSIRIX
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-[#006D65] to-[#E6A930] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Erreur API */}
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.firstName ? 'border-red-400' : 'border-gray-200'
                  }`}
                placeholder="Ange"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.lastName ? 'border-red-400' : 'border-gray-200'
                  }`}
                placeholder="Kabore"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'
                }`}
              placeholder="exemple@email.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200'
                }`}
              placeholder="+225XXXXXXXXXX ou 10 chiffres"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Genre et Rôle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.gender ? 'border-red-400' : 'border-gray-200'
                  }`}
              >
                <option value="">Sélectionner</option>
                <option value="HOMME">Homme</option>
                <option value="FEMME">Femme</option>
                <option value="AUTRE">Autre</option>
              </select>
              {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all border-gray-200"
              >
                <option value="SECRETARY">Secrétaire</option>
                <option value="DOCTOR" disabled className="text-gray-400">
                  Médecin (bientôt disponible)
                </option>
                <option value="LABORANTIN" disabled className="text-gray-400">
                  Laborantin (bientôt disponible)
                </option>
              </select>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirmer mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-[#006D65]/20 focus:border-[#006D65] outline-none transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                  }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#006D65] via-[#005952] to-[#006D65] hover:from-[#005952] hover:via-[#004d47] hover:to-[#005952] text-white font-bold py-4 px-6 rounded-xl transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Inscription en cours...
              </span>
            ) : (
              <span className="text-lg tracking-wide">S'inscrire</span>
            )}
          </button>
        </form>

        {/* Lien vers connexion */}
        <div className="mt-8 text-center pt-6 border-t-2 border-gray-100">
          <p className="text-gray-600 font-medium">
            Déjà un compte ?{' '}
            <Link
              href="/staff/login"
              className="text-[#006D65] hover:text-[#E6A930] font-bold transition-all duration-300 hover:underline underline-offset-4 decoration-2"
            >
              Se connecter
            </Link>
          </p>
        </div>
        {/* Footer OSIRIX */}
        <div className="text-center mt-4 pt-3">
          <p className="text-xs sm:text-sm text-gray-600 px-4">
            © 2025 <span className="font-semibold text-[#006D65]">OSIRIX</span> - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}