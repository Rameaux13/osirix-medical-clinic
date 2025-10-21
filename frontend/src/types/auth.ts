// src/types/auth.ts - Types pour l'authentification

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  
  // Informations médicales (optionnelles à l'inscription)
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  speciality: string;
  licenseNumber: string;
  yearsOfExperience: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message?: string;
  token: string;  // ← CORRIGÉ : était access_token
  user?: User;
  doctor?: Doctor;
  admin?: Admin;
  userType: 'patient' | 'doctor' | 'admin';
}

export interface AuthState {
  // État de connexion
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Données utilisateur
  token: string | null;
  user: User | null;
  doctor: Doctor | null;
  admin: Admin | null;
  userType: 'patient' | 'doctor' | 'admin' | null;
  
  // Actions - CORRIGÉ : Promise<AuthResponse> au lieu de Promise<void>
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  checkAuthStatus: () => void;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}