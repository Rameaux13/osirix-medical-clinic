'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentUser, useAuthStore } from '@/store/auth';
import profilService from '../../services/profilService';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../../services/profilService';

// Icônes SVG (même style que DashboardPatient)
const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Key = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2h.01M9 9h.01M9 21v-3.6a2 2 0 01.973-1.716l.027-.016m0 0A3 3 0 0012 9a3 3 0 002.236 2.894l.027.016M9 21h6m-6 0H6a1 1 0 01-1-1V9a1 1 0 011-1h1m12 12a1 1 0 01-1 1h-1m1-1V9a1 1 0 00-1-1h-1m-6 0V6a2 2 0 112 4h.01M9 9V6a2 2 0 012-2 2 2 0 012 2v3.01" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

export default function MonProfil() {
  const { user: authUser } = useCurrentUser();

  // États du composant
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour les formulaires
  const [profileForm, setProfileForm] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
  });

  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // États pour l'affichage des mots de passe
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Chargement du profil au montage
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fonction de chargement du profil
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await profilService.getProfile();
      setUserProfile(profile);

      // Préremplir le formulaire
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: profilService.formatDateForInput(profile.dateOfBirth),
      });

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validation en temps réel
  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };

    switch (field) {
      case 'firstName':
      case 'lastName':
        if (value && value.length < 2) {
          errors[field] = `Le ${field === 'firstName' ? 'prénom' : 'nom'} doit contenir au moins 2 caractères`;
        } else if (value && !/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          errors[field] = 'Seules les lettres, espaces, tirets et apostrophes sont autorisés';
        } else {
          delete errors[field];
        }
        break;

      case 'phone':
        if (value && !profilService.validatePhoneCI(value)) {
          errors[field] = 'Format de téléphone invalide (format ivoirien attendu)';
        } else {
          delete errors[field];
        }
        break;

      case 'newPassword':
        if (value && value.length < 3) {
          errors[field] = 'Le mot de passe doit contenir au moins 3 caractères';
        } else if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
          errors[field] = 'Le mot de passe ne peut contenir que des lettres et des chiffres';
        } else {
          delete errors[field];
        }
        break;

      case 'confirmPassword':
        if (value && value !== passwordForm.newPassword) {
          errors[field] = 'Les mots de passe ne correspondent pas';
        } else {
          delete errors[field];
        }
        break;
    }

    setValidationErrors(errors);
  };

  // Gestion des changements dans le formulaire profil
  const handleProfileChange = (field: keyof UpdateProfileRequest, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Gestion des changements dans le formulaire mot de passe
  const handlePasswordChange = (field: keyof ChangePasswordRequest, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Soumission du formulaire profil
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(validationErrors).length > 0) {
      setError('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Mettre à jour le profil via API
      const updatedProfile = await profilService.updateProfile(profileForm);

      // Forcer la mise à jour du store d'authentification
      const { updateUser } = useAuthStore.getState();
      updateUser({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        dateOfBirth: updatedProfile.dateOfBirth
      });

      // Message de succès
      setSuccessMessage('Profil mis à jour avec succès !');

      // Mettre à jour aussi le profil local pour l'affichage immédiat
      setUserProfile(updatedProfile);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Soumission du formulaire mot de passe
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Tous les champs de mot de passe sont obligatoires');
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setError('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    try {
      setChangingPassword(true);
      setError(null);
      setSuccessMessage(null);

      await profilService.changePassword(passwordForm);

      // Réinitialiser le formulaire
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSuccessMessage('Mot de passe modifié avec succès');
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error: any) {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setChangingPassword(false);
    }
  };

  // Fonction pour supprimer les messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Rendu conditionnel pendant le chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages de feedback */}
      {(error || successMessage) && (
        <div className={`p-4 rounded-lg border flex items-start justify-between ${error
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-green-50 border-green-200 text-green-800'
          }`}>
          <div className="flex items-center">
            {error ? (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <p className="font-medium">{error || successMessage}</p>
          </div>
          <button
            onClick={clearMessages}
            className="text-current hover:bg-black/5 rounded p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Section Informations Personnelles */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-[#006D65] rounded-full flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mon Profil Patient</h2>
            <p className="text-sm text-gray-600">Gérez vos informations personnelles</p>
          </div>
        </div>

        <form onSubmit={handleSubmitProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Prénom */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                value={profileForm.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Votre prénom"
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                value={profileForm.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Votre nom"
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={profileForm.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="+225 01 23 45 67 89"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            {/* Date de naissance */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={profileForm.dateOfBirth}
                onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base"
              />
            </div>

            {/* Email (non modifiable) */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (non modifiable pour sécurité)
              </label>
              <input
                type="email"
                id="email"
                value={userProfile?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-base"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setProfileForm({
                  firstName: userProfile?.firstName || '',
                  lastName: userProfile?.lastName || '',
                  phone: userProfile?.phone || '',
                  dateOfBirth: profilService.formatDateForInput(userProfile?.dateOfBirth),
                });
                setValidationErrors({});
                clearMessages();
              }}

              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || Object.keys(validationErrors).length > 0}

              className="px-4 py-2 bg-[#006D65] text-white rounded-lg hover:bg-[#005a54] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"

            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder les modifications'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section Changement de Mot de Passe */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Changer mon mot de passe</h3>
          <p className="text-sm text-gray-600">Minimum 3 caractères, lettres et chiffres seulement</p>
        </div>

        <form onSubmit={handleSubmitPassword}>
          <div className="space-y-6">
            {/* Ancien mot de passe */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  id="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base pr-12"
                  placeholder="Votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base pr-12 ${validationErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Minimum 3 caractères (lettres et chiffres)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#006D65] focus:border-transparent transition-colors text-base pr-12 ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setPasswordForm({
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setValidationErrors({});
                clearMessages();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-base"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={changingPassword || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || Object.keys(validationErrors).length > 0}
              className="px-4 py-2 bg-[#E6A930] text-white rounded-lg hover:bg-[#d49821] transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {changingPassword ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Modification...
                </>
              ) : (
                'Changer le mot de passe'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}