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
      <div className="min-h-screen bg-primary-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header avec logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-28 w-auto mx-auto mb-6 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-4xl font-bold text-primary-500 mb-3">
            Créer un compte patient
          </h2>
          <p className="text-neutral-600 text-lg font-medium">
            Rejoignez OSIRIX pour un suivi médical personnalisé
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-primary-500' : 'text-neutral-400'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${currentStep >= 1 ? 'bg-primary-500 text-white shadow-lg' : 'bg-neutral-300'} transition-all duration-300`}>
                1
              </div>
              <span className="text-base font-bold hidden sm:block">Informations</span>
            </div>
            <div className="flex-1 h-2 max-w-[120px] bg-neutral-200 rounded-full overflow-hidden">
              <div className={`h-full bg-primary-500 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-primary-500' : 'text-neutral-400'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${currentStep >= 2 ? 'bg-primary-500 text-white shadow-lg' : 'bg-neutral-300'} transition-all duration-300`}>
                2
              </div>
              <span className="text-base font-bold hidden sm:block">Sécurité</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-primary-100 p-8 lg:p-10">

          {/* Messages d'erreur */}
          {(error || validationErrors.length > 0) && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  {error && <p className="text-red-700 text-sm font-bold mb-2">{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="text-red-700 text-sm space-y-1 font-medium">
                      {validationErrors.map((err, index) => (
                        <li key={index}>• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Étape 1 : Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-primary-500 mb-6 text-center">
                  Vos informations
                </h3>

                {/* Prénom et Nom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-neutral-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                      placeholder="Votre prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-neutral-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* Date de naissance */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-bold text-neutral-700 mb-2">
                    Date de naissance <span className="text-neutral-500 text-xs">(optionnel)</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-neutral-700 mb-2">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:outline-none focus:ring-3 transition-all text-base font-medium ${
                        phoneAvailability === 'taken'
                          ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                          : phoneAvailability === 'available'
                            ? 'border-green-400 focus:ring-green-500/30 focus:border-green-500'
                            : 'border-neutral-300 focus:ring-primary-500/30 focus:border-primary-500'
                      }`}
                      placeholder="+225 XX XX XX XX XX"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {phoneAvailability === 'checking' && (
                        <svg className="animate-spin h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {phoneAvailability === 'available' && (
                        <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {phoneAvailability === 'taken' && (
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {phoneAvailability === 'available' && (
                    <p className="text-xs text-green-600 mt-1.5 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Numéro disponible
                    </p>
                  )}
                  {phoneAvailability === 'taken' && (
                    <p className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Numéro déjà utilisé
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-neutral-700 mb-2">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:outline-none focus:ring-3 transition-all text-base font-medium ${
                        emailAvailability === 'taken'
                          ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500'
                          : emailAvailability === 'available'
                            ? 'border-green-400 focus:ring-green-500/30 focus:border-green-500'
                            : 'border-neutral-300 focus:ring-primary-500/30 focus:border-primary-500'
                      }`}
                      placeholder="email@exemple.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {emailAvailability === 'checking' && (
                        <svg className="animate-spin h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {emailAvailability === 'available' && (
                        <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {emailAvailability === 'taken' && (
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailAvailability === 'available' && (
                    <p className="text-xs text-green-600 mt-1.5 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email disponible
                    </p>
                  )}
                  {emailAvailability === 'taken' && (
                    <p className="text-xs text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Email déjà utilisé
                    </p>
                  )}
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-3">
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Homme */}
                    <div className="relative">
                      <input
                        id="gender-male"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="gender-male"
                        className="cursor-pointer block w-full p-4 rounded-xl border-3 text-center font-bold transition-all duration-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 peer-checked:shadow-xl peer-checked:scale-105 border-neutral-300 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-25"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">Homme</span>
                        </div>
                      </label>
                    </div>

                    {/* Femme */}
                    <div className="relative">
                      <input
                        id="gender-female"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="gender-female"
                        className="cursor-pointer block w-full p-4 rounded-xl border-3 text-center font-bold transition-all duration-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 peer-checked:shadow-xl peer-checked:scale-105 border-neutral-300 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-25"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">Femme</span>
                        </div>
                      </label>
                    </div>

                    {/* Autre */}
                    <div className="relative">
                      <input
                        id="gender-other"
                        name="gender"
                        type="radio"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor="gender-other"
                        className="cursor-pointer block w-full p-4 rounded-xl border-3 text-center font-bold transition-all duration-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-600 peer-checked:shadow-xl peer-checked:scale-105 border-neutral-300 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-25"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Autre</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Sécurité */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-primary-500 mb-6 text-center">
                  Sécurité
                </h3>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-neutral-700 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 pr-12 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-primary-500 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5 font-medium">Minimum 3 caractères</p>
                </div>

                {/* Vérification mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-neutral-700 mb-2">
                    Vérification du mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                    placeholder="••••••"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label htmlFor="city" className="block text-sm font-bold text-neutral-700 mb-2">
                    Ville <span className="text-neutral-500 text-xs">(optionnel)</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-neutral-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-base font-medium"
                    placeholder="Votre ville"
                  />
                </div>

                {/* Conditions d'utilisation */}
                <div className="border-t-2 border-neutral-200 pt-6 mt-6">
                  <div className="bg-primary-50 p-5 rounded-xl border-2 border-primary-200 mb-5">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-primary-700 font-bold text-base">Sécurité & Confidentialité</span>
                    </div>
                    <p className="text-neutral-600 text-sm font-medium">
                      Vos données sont protégées et sécurisées. Nous respectons votre vie privée.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded cursor-pointer"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-neutral-700 font-medium cursor-pointer">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-bold underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-bold underline">
                        politique de confidentialité
                      </Link>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between items-center mt-10 pt-8 border-t-2 border-neutral-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-white border-3 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-base"
                  >
                    ← Précédent
                  </button>
                )}
              </div>

              <div>
                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 text-base"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-base"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-8 text-center border-t-2 border-neutral-200 pt-6">
            <p className="text-neutral-600 text-base font-medium">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-bold underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Bouton retour à l'accueil */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 font-bold py-3.5 px-6 rounded-xl border-3 border-neutral-300 hover:border-neutral-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="w-full py-6 mt-8">
          <p className="text-center text-sm text-neutral-600 font-medium">
            © 2025 OSIRIX Clinique Médical. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}