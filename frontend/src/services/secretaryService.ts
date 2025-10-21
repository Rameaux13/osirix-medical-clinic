import { staffAuthService } from './staffAuthService';

const API_BASE_URL = 'http://localhost:3001';

// Types
export interface Appointment {
  id: string;
  patientId: number;
  doctorId: number | null;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
  paymentMethod: string;
  isInsured: boolean;
  insuranceStatus: string;
  notes: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

   consultationType?: {  // ← AJOUTE CECI
    id: string;
    name: string;
    description?: string;
  } | null;

}

export interface Patient {
 id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  appointmentsCount?: number;
}

export interface LabOrderData {
  userId: string;
  examType: string;
  orderDate: string;
  instructions?: string;
  results?: string;
  resultFiles?: string[];
}

// Helper pour ajouter le token aux headers
const getAuthHeaders = () => {
  const token = staffAuthService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Service Secrétaire
export const secretaryService = {
  // ========== GESTION RDV ==========
  
  // Récupérer les RDV en attente
  getPendingAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments/secretary/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des RDV');
    }

    const data = await response.json();
    
    // ✅ CORRECTION : Vérifier si c'est un objet avec une clé "appointments"
    return Array.isArray(data) ? data : (data.appointments || []);
  },

  // Récupérer tous les RDV avec filtres
  getAllAppointments: async (filters?: {
    status?: string;
    date?: string;
    patient?: string;
  }): Promise<Appointment[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.date) queryParams.append('date', filters.date);
    if (filters?.patient) queryParams.append('patient', filters.patient);

    const url = `${API_BASE_URL}/appointments/secretary/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des RDV');
    }

    const data = await response.json();
    
    // 🔧 FIX CRITIQUE : Extraire data.appointments au lieu de retourner data directement
    return Array.isArray(data) ? data : (data.appointments || []);
  },

  // Confirmer un RDV
  confirmAppointment: async (
    appointmentId: string,
    notes?: string
  ): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la confirmation du RDV');
    }

    return response.json();
  },

  // Annuler un RDV
  cancelAppointment: async (
    appointmentId: string,
    reason: string
  ): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/cancel-by-secretary`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'annulation du RDV");
    }

    return response.json();
  },

  // Marquer un RDV comme terminé
  completeAppointment: async (
    appointmentId: string,
    notes?: string
  ): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la finalisation du RDV');
    }

    return response.json();
  },

  // ========== GESTION PATIENTS ==========

  // Récupérer la liste des patients avec recherche
  getPatientsList: async (search?: string): Promise<Patient[]> => {
    const url = `${API_BASE_URL}/users/secretary/patients${
    search ? `?search=${encodeURIComponent(search)}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la récupération des patients');
  }

  const data = await response.json();
  
  // ✅ EXTRACTION : Retourner seulement le tableau patients
  return data.patients || [];
},

  // Récupérer les détails d'un patient (si nécessaire)
  getPatientDetails: async (patientId: string): Promise<Patient> => {
    const response = await fetch(`${API_BASE_URL}/users/secretary/patients/${patientId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération du patient');
    }

    return response.json();
  },

  // ========== ENVOI ANALYSES ==========

  // Envoyer une analyse à un patient
  sendLabOrder: async (data: LabOrderData): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/lab-orders/secretary/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'envoi de l'analyse");
    }

    return response.json();
  },
// ========== STATISTIQUES DASHBOARD ==========
  getDashboardStats: async (): Promise<{
    pendingAppointments: number;
    todayAppointments: number;
    totalPatients: number;
    confirmedAppointments: number;
  }> => {
    const response = await fetch(`${API_BASE_URL}/appointments/secretary/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la récupération des stats');
    }

    return response.json();
  },

  // ========== UPLOAD FICHIER ==========

  // Upload un fichier vers le backend
  uploadLabResultFile: async (file: File): Promise<{ path: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = staffAuthService.getToken();

    const response = await fetch(`${API_BASE_URL}/lab-orders/upload-result`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'upload du fichier');
    }

    const data = await response.json();
    return {
      path: data.file.path,
      filename: data.file.filename,
    };
  },
};

