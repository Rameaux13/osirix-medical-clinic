// src/store/auth.ts - Store Zustand pour l'authentification

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginRequest, RegisterRequest, User, Doctor, Admin, AuthResponse } from '@/types/auth';
import { authApi, handleApiError } from '@/lib/api';

// Étendre l'interface AuthState pour inclure updateUser
interface ExtendedAuthState extends AuthState {
  updateUser: (updatedUserData: Partial<User | Doctor | Admin>) => void;
}

export const useAuthStore = create<ExtendedAuthState>()(
  persist(
    (set, get) => ({
      // État initial
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      user: null,
      doctor: null,
      admin: null,
      userType: null,

      // Action de connexion
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);

          if (!response.token) {
            throw new Error('Token non reçu du serveur');
          }

          // Sauvegarder le token dans localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('osirix-token', response.token);
            localStorage.setItem('osirix-user', JSON.stringify({
              user: response.user,
              doctor: response.doctor,
              admin: response.admin,
              userType: response.userType,
            }));
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            token: response.token,
            user: response.user || null,
            doctor: response.doctor || null,
            admin: response.admin || null,
            userType: response.userType,
            error: null,
          });

          return response;

        } catch (error) {
          set({
            isLoading: false,
            error: handleApiError(error),
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Action d'inscription
      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(userData);

          if (!response.token) {
            throw new Error('Token non reçu du serveur');
          }

          // Sauvegarder le token dans localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('osirix-token', response.token);
            localStorage.setItem('osirix-user', JSON.stringify({
              user: response.user,
              doctor: response.doctor,
              admin: response.admin,
              userType: response.userType,
            }));
          }

          set({
            isAuthenticated: true,
            isLoading: false,
            token: response.token,
            user: response.user || null,
            doctor: response.doctor || null,
            admin: response.admin || null,
            userType: response.userType,
            error: null,
          });

          return response;

        } catch (error) {
          set({
            isLoading: false,
            error: handleApiError(error),
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Action de déconnexion
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('osirix-token');
          localStorage.removeItem('osirix-user');
        }

        set({
          isAuthenticated: false,
          token: null,
          user: null,
          doctor: null,
          admin: null,
          userType: null,
          error: null,
          isLoading: false,
        });
      },

      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },

      // ✅ NOUVEAU : Mettre à jour les informations de l'utilisateur
      updateUser: (updatedUserData: Partial<User | Doctor | Admin>) => {
        const state = get();
        console.log('🔄 [AUTH STORE] Mise à jour utilisateur demandée:', updatedUserData);

        // Mettre à jour selon le type d'utilisateur
        if (state.userType === 'patient' && state.user) {
          const updatedUser = { ...state.user, ...updatedUserData };
          console.log('🔄 [AUTH STORE] Ancien utilisateur:', state.user);
          console.log('🔄 [AUTH STORE] Nouvel utilisateur:', updatedUser);

          set({ user: updatedUser });

          // Aussi mettre à jour le localStorage
          if (typeof window !== 'undefined') {
            const currentStorage = localStorage.getItem('osirix-user');
            if (currentStorage) {
              try {
                const parsedStorage = JSON.parse(currentStorage);
                parsedStorage.user = updatedUser;
                localStorage.setItem('osirix-user', JSON.stringify(parsedStorage));
                console.log('✅ [AUTH STORE] localStorage mis à jour');
              } catch (error) {
                console.error('❌ [AUTH STORE] Erreur mise à jour localStorage:', error);
              }
            }
          }

          console.log('✅ [AUTH STORE] Store utilisateur mis à jour avec succès');
        } else if (state.userType === 'doctor' && state.doctor) {
          const updatedDoctor = { ...state.doctor, ...updatedUserData };
          set({ doctor: updatedDoctor });

          if (typeof window !== 'undefined') {
            const currentStorage = localStorage.getItem('osirix-user');
            if (currentStorage) {
              try {
                const parsedStorage = JSON.parse(currentStorage);
                parsedStorage.doctor = updatedDoctor;
                localStorage.setItem('osirix-user', JSON.stringify(parsedStorage));
              } catch (error) {
                console.error('❌ [AUTH STORE] Erreur mise à jour localStorage:', error);
              }
            }
          }
        } else if (state.userType === 'admin' && state.admin) {
          const updatedAdmin = { ...state.admin, ...updatedUserData };
          set({ admin: updatedAdmin });

          if (typeof window !== 'undefined') {
            const currentStorage = localStorage.getItem('osirix-user');
            if (currentStorage) {
              try {
                const parsedStorage = JSON.parse(currentStorage);
                parsedStorage.admin = updatedAdmin;
                localStorage.setItem('osirix-user', JSON.stringify(parsedStorage));
              } catch (error) {
                console.error('❌ [AUTH STORE] Erreur mise à jour localStorage:', error);
              }
            }
          }
        } else {
          console.warn('⚠️ [AUTH STORE] Impossible de mettre à jour: type utilisateur ou données manquantes');
        }
      },

      // Vérifier le statut d'authentification au démarrage
      checkAuthStatus: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('osirix-token');
          const userData = localStorage.getItem('osirix-user');

          if (token && userData) {
            try {
              const parsedUser = JSON.parse(userData);
              set({
                isAuthenticated: true,
                token,
                user: parsedUser.user || null,
                doctor: parsedUser.doctor || null,
                admin: parsedUser.admin || null,
                userType: parsedUser.userType || null,
              });
            } catch (error) {
              console.error('❌ [AUTH STORE] Erreur parsing localStorage:', error);
              get().logout();
            }
          }
        }
      },
    }),
    {
      name: 'osirix-auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
        doctor: state.doctor,
        admin: state.admin,
        userType: state.userType,
      }),
    }
  )
);

// Hook pour obtenir les informations de l'utilisateur connecté
export const useCurrentUser = () => {
  const { user, doctor, admin, userType, isAuthenticated } = useAuthStore();

  const getCurrentUserData = () => {
    switch (userType) {
      case 'patient':
        return { currentUser: user, specificData: user };
      case 'doctor':
        return { currentUser: doctor, specificData: doctor };
      case 'admin':
        return { currentUser: admin, specificData: admin };
      default:
        return { currentUser: null, specificData: null };
    }
  };

  const { currentUser, specificData } = getCurrentUserData();
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : null;

  return {
    user: currentUser,
    patientData: userType === 'patient' ? user : null,
    doctorData: userType === 'doctor' ? doctor : null,
    adminData: userType === 'admin' ? admin : null,
    displayName,
    userType,
    isAuthenticated,
  };
};