// src/lib/api.ts - Client Axios configuré pour ton backend NestJS

import axios, { AxiosResponse, AxiosError } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, ApiError } from '@/types/auth';

// Configuration de base d'Axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token JWT
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token du localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('osirix-token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // ✅ CORRECTION : On laisse passer l'erreur 401 SANS recharger la page
    // Le store et les composants géreront l'affichage de l'erreur
    
    // Seulement pour les autres routes protégées (pas login/register)
    if (error.response?.status === 401 && error.config?.url && 
        !error.config.url.includes('/auth/login') && 
        !error.config.url.includes('/auth/register')) {
      // Token expiré sur une route protégée
      if (typeof window !== 'undefined') {
        localStorage.removeItem('osirix-token');
        localStorage.removeItem('osirix-user');
        // Redirection douce sans rechargement
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authApi = {
  // Connexion
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Email ou mot de passe incorrect');
    }
  },

  // Inscription patient
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  // Vérifier le profil avec le token JWT
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

  // Test de connexion protégée
  testProtected: async () => {
    try {
      const response = await apiClient.get('/auth/test-protected');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.message || 'Erreur de test d\'authentification');
    }
  },
};

// Fonction utilitaire pour gérer les erreurs API
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Une erreur inattendue s\'est produite';
};

export default apiClient;