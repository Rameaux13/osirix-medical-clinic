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
    // Informations personnelles obligatoires
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    city: '',

    // Informations médicales optionnelles
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        if (!formData.firstName || formData.firstName.length < 2) {
          errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        if (formData.firstName && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.firstName)) {
          errors.push('Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes');
        }

        if (!formData.lastName || formData.lastName.length < 2) {
          errors.push('Le nom doit contenir au moins 2 caractères');
        }
        if (formData.lastName && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(formData.lastName)) {
          errors.push('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes');
        }

        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push('Format d\'email invalide');
        }
        if (emailAvailability === 'taken') {
          errors.push('Cet email est déjà utilisé par un autre compte');
        }

        if (!formData.password || formData.password.length < 3) {
          errors.push('Le mot de passe doit contenir au moins 3 caractères');
        }
        if (formData.password && !/^[a-zA-Z0-9]+$/.test(formData.password)) {
          errors.push('Le mot de passe ne peut contenir que des lettres et des chiffres');
        }

        if (formData.password !== confirmPassword) {
          errors.push('Les mots de passe ne correspondent pas');
        }

        if (!formData.gender) {
          errors.push('Le genre est obligatoire');
        }
        break;

      case 2:
        if (!formData.phone) {
          errors.push('Le téléphone est obligatoire');
        }
        if (formData.phone && !/^(\+225)?[0-9\s-]{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
          errors.push('Format de téléphone invalide (format ivoirien attendu : +225 XX XX XX XX XX)');
        }
        if (phoneAvailability === 'taken') {
          errors.push('Ce numéro de téléphone est déjà utilisé par un autre compte');
        }

        if (!formData.dateOfBirth) {
          errors.push('La date de naissance est obligatoire');
        }
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 1 || age > 120) {
            errors.push('L\'âge doit être compris entre 1 et 120 ans');
          }
        }

        if (!formData.address || formData.address.length < 5) {
          errors.push('L\'adresse doit contenir au moins 5 caractères');
        }

        if (!formData.city || formData.city.length < 2) {
          errors.push('La ville doit contenir au moins 2 caractères');
        }

        if (formData.emergencyContact && formData.emergencyContact.trim() !== '' && formData.emergencyContact.length < 2) {
          errors.push('Le nom du contact d\'urgence doit contenir au moins 2 caractères');
        }
        if (formData.emergencyContactPhone && formData.emergencyContactPhone.trim() !== '' && !/^(\+225)?[0-9\s-]{8,15}$/.test(formData.emergencyContactPhone.replace(/\s/g, ''))) {
          errors.push('Format de téléphone du contact d\'urgence invalide');
        }
        break;

      case 3:
        if (!acceptTerms) {
          errors.push('Vous devez accepter les conditions d\'utilisation');
        }

        if (formData.allergies && formData.allergies.length > 500) {
          errors.push('Les allergies ne peuvent pas dépasser 500 caractères');
        }
        if (formData.chronicConditions && formData.chronicConditions.length > 500) {
          errors.push('Les conditions chroniques ne peuvent pas dépasser 500 caractères');
        }
        if (formData.currentMedications && formData.currentMedications.length > 500) {
          errors.push('Les médicaments actuels ne peuvent pas dépasser 500 caractères');
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

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const step1Validation = await validateStepWithBackend(1);
    const step2Validation = await validateStepWithBackend(2);
    const step3Validation = await validateStepWithBackend(3);

    const allErrors = [
      ...step1Validation.errors,
      ...step2Validation.errors,
      ...step3Validation.errors
    ];

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    const cleanedFormData = {
      ...formData,
      bloodType: formData.bloodType?.trim() || undefined,
      allergies: formData.allergies?.trim() || undefined,
      chronicConditions: formData.chronicConditions?.trim() || undefined,
      currentMedications: formData.currentMedications?.trim() || undefined,
      emergencyContact: formData.emergencyContact?.trim() || undefined,
      emergencyContactPhone: formData.emergencyContactPhone?.trim() || undefined,
    };

    try {
      await register(cleanedFormData);
    } catch (error) {
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-600 text-xs md:text-sm">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-3 md:py-6 px-3 md:px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header avec logo */}
        <div className="text-center mb-4 md:mb-6">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-16 md:h-24 lg:h-28 w-auto mx-auto mb-3 md:mb-4 drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-primary-800 mb-1 md:mb-2">
            Créer un compte patient
          </h2>
          <p className="text-primary-600 text-xs md:text-base">
            Rejoignez OSIRIX pour un suivi médical personnalisé
          </p>
        </div>

        {/* Indicateur de progression - CORRIGÉ */}
        <div className="mb-4 md:mb-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-3 md:mb-4 min-w-max px-1">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-neutral-400'}`}>
              <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-base ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-neutral-300'} shadow-lg flex-shrink-0`}>
                1
              </div>
              <span className="ml-1 md:ml-3 text-[8px] md:text-sm font-semibold whitespace-nowrap">Info. perso.</span>
            </div>
            <div className="flex-1 h-1 md:h-2 mx-1 md:mx-4 bg-neutral-200 rounded-full min-w-[20px]">
              <div className={`h-full bg-primary-500 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-neutral-400'}`}>
              <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-base ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-neutral-300'} shadow-lg flex-shrink-0`}>
                2
              </div>
              <span className="ml-1 md:ml-3 text-[8px] md:text-sm font-semibold whitespace-nowrap">Contact</span>
            </div>
            <div className="flex-1 h-1 md:h-2 mx-1 md:mx-4 bg-neutral-200 rounded-full min-w-[20px]">
              <div className={`h-full bg-primary-500 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary-600' : 'text-neutral-400'}`}>
              <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-base ${currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-neutral-300'} shadow-lg flex-shrink-0`}>
                3
              </div>
              <span className="ml-1 md:ml-3 text-[8px] md:text-sm font-semibold whitespace-nowrap">Validation</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-2xl border border-primary-100 p-4 md:p-6 lg:p-8">

          {/* Messages d'erreur */}
          {(error || validationErrors.length > 0) && (
            <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  {error && <p className="text-red-700 text-[10px] md:text-xs font-semibold mb-1 md:mb-2">{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="text-red-700 text-[10px] md:text-xs space-y-0.5 md:space-y-1">
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

            {/* Étape 1 : Informations personnelles - CORRIGÉ AVEC 2 COLONNES */}
            {currentStep === 1 && (
              <div className="space-y-3 md:space-y-5">
                <h3 className="text-base md:text-xl lg:text-2xl font-bold text-primary-800 mb-3 md:mb-4 text-center">
                  Informations personnelles
                </h3>

                {/* Prénom et Nom - 2 COLONNES SUR MOBILE */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                      placeholder="Prénom"
                    />
                    <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Min. 2 car.</p>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                      placeholder="Nom"
                    />
                    <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Min. 2 car.</p>
                  </div>
                </div>

                {/* Email - PLEINE LARGEUR */}
                <div>
                  <label htmlFor="email" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
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
                      className={`w-full px-2 py-1.5 md:px-3 md:py-2.5 pr-10 md:pr-12 border-2 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white text-[11px] md:text-sm ${
                        emailAvailability === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : emailAvailability === 'available'
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'border-primary-200 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="email@exemple.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 md:pr-3 flex items-center">
                      {emailAvailability === 'checking' && (
                        <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {emailAvailability === 'available' && (
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {emailAvailability === 'taken' && (
                        <svg className="h-4 w-4 md:h-5 md:w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailAvailability === 'available' && (
                    <p className="text-[9px] md:text-xs text-green-600 mt-0.5 md:mt-1 flex items-center">
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Disponible
                    </p>
                  )}
                  {emailAvailability === 'taken' && (
                    <p className="text-[9px] md:text-xs text-red-600 mt-0.5 md:mt-1 flex items-center">
                      <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Déjà utilisé
                    </p>
                  )}
                </div>

                {/* Mot de passe et Confirmation - 2 COLONNES SUR MOBILE */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label htmlFor="password" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
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
                        className="w-full px-2 py-1.5 md:px-3 md:py-2.5 pr-8 md:pr-10 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-1.5 md:pr-2 flex items-center text-primary-500 hover:text-primary-700 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Min. 3 car.</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                      Confirmer *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                      placeholder="••••••"
                    />
                  </div>
                </div>

                {/* Genre - 3 COLONNES (DÉJÀ BON) */}
                <div>
                  <label className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-2 md:mb-3">
                    Genre *
                  </label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {/* Option Homme */}
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
                        className={`
                          cursor-pointer block w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 text-center font-semibold transition-all duration-200 
                          ${formData.gender === 'male'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg transform scale-105'
                            : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300 hover:bg-primary-25'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-[10px] md:text-xs">Homme</span>
                        </div>
                        {formData.gender === 'male' && (
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-primary-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Option Femme */}
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
                        className={`
                          cursor-pointer block w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 text-center font-semibold transition-all duration-200 
                          ${formData.gender === 'female'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg transform scale-105'
                            : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300 hover:bg-primary-25'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-[10px] md:text-xs">Femme</span>
                        </div>
                        {formData.gender === 'female' && (
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-primary-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Option Autre */}
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
                        className={`
                          cursor-pointer block w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 text-center font-semibold transition-all duration-200 
                          ${formData.gender === 'other'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg transform scale-105'
                            : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300 hover:bg-primary-25'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[10px] md:text-xs">Autre</span>
                        </div>
                        {formData.gender === 'other' && (
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-5 md:h-5 bg-primary-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Contact & Adresse - CORRIGÉ AVEC 2 COLONNES */}
            {currentStep === 2 && (
              <div className="space-y-3 md:space-y-5">
                <h3 className="text-base md:text-xl lg:text-2xl font-bold text-primary-800 mb-3 md:mb-4 text-center">
                  Contact & Adresse
                </h3>

                {/* Téléphone - PLEINE LARGEUR SUR MOBILE */}
                <div>
                  <label htmlFor="phone" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Téléphone *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                    placeholder="+225 01 23 45 67 89"
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Format CI : +225 XX XX XX XX XX</p>
                </div>

                {/* Date de naissance - PLEINE LARGEUR SUR MOBILE POUR ÉVITER LE DÉBORDEMENT */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Date de naissance *
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Âge : 1 à 120 ans</p>
                </div>

                {/* Adresse - PLEINE LARGEUR */}
                <div>
                  <label htmlFor="address" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Adresse complète *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                    placeholder="Votre adresse"
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">Min. 5 car.</p>
                </div>

                {/* Ville - PLEINE LARGEUR */}
                <div>
                  <label htmlFor="city" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Ville *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                    placeholder="Votre ville"
                  />
                </div>

                {/* Contact d'urgence - 2 COLONNES SUR MOBILE */}
                <div className="border-t border-primary-200 pt-3 md:pt-4">
                  <h4 className="text-xs md:text-base font-bold text-primary-700 mb-2 md:mb-3">
                    Contact d'urgence (optionnel)
                  </h4>

                  <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <div>
                      <label htmlFor="emergencyContact" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                        Nom contact
                      </label>
                      <input
                        id="emergencyContact"
                        name="emergencyContact"
                        type="text"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                        placeholder="Nom"
                      />
                    </div>

                    <div>
                      <label htmlFor="emergencyContactPhone" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                        Tél. contact
                      </label>
                      <input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                        placeholder="+225..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Informations médicales */}
            {currentStep === 3 && (
              <div className="space-y-3 md:space-y-5">
                <h3 className="text-base md:text-xl lg:text-2xl font-bold text-primary-800 mb-3 md:mb-4 text-center">
                  Informations médicales (optionnelles)
                </h3>

                <div>
                  <label htmlFor="bloodType" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Groupe sanguin
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white text-[11px] md:text-sm"
                  >
                    <option value="">Non renseigné</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Allergies connues
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={2}
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none text-[11px] md:text-sm"
                    placeholder="Vos allergies..."
                    maxLength={500}
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">
                    Max. 500 car.
                  </p>
                </div>

                <div>
                  <label htmlFor="chronicConditions" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Conditions chroniques
                  </label>
                  <textarea
                    id="chronicConditions"
                    name="chronicConditions"
                    rows={2}
                    value={formData.chronicConditions}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none text-[11px] md:text-sm"
                    placeholder="Vos conditions..."
                    maxLength={500}
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">
                    Max. 500 car.
                  </p>
                </div>

                <div>
                  <label htmlFor="currentMedications" className="block text-[10px] md:text-xs font-semibold text-primary-700 mb-1 md:mb-2">
                    Médicaments actuels
                  </label>
                  <textarea
                    id="currentMedications"
                    name="currentMedications"
                    rows={2}
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 md:px-3 md:py-2.5 border-2 border-primary-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white resize-none text-[11px] md:text-sm"
                    placeholder="Vos médicaments..."
                    maxLength={500}
                  />
                  <p className="text-[9px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">
                    Max. 500 car.
                  </p>
                </div>

                {/* Conditions d'utilisation */}
                <div className="border-t border-primary-200 pt-3 md:pt-4">
                  <div className="bg-primary-50 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-primary-200 mb-2.5 md:mb-3">
                    <div className="flex items-center space-x-1.5 md:space-x-2 mb-1.5 md:mb-2">
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-primary-700 font-semibold text-[10px] md:text-xs">Sécurité & Confidentialité</span>
                    </div>
                    <p className="text-primary-600 text-[9px] md:text-xs">
                      Vos données sont protégées. Nous respectons votre vie privée.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2 md:space-x-3">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 md:mt-1 h-3.5 w-3.5 md:h-4 md:w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded flex-shrink-0"
                    />
                    <label htmlFor="acceptTerms" className="text-[10px] md:text-xs text-primary-700 font-medium">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-bold underline">
                        conditions
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-bold underline">
                        politique de confidentialité
                      </Link>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between items-center mt-6 md:mt-8 pt-3 md:pt-4 border-t border-primary-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-white border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg text-[11px] md:text-sm"
                  >
                    Précédent
                  </button>
                )}
              </div>

              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-[11px] md:text-sm"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none text-[11px] md:text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </>
                    ) : (
                      'Créer compte'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-4 md:mt-6 text-center border-t border-primary-200 pt-4 md:pt-6">
            <p className="text-primary-600 text-xs md:text-base">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-primary-700 hover:text-primary-600 font-bold underline transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Bouton retour à l'accueil */}
        <div className="mt-4 md:mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 md:space-x-2 bg-white hover:bg-primary-50 text-primary-700 hover:text-primary-600 font-bold py-2 md:py-2.5 px-4 md:px-5 rounded-lg md:rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-[11px] md:text-sm"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour</span>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="w-full py-3 md:py-4 mt-4 md:mt-6">
          <div className="max-w-2xl mx-auto px-3 md:px-4">
            <p className="text-center text-[10px] md:text-xs text-neutral-600">
              © 2025 OSIRIX Clinique Médical. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}