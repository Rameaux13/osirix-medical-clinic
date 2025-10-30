'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { RegisterRequest } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated, userType, clearError } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

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

  // Initialiser le dark mode depuis localStorage
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

  // Toggle dark mode
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
    <div className="min-h-screen bg-theme-primary theme-transition py-4 sm:py-6 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">

        {/* Dark Mode Toggle - Position fixe en haut à droite */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-theme-card hover:bg-theme-hover shadow-theme-lg theme-transition border border-theme"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-secondary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Header avec logo - LOGO ENCORE PLUS RÉDUIT */}
        <div className="text-center mb-4 sm:mb-6">
          <Link href="/" className="inline-block group">
            <img
              src="/logo.jpg"
              alt="OSIRIX Clinique Médical"
              className="h-5 sm:h-16 w-auto mx-auto mb-2 sm:mb-3 drop-shadow-xl group-hover:scale-105 transition-transform duration-300 rounded-lg"
            />
          </Link>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary theme-transition mb-2">
            Créer un compte patient
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-theme-secondary theme-transition">
            Rejoignez OSIRIX pour un suivi médical personnalisé
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-500' : 'text-theme-tertiary theme-transition'}`}>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-theme-tertiary theme-transition'} shadow-lg theme-transition`}>
                <span className="text-xs sm:text-sm font-bold">1</span>
              </div>
              <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap">Informations</span>
            </div>
            <div className="flex-1 h-1 sm:h-1.5 mx-2 sm:mx-3 bg-theme-tertiary rounded-full theme-transition max-w-[80px] sm:max-w-[120px]">
              <div className={`h-full bg-primary-500 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-500' : 'text-theme-tertiary theme-transition'}`}>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-theme-tertiary theme-transition'} shadow-lg theme-transition`}>
                <span className="text-xs sm:text-sm font-bold">2</span>
              </div>
              <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs font-semibold whitespace-nowrap">Sécurité</span>
            </div>
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-theme-card rounded-xl sm:rounded-2xl shadow-theme-xl border border-theme p-4 sm:p-6 md:p-8 theme-transition">

          {/* Messages d'erreur */}
          {(error || validationErrors.length > 0) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 rounded-r-lg theme-transition">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  {error && <p className="text-red-700 dark:text-red-300 text-sm font-semibold mb-2">{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
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
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-theme-primary theme-transition mb-3 sm:mb-4 text-center">
                  Vos informations
                </h3>

                {/* Prénom et Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                      placeholder="Prénom"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                {/* Date de naissance (optionnel) - SELECT OPTIMISÉ */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
                    Date de naissance (optionnel)
                  </label>
                  <div className="relative">
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="input-theme w-full px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-sm border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition appearance-none"
                      style={{ fontSize: '11px' }}
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
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
                      className={`input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all theme-transition ${
                        phoneAvailability === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : phoneAvailability === 'available'
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="+225 XX XX XX XX XX"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {phoneAvailability === 'checking' && (
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {phoneAvailability === 'available' && (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {phoneAvailability === 'taken' && (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {phoneAvailability === 'available' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Disponible</p>
                  )}
                  {phoneAvailability === 'taken' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">✗ Déjà utilisé</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
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
                      className={`input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all theme-transition ${
                        emailAvailability === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : emailAvailability === 'available'
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="email@exemple.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailAvailability === 'checking' && (
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {emailAvailability === 'available' && (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {emailAvailability === 'taken' && (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {emailAvailability === 'available' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Disponible</p>
                  )}
                  {emailAvailability === 'taken' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">✗ Déjà utilisé</p>
                  )}
                </div>

                {/* Genre - RESPONSIVE */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-2 sm:mb-3">
                    Genre *
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                        className={`cursor-pointer block w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-center font-semibold transition-all theme-transition ${formData.gender === 'male'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-lg scale-105'
                          : 'border-theme bg-theme-card text-theme-primary hover:border-primary-500'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm sm:text-base">Homme</span>
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
                        className={`cursor-pointer block w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-center font-semibold transition-all theme-transition ${formData.gender === 'female'
                          ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-lg scale-105'
                          : 'border-theme bg-theme-card text-theme-primary hover:border-primary-500'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm sm:text-base">Femme</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2 : Sécurité */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-5">
                <h3 className="text-xl sm:text-2xl font-bold text-theme-primary theme-transition mb-3 sm:mb-4 text-center">
                  Sécurité
                </h3>

                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
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
                      className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-tertiary hover:text-theme-primary theme-transition"
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
                  <p className="text-xs text-theme-tertiary theme-transition mt-1">Minimum 3 caractères</p>
                </div>

                {/* Vérification mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
                    Vérification du mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                    placeholder="••••••"
                  />
                </div>

                {/* Ville (optionnel) */}
                <div>
                  <label htmlFor="city" className="block text-xs sm:text-sm font-semibold text-theme-primary theme-transition mb-1.5 sm:mb-2">
                    Ville (optionnel)
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-theme w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all theme-transition"
                    placeholder="Votre ville"
                  />
                </div>

                {/* Conditions d'utilisation */}
                <div className="border-t border-theme pt-3 sm:pt-4 theme-transition">
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-primary-100 dark:border-primary-800 mb-3 sm:mb-4 theme-transition">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs sm:text-sm">Sécurité & Confidentialité</span>
                    </div>
                    <p className="text-theme-secondary text-xs theme-transition">
                      Vos données sont protégées. Nous respectons votre vie privée.
                    </p>
                  </div>

                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <input
                      id="acceptTerms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-theme rounded theme-transition flex-shrink-0"
                    />
                    <label htmlFor="acceptTerms" className="text-xs sm:text-sm text-theme-primary theme-transition">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-primary-500 hover:text-primary-600 font-bold underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link href="/privacy" className="text-primary-500 hover:text-primary-600 font-bold underline">
                        politique de confidentialité
                      </Link>.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation - RESPONSIVE */}
            <div className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-theme theme-transition">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="bg-theme-card border-2 border-theme text-theme-primary hover:bg-theme-hover px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-bold transition-all shadow-theme-md hover:shadow-theme-lg theme-transition"
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
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading || !acceptTerms}
                    className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm sm:text-base">Création...</span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-base">Créer mon compte</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Lien vers connexion */}
          <div className="mt-4 sm:mt-6 text-center border-t border-theme pt-4 sm:pt-6 theme-transition">
            <p className="text-sm sm:text-base text-theme-secondary theme-transition">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-primary-500 hover:text-primary-600 font-bold underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Bouton retour à l'accueil - RESPONSIVE */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-theme-card hover:bg-theme-hover text-theme-primary font-bold py-2.5 sm:py-3 px-4 sm:px-5 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-theme hover:border-theme-dark transition-all shadow-theme-md hover:shadow-theme-lg transform hover:scale-105 theme-transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="w-full py-3 sm:py-4 mt-4 sm:mt-6">
          <p className="text-center text-xs text-theme-tertiary theme-transition">
            © 2025 OSIRIX Clinique Médical. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}