// ============================================================================
// OSIRIX CLINIQUE MÉDICAL - SERVICE PRESCRIPTIONS
// Service pour gestion des prescriptions côté frontend
// Créé le: 24/09/2025
// ============================================================================

import { apiClient } from '../lib/api';

// Types TypeScript
export interface MedicationItem {
  name: string;          // Nom du médicament
  dosage: string;        // Posologie (ex: "2 comprimés")
  frequency: string;     // Fréquence (ex: "matin et soir")
  duration: string;      // Durée (ex: "7 jours")
  instructions?: string; // Instructions spécifiques
}

export interface Prescription {
  id: string;
  consultationId: string;
  userId: string;
  doctorId: string;
  prescriptionDate: string;
  medications: string; // JSON string
  instructions?: string;
  pharmacyNotes?: string;
  isActive: boolean;
  createdAt: string;
  
  // Relations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    speciality?: string;
  };
  consultation?: {
    id: string;
    consultationDate: string;
    diagnosis?: string;
  };
}

export interface PrescriptionResponse {
  success: boolean;
  message: string;
  data: Prescription[];
  count: number;
  statusCode: number;
}

export interface SinglePrescriptionResponse {
  success: boolean;
  message: string;
  data: Prescription;
  statusCode: number;
}

// Service des prescriptions
class PrescriptionService {
  // ============================================================================
  // RÉCUPÉRER MES PRESCRIPTIONS (Patient)
  // ============================================================================
  async getMyPrescriptions(): Promise<PrescriptionResponse> {
    try {
      const response = await apiClient.get<PrescriptionResponse>('/prescriptions/my-prescriptions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des prescriptions');
    }
  }

  // ============================================================================
  // RÉCUPÉRER UNE PRESCRIPTION PAR ID
  // ============================================================================
  async getPrescriptionById(prescriptionId: string): Promise<SinglePrescriptionResponse> {
    try {
      const response = await apiClient.get<SinglePrescriptionResponse>(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Prescription introuvable');
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la prescription');
    }
  }

  // ============================================================================
  // PARSER LES MÉDICAMENTS JSON
  // ============================================================================
  parseMedications(medicationsJson: string): MedicationItem[] {
    try {
      return JSON.parse(medicationsJson);
    } catch (error) {
      return [];
    }
  }

  // ============================================================================
  // FORMATER LA DATE DE PRESCRIPTION
  // ============================================================================
  formatPrescriptionDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // ============================================================================
  // STATISTIQUES DES PRESCRIPTIONS
  // ============================================================================
  async getPrescriptionStats(): Promise<{
    totalPrescriptions: number;
    activePrescriptions: number;
    recentPrescriptions: Prescription[];
  }> {
    try {
      const response = await this.getMyPrescriptions();
      const prescriptions = response.data;

      return {
        totalPrescriptions: prescriptions.length,
        activePrescriptions: prescriptions.filter(p => p.isActive).length,
        recentPrescriptions: prescriptions.slice(0, 3), // 3 plus récentes
      };
    } catch (error) {
      return {
        totalPrescriptions: 0,
        activePrescriptions: 0,
        recentPrescriptions: [],
      };
    }
  }
}

// Export de l'instance unique du service
export default new PrescriptionService();