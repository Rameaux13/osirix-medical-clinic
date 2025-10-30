'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { RegisterRequest } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated, userType, clearError } = useAuthStore();

  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    city: '',
    // Champs obligatoires pour le backend mais vides
    address: 'Non renseigné',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyContact: '',
    emergencyContactPhone: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // États pour la vérification en temps réel
  const [emailAvailability, setEmailAvailability] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [phoneAvailability, setPhoneAvailability] = useState<'checking' | 'available' | 'taken' | null>(null);

  // Redirection si déjà connecté
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
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [formData, clearError]);

  // Vérification de disponibilité de l'email
  const checkEmailAvailability = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailability(null);
      return;
    }

    setEmailAvailability('checking');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        setEmailAvailability(result.available ? 'available' : 'taken');
      }
    } catch (error) {
      setEmailAvailability(null);
    }
  };

  // Vérification de disponibilité du téléphone
  const checkPhoneAvailability = async (phone: string) => {
    if (!phone || phone.length < 8) {
      setPhoneAvailability(null);
      return;
    }

    setPhoneAvailability('checking');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/auth/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        const result = await response.json();
        setPhoneAvailability(result.available ? 'available' : 'taken');
      }
    } catch (error) {
      setPhoneAvailability(null);
    }
  };

  // Debounced functions pour éviter trop d'appels API
  useEffect(() => {
    const delayedEmailCheck = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      }
    }, 1000);

    return () => clearTimeout(delayedEmailCheck);
  }, [formData.email]);

  useEffect(() => {
    const delayedPhoneCheck = setTimeout(() => {
      if (formData.phone) {
        checkPhoneAvailability(formData.phone);
      }
    }, 1000);

    return () => clearTimeout(delayedPhoneCheck);
  }, [formData.phone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation renforcée par étapes
  const validateStepWithBackend = async (step: number): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        // Prénom
        if (!formData.firstName || formData.firstName.length < 2) {
          errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        if (formData.firstName && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.firstName)) {
          errors.push('Le prénom ne peut contenir que des lettres');
        }

        // Nom
        if (!formData.lastName || formData.lastName.length < 2) {
          errors.push('Le nom doit contenir au moins 2 caractères');
        }
        if (formData.lastName && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.lastName)) {
          errors.push('Le nom ne peut contenir que des lettres');
        }

        // Téléphone
        if (!formData.phone) {
          errors.push('Le téléphone est obligatoire');
        }
        if (formData.phone && !/^(\+225)?[0-9\s-]{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          errors.push('Format de téléphone invalide');
        }
        if (phoneAvailability === 'taken') {
          errors.push('Ce numéro est déjà utilisé');
        }

        // Email
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push('Format d\'email invalide');
        }
        if (emailAvailability === 'taken') {
          errors.push('Cet email est déjà utilisé');
        }

        // Genre
        if (!formData.gender) {
          errors.push('Le genre est obligatoire');
        }

        // Date de naissance (optionnel mais si fourni, doit être valide)
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 1 || age > 120) {
            errors.push('L\'âge doit être entre 1 et 120 ans');
          }
        }
        break;

      case 2:
        // Mot de passe
        if (!formData.password || formData.password.length < 3) {
          errors.push('Le mot de passe doit contenir au moins 3 caractères');
        }
        if (formData.password && !/^[a-zA-Z0-9]+$/.test(formData.password)) {
          errors.push('Le mot de passe ne peut contenir que des lettres et chiffres');
        }

        // Confirmation mot de passe
        if (formData.password !== confirmPassword) {
          errors.push('Les mots de passe ne correspondent pas');
        }

        // Acceptation des conditions
        if (!acceptTerms) {
          errors.push('Vous devez accepter les conditions d\'utilisation');
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleNextStep = async () => {
    setValidationErrors([]);

    const validation = await validateStepWithBackend(currentStep);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const step1Validation = await validateStepWithBackend(1);
    const step2Validation = await validateStepWithBackend(2);

    const allErrors = [
      ...step1Validation.errors,
      ...step2Validation.errors
    ];

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    const cleanedFormData = {
      ...formData,
      city: formData.city?.trim() || 'Non renseigné',
      dateOfBirth: formData.dateOfBirth || '2000-01-01',
    };

    try {
      await register(cleanedFormData);
    } catch (error) {
      console.error(error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#006D65] via-[#005a54] to-[#004d46] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header avec logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-24 w-auto mx-auto mb-4 drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Créer un compte patient
          </h2>
          <p className="text-gray-600">
            Rejoignez OSIRIX pour un suivi médical personnalisé
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-[#006D65]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#006D65] text-white' : 'bg-gray-300'} shadow-lg`}>
                1
              </div>
              <span className="ml-3 text-sm font-semibold">Informations</span>
            </div>
            <div className="flex-1 h-2 mx-4 bg-gray-200 rounded-full">
              <div className={`h-full bg-[#006D65] rounded-full transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-[#006D65]' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#006D65] text-white' : 'bg-gray-300'} shadow-lg`}>
                2
              </div>
              <span className="ml-3 text-sm font-semibold">Sécurité</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">

          {/* Messages d'erreur */}
          {(error || validationErrors.length > 0) && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  {error && <p className="text-red-700 text-sm font-semibold mb-2">{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="text-red-700 text-sm space-y-1">
                      {validationErrors.map((err, index) => (
                        <li key={index}>• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Étape 1 : Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Vos informations
                </h3>

                {/* Prénom et Nom */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                      placeholder="Prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                {/* Date de naissance (optionnel) */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de naissance (optionnel)
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro de téléphone *
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        phoneAvailability === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : phoneAvailability === 'available'
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 focus:ring-[#006D65] focus:border-[#006D65]'
                      }`}
                      placeholder="+225 XX XX XX XX XX"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {phoneAvailability === 'checking' && (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {phoneAvailability === 'available' && (
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {phoneAvailability === 'taken' && (
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {phoneAvailability === 'available' && (
                    <p className="text-xs text-green-600 mt-1">✓ Disponible</p>
                  )}
                  {phoneAvailability === 'taken' && (
                    <p className="text-xs text-red-600 mt-1">✗ Déjà utilisé</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        emailAvailability === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : emailAvailability === 'available'
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 focus:ring-[#006D65] focus:border-[#006D65]'
                      }`}
                      placeholder="email@exemple.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailAvailability === 'checking' && (
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {emailAvailability === 'available' && (
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {emailAvailability === 'taken' && (
                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailAvailability === 'available' && (
                    <p className="text-xs text-green-600 mt-1">✓ Disponible</p>
                  )}
                  {emailAvailability === 'taken' && (
                    <p className="text-xs text-red-600 mt-1">✗ Déjà utilisé</p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Genre *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        id="gender-male"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="gender-male"
                        className={`cursor-pointer block w-full p-3 rounded-xl border-2 text-center font-semibold transition-all ${formData.gender === 'male'
                          ? 'border-[#006D65] bg-[#006D65]/10 text-[#006D65] shadow-lg scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#006D65]'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs">Homme</span>
                        </div>
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        id="gender-female"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="gender-female"
                        className={`cursor-pointer block w-full p-3 rounded-xl border-2 text-center font-semibold transition-all ${formData.gender === 'female'
                          ? 'border-[#006D65] bg-[#006D65]/10 text-[#006D65] shadow-lg scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#006D65]'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs">Femme</span>
                        </div>
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        id="gender-other"
                        name="gender"
                        type="radio"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="gender-other"
                        className={`cursor-pointer block w-full p-3 rounded-xl border-2 text-center font-semibold transition-all ${formData.gender === 'other'
                          ? 'border-[#006D65] bg-[#006D65]/10 text-[#006D65] shadow-lg scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-[#006D65]'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">Autre</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Sécurité */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Sécurité
                </h3>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
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
                  <p className="text-xs text-gray-500 mt-1">Minimum 3 caractères</p>
                </div>

                {/* Vérification mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Vérification du mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                    placeholder="••••••"
                  />
                </div>

                {/* Ville (optionnel) */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville (optionnel)
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006D65] focus:border-[#006D65] transition-all"
                    placeholder="Votre ville"
                  />
                </div>

                {/* Conditions d'utilisation */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-[#006D65]/5 p-4 rounded-xl border border-[#006D65]/20 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-[#006D65]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[#006D65] font-semibold text-sm">Sécurité & Confidentialité</span>
                    </div>
                    <p className="text-gray-600 text-xs">
                      Vos données sont protégées. Nous respectons votre vie privée.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#006D65] focus:ring-[#006D65] border-gray-300 rounded"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-[#006D65] hover:text-[#005a54] font-bold underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-[#006D65] hover:text-[#005a54] font-bold underline">
                        politique de confidentialité
                      </Link>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    Précédent
                  </button>
                )}
              </div>

              <div>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-[#E6A930] to-[#d49821] hover:from-[#d49821] hover:to-[#c28a1e] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="bg-gradient-to-r from-[#E6A930] to-[#d49821] hover:from-[#d49821] hover:to-[#c28a1e] text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-[#006D65] hover:text-[#005a54] font-bold underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Bouton retour à l'accueil */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-5 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="w-full py-4 mt-6">
          <p className="text-center text-xs text-gray-600">
            © 2025 OSIRIX Clinique Médical. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}