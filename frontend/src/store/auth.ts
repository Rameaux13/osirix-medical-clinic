// src/store/auth.ts - Version SANS console.log

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginRequest, RegisterRequest, User, Doctor, Admin } from '@/types/auth';
import { authApi, handleApiError } from '@/lib/api';

interface ExtendedAuthState extends AuthState {
  updateUser: (updatedUserData: Partial<User | Doctor | Admin>) => void;
}

export const useAuthStore = create<ExtendedAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      user: null,
      doctor: null,
      admin: null,
      userType: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);

          if (!response.token) {
            throw new Error('Token non reçu du serveur');
          }

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

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(userData);

          if (!response.token) {
            throw new Error('Token non reçu du serveur');
          }

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

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updatedUserData: Partial<User | Doctor | Admin>) => {
        const state = get();

        if (state.userType === 'patient' && state.user) {
          const updatedUser = { ...state.user, ...updatedUserData };
          set({ user: updatedUser });

          if (typeof window !== 'undefined') {
            const currentStorage = localStorage.getItem('osirix-user');
            if (currentStorage) {
              try {
                const parsedStorage = JSON.parse(currentStorage);
                parsedStorage.user = updatedUser;
                localStorage.setItem('osirix-user', JSON.stringify(parsedStorage));
              } catch (error) {
                // Erreur silencieuse
              }
            }
          }
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
                // Erreur silencieuse
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
                // Erreur silencieuse
              }
            }
          }
        }
      },

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

  const { currentUser } = getCurrentUserData();
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