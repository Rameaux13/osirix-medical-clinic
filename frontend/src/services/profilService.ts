import { apiClient } from '../lib/api';

// =====================================================
// 🔸 INTERFACES TYPESCRIPT
// =====================================================

/**
 * Interface pour la mise à jour du profil
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string; // Format: YYYY-MM-DD
}

/**
 * Interface pour le changement de mot de passe
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interface pour les données du profil utilisateur
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface pour les réponses API
 */
interface ApiResponse<T> {
  message: string;
  user?: T;
}

// =====================================================
// 🔸 SERVICE PROFIL
// =====================================================

class ProfilService {
  
  /**
   * Récupérer le profil du patient connecté
   * Route : GET /users/profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>('/users/profile');
      
      if (!response.data.user) {
        throw new Error('Profil utilisateur non trouvé');
      }

      return response.data.user;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la récupération du profil'
      );
    }
  }

  /**
   * Mettre à jour le profil du patient connecté
   * Route : PATCH /users/profile
   * Champs modifiables : firstName, lastName, phone, dateOfBirth
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    try {
      // Filtrer les champs vides ou undefined
      const filteredData: UpdateProfileRequest = {};
      
      if (profileData.firstName?.trim()) {
        filteredData.firstName = profileData.firstName.trim();
      }
      
      if (profileData.lastName?.trim()) {
        filteredData.lastName = profileData.lastName.trim();
      }
      
      if (profileData.phone?.trim()) {
        filteredData.phone = profileData.phone.trim();
      } else if (profileData.phone === '') {
        filteredData.phone = ''; // Permet de vider le téléphone
      }
      
      if (profileData.dateOfBirth) {
        filteredData.dateOfBirth = profileData.dateOfBirth;
      }

      // Vérifier qu'au moins un champ est fourni
      if (Object.keys(filteredData).length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      const response = await apiClient.patch<ApiResponse<UserProfile>>(
        '/users/profile', 
        filteredData
      );

      if (!response.data.user) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      return response.data.user;
      
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Erreur lors de la mise à jour du profil'
      );
    }
  }

  /**
   * Changer le mot de passe du patient connecté
   * Route : PATCH /users/change-password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    try {
      // Validation côté client
      if (!passwordData.oldPassword) {
        throw new Error('L\'ancien mot de passe est obligatoire');
      }

      if (!passwordData.newPassword) {
        throw new Error('Le nouveau mot de passe est obligatoire');
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Les nouveaux mots de passe ne correspondent pas');
      }

      // Validation simplifiée - 3 caractères minimum
      if (passwordData.newPassword.length < 3) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 3 caractères');
      }

      // Validation alphanumérique simple
      const simplePasswordRegex = /^[a-zA-Z0-9]+$/;
      if (!simplePasswordRegex.test(passwordData.newPassword)) {
        throw new Error('Le nouveau mot de passe ne peut contenir que des lettres et des chiffres');
      }

      if (passwordData.oldPassword === passwordData.newPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }

      await apiClient.patch('/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message ||
        'Erreur lors du changement de mot de passe'
      );
    }
  }

  // =====================================================
  // 🔸 MÉTHODES UTILITAIRES
  // =====================================================

  /**
   * Valider un email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valider un téléphone ivoirien
   */
  validatePhoneCI(phone: string): boolean {
    const phoneRegex = /^(\+225)?(0?[0-9]){8,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Formatter une date pour l'affichage
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Formatter une date pour l'input HTML (YYYY-MM-DD)
   */
  formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
}

// Export d'une instance
export default new ProfilService();