const API_BASE_URL = 'http://localhost:3001';

// Types
export interface StaffRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  role: string;
}

export interface StaffLoginData {
  identifier: string; // Email ou Téléphone
  password: string;
}

export interface AuthResponse {
  token: string; // ✅ CORRIGÉ : access_token → token
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    gender: string;
  };
}

// Service Auth Staff
export const staffAuthService = {
  // Inscription personnel
  register: async (data: StaffRegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/staff/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'inscription");
    }

    return response.json();
  },

  // Connexion personnel
  login: async (data: StaffLoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/staff/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    return response.json();
  },

  // Récupérer le token stocké
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('staff_token');
    }
    return null;
  },

  // Récupérer l'utilisateur stocké
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('staff_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Déconnexion
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_user');
    }
  },
};